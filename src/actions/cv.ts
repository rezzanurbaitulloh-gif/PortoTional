"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { requireCurrentProfile, getPlan } from "@/services/identity";
import { planLimits } from "@/lib/constants";
import { logAudit } from "@/services/audit";
import type {
  ResumeRow,
  ResumeSectionRow,
  ResumeSectionType,
  ResumeVersionRow,
} from "@/types/database";

export async function listResumes(): Promise<ResumeRow[]> {
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("profile_id", profile.id)
    .order("updated_at", { ascending: false });
  return (data as ResumeRow[]) ?? [];
}

const createSchema = z.object({
  name: z.string().min(1).max(80).default("Untitled CV"),
  template_id: z.string().uuid().nullable().optional(),
  target_role: z.string().max(120).default(""),
});

export async function createResumeAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid CV details" };

    const plan = await getPlan(user.id);
    const supabase = await getSupabaseServerClient();
    const { count } = await supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id);
    if ((count ?? 0) >= planLimits(plan).maxResumes) {
      return {
        ok: false,
        error: `The ${plan} plan allows up to ${planLimits(plan).maxResumes} CVs. Upgrade to Pro for more.`,
      };
    }

    let templateId = parsed.data.template_id ?? null;
    if (!templateId) {
      const { data: tpl } = await supabase
        .from("templates")
        .select("id")
        .eq("type", "cv")
        .eq("slug", "classic-professional")
        .maybeSingle();
      templateId = tpl?.id ?? null;
    }

    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        profile_id: profile.id,
        name: parsed.data.name,
        template_id: templateId,
        target_role: parsed.data.target_role,
      })
      .select()
      .single();
    if (error) return { ok: false, error: error.message };

    const defaults: ResumeSectionType[] = [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
    ];
    await supabase.from("resume_sections").insert(
      defaults.map((section_type, idx) => ({
        resume_id: resume.id,
        section_type,
        sort_order: idx,
      })),
    );

    const bundleSnapshot = await buildResumeSnapshot(resume.id);
    await supabase.from("resume_versions").insert({
      resume_id: resume.id,
      snapshot: bundleSnapshot,
      version_number: 1,
      label: "Created",
    });

    await logAudit({
      actorUserId: user.id,
      action: "cv.create",
      entityId: resume.id,
    });
    revalidatePath("/app/cv");
    return { ok: true, id: resume.id };
  } catch {
    return { ok: false, error: "Failed to create the CV." };
  }
}

export async function buildResumeSnapshot(
  resumeId: string,
): Promise<Record<string, unknown>> {
  const supabase = await getSupabaseServerClient();
  const [resumeRes, sectionsRes] = await Promise.all([
    supabase.from("resumes").select("*").eq("id", resumeId).maybeSingle(),
    supabase
      .from("resume_sections")
      .select("*")
      .eq("resume_id", resumeId)
      .order("sort_order"),
  ]);
  const resume = resumeRes.data as ResumeRow | null;
  if (!resume) throw new Error("RESUME_NOT_FOUND");
  const profileId = resume.profile_id;

  const [experiences, educations, skills, works, certifications, profileRes] =
    await Promise.all([
      supabase.from("experiences").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("educations").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("skills").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("works").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("certifications").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase
        .from("profiles")
        .select("username, full_name, headline, summary, photo_url, profession_id, location")
        .eq("id", profileId)
        .maybeSingle(),
    ]);

  let professionName: string | null = null;
  const profId = (
    profileRes.data as { profession_id?: string | null } | null
  )?.profession_id;
  if (profId) {
    const { data: prof } = await supabase
      .from("professions")
      .select("name")
      .eq("id", profId)
      .maybeSingle();
    professionName = (prof?.name as string | undefined) ?? null;
  }

  return {
    resume,
    sections: sectionsRes.data ?? [],
    master: {
      profile: { ...(profileRes.data ?? {}), professionName },
      experiences: experiences.data ?? [],
      educations: educations.data ?? [],
      skills: skills.data ?? [],
      works: works.data ?? [],
      certifications: certifications.data ?? [],
    },
  };
}

const updateResumeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80).optional(),
  target_role: z.string().max(120).optional(),
  target_company: z.string().max(120).optional(),
  target_job_description: z.string().max(8000).optional(),
  language: z.enum(["en", "id"]).optional(),
  page_size: z.enum(["A4", "F4"]).optional(),
  template_id: z.string().uuid().nullable().optional(),
  settings: z
    .object({
      accentColor: z.string().max(20),
      showPhoto: z.boolean(),
      fontScale: z.number().min(0.8).max(1.3),
    })
    .partial()
    .optional(),
});

export async function updateResumeAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const parsed = updateResumeSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid update" };
    const { id, ...patch } = parsed.data;
    const supabase = await getSupabaseServerClient();

    const currentSettings = (
      await supabase
        .from("resumes")
        .select("settings")
        .eq("id", id)
        .eq("profile_id", profile.id)
        .maybeSingle()
    ).data?.settings as Record<string, unknown> | undefined;

    const updatePayload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (k === "settings" && typeof v === "object" && v !== null) {
        updatePayload.settings = { ...(currentSettings ?? {}), ...v };
      } else {
        updatePayload[k] = v;
      }
    }
    if (!Object.keys(updatePayload).length) return { ok: true };

    const { error } = await supabase
      .from("resumes")
      .update(updatePayload)
      .eq("id", id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/app/cv/${id}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save the CV." };
  }
}

const sectionsSchema = z.array(
  z.object({
    section_type: z.enum([
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
    ]),
    source_reference: z.array(z.string().uuid()).default([]),
    custom_content: z.record(z.string(), z.unknown()).nullable().default(null),
    is_visible: z.boolean().default(true),
  }),
);

export async function setResumeSectionsAction(
  resumeId: string,
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const parsed = sectionsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid sections" };
    const supabase = await getSupabaseServerClient();

    const { data: owned } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!owned) return { ok: false, error: "CV not found." };

    const rows = parsed.data.map((s, idx) => ({
      resume_id: resumeId,
      section_type: s.section_type,
      source_reference: s.source_reference,
      custom_content: s.custom_content,
      is_visible: s.is_visible,
      sort_order: idx,
    }));

    const { error: delErr } = await supabase
      .from("resume_sections")
      .delete()
      .eq("resume_id", resumeId);
    if (delErr) return { ok: false, error: delErr.message };

    const { error: insErr } = await supabase
      .from("resume_sections")
      .insert(rows);
    if (insErr) return { ok: false, error: insErr.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save sections." };
  }
}

export async function deleteResumeAction(
  resumeId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/cv");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete the CV." };
  }
}

export async function duplicateResumeAction(
  resumeId: string,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    const plan = await getPlan(user.id);
    const supabase = await getSupabaseServerClient();

    const { count } = await supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id);
    if ((count ?? 0) >= planLimits(plan).maxResumes) {
      return {
        ok: false,
        error: `Upgrade to Pro to keep more than ${planLimits(plan).maxResumes} CVs.`,
      };
    }

    const { data: source } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!source) return { ok: false, error: "CV not found." };

    const src = source as ResumeRow;
    const { data: copy, error } = await supabase
      .from("resumes")
      .insert({
        profile_id: profile.id,
        name: `${src.name} (copy)`,
        target_role: src.target_role,
        target_company: src.target_company,
        target_job_description: src.target_job_description,
        language: src.language,
        page_size: src.page_size,
        template_id: src.template_id,
        settings: src.settings,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    const { data: sections } = await supabase
      .from("resume_sections")
      .select("*")
      .eq("resume_id", resumeId)
      .order("sort_order");
    if (sections?.length) {
      await supabase.from("resume_sections").insert(
        (sections as ResumeSectionRow[]).map((s) => ({
          resume_id: copy.id,
          section_type: s.section_type,
          source_reference: s.source_reference,
          custom_content: s.custom_content,
          is_visible: s.is_visible,
          sort_order: s.sort_order,
        })),
      );
    }
    revalidatePath("/app/cv");
    return { ok: true, id: copy.id };
  } catch {
    return { ok: false, error: "Failed to duplicate the CV." };
  }
}

export async function listVersionsAction(
  resumeId: string,
): Promise<ResumeVersionRow[]> {
  await requireUser();
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();
  const { data: owned } = await supabase
    .from("resumes")
    .select("id")
    .eq("id", resumeId)
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!owned) return [];
  const { data } = await supabase
    .from("resume_versions")
    .select("*")
    .eq("resume_id", resumeId)
    .order("version_number", { ascending: false });
  return (data as ResumeVersionRow[]) ?? [];
}

export async function saveVersionAction(
  resumeId: string,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const snapshot = await buildResumeSnapshot(resumeId);

    const { count } = await supabase
      .from("resume_versions")
      .select("id", { count: "exact", head: true })
      .eq("resume_id", resumeId);

    await supabase.from("resume_versions").insert({
      resume_id: resumeId,
      snapshot,
      version_number: (count ?? 0) + 1,
      label: label.slice(0, 60),
    });

    if ((count ?? 0) > 50) {
      const { data: old } = await supabase
        .from("resume_versions")
        .select("id")
        .eq("resume_id", resumeId)
        .order("version_number", { ascending: true })
        .limit((count ?? 0) - 50);
      if (old?.length) {
        await supabase
          .from("resume_versions")
          .delete()
          .in(
            "id",
            old.map((r) => r.id),
          );
      }
    }
    void profile;
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save a version." };
  }
}
