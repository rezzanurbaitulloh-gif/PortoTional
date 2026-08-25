"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { requireCurrentProfile } from "@/services/identity";
import { logAudit } from "@/services/audit";

const optionalDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: "Invalid date",
  });

export const experienceSchema = z.object({
  organization: z.string().min(1).max(120),
  title: z.string().min(1).max(120),
  description: z.string().max(4000).default(""),
  start_date: optionalDate,
  end_date: optionalDate,
  is_current: z.boolean().default(false),
  location: z.string().max(160).default(""),
});

export const educationSchema = z.object({
  institution: z.string().min(1).max(160),
  degree: z.string().max(120).default(""),
  field: z.string().max(120).default(""),
  description: z.string().max(2000).default(""),
  start_date: optionalDate,
  end_date: optionalDate,
});

export const skillSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().max(60).default(""),
  proficiency_label: z.string().max(40).default(""),
});

export const workSchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().max(3000).default(""),
  role: z.string().max(100).default(""),
  url: z.union([z.string().url().max(500), z.literal(""), z.null()]).optional(),
  image_url: z
    .union([z.string().max(600), z.literal(""), z.null()])
    .optional(),
  start_date: optionalDate,
  end_date: optionalDate,
  tags: z.array(z.string().max(40)).max(12).default([]),
});

export const achievementSchema = z.object({
  title: z.string().min(1).max(160),
  issuer: z.string().max(120).default(""),
  date: optionalDate,
  description: z.string().max(1500).default(""),
});

export const certificationSchema = z.object({
  name: z.string().min(1).max(160),
  issuer: z.string().max(120).default(""),
  credential_id: z.string().max(120).default(""),
  credential_url: z
    .union([z.string().url().max(500), z.literal(""), z.null()])
    .optional(),
  issue_date: optionalDate,
  expiry_date: optionalDate,
});

export const languageSchema = z.object({
  language: z.string().min(1).max(50),
  proficiency: z.enum([
    "native",
    "fluent",
    "professional_working",
    "limited_working",
    "basic",
  ]),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(40),
  url: z.string().url().max(500),
});

type EntityKey =
  | "experiences"
  | "educations"
  | "skills"
  | "works"
  | "achievements"
  | "certifications"
  | "languages"
  | "social_links";

const SCHEMAS: Record<EntityKey, z.ZodTypeAny> = {
  experiences: experienceSchema,
  educations: educationSchema,
  skills: skillSchema,
  works: workSchema,
  achievements: achievementSchema,
  certifications: certificationSchema,
  languages: languageSchema,
  social_links: socialLinkSchema,
};

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === "" && k.endsWith("_url") ? null : v;
  }
  return out as T;
}

export async function saveContentItemAction(
  entity: EntityKey,
  id: string | null,
  input: unknown,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    const schema = SCHEMAS[entity];
    if (!schema) return { ok: false, error: "Unknown entity" };
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }
    const values = clean(parsed.data as Record<string, unknown>);
    const supabase = await getSupabaseServerClient();

    if (id) {
      const { error } = await supabase
        .from(entity)
        .update(values)
        .eq("id", id)
        .eq("profile_id", profile.id);
      if (error) return { ok: false, error: error.message };
      await logAudit({ actorUserId: user.id, action: `update.${entity}`, entityId: id });
    } else {
      const { data: lastRow } = await supabase
        .from(entity)
        .select("sort_order")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextOrder =
        ((lastRow?.sort_order as number | undefined) ?? -1) + 1;
      const { data: inserted, error } = await supabase
        .from(entity)
        .insert({ ...values, profile_id: profile.id, sort_order: nextOrder })
        .select("id")
        .single();
      if (error) return { ok: false, error: error.message };
      await logAudit({ actorUserId: user.id, action: `create.${entity}`, entityId: String(inserted!.id) });
      revalidatePath("/app/dashboard");
      return { ok: true, id: inserted!.id };
    }
    revalidatePath("/app/dashboard");
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error && err.message === "UNAUTHENTICATED"
          ? "Please sign in again."
          : err instanceof Error
            ? err.message
            : "Something went wrong while saving.",
    };
  }
}

export async function deleteContentItemAction(
  entity: EntityKey,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from(entity)
      .delete()
      .eq("id", id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete item." };
  }
}

export async function toggleContentVisibilityAction(
  entity: EntityKey,
  id: string,
  visibility: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from(entity)
      .update({ visibility })
      .eq("id", id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update visibility." };
  }
}

export async function reorderContentAction(
  entity: EntityKey,
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const updates = orderedIds.map((id, idx) => ({ id, sort_order: idx }));
    for (const u of updates) {
      await supabase
        .from(entity)
        .update({ sort_order: u.sort_order })
        .eq("id", u.id)
        .eq("profile_id", profile.id);
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to reorder." };
  }
}

const profileUpdateSchema = z.object({
  full_name: z.string().max(120).default(""),
  headline: z.string().max(140).default(""),
  summary: z.string().max(4000).default(""),
  location: z.string().max(160).default(""),
  profession_id: z.string().uuid().nullable().optional(),
  availability: z
    .enum(["open_to_work", "open_to_opportunities", "not_available"])
    .default("open_to_work"),
  availability_message: z.string().max(280).nullable().optional(),
});

export async function updateProfileAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const parsed = profileUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("profiles")
      .update(parsed.data)
      .eq("id", profile.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save profile." };
  }
}

const visibilitySchema = z.record(z.string(), z.boolean());

export async function updateProfileVisibilityAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const parsed = visibilitySchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid visibility" };
    const merged = { ...profile.visibility, ...parsed.data };
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("profiles")
      .update({ visibility: merged })
      .eq("id", profile.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/showcase/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save visibility settings." };
  }
}

const onboardingSchema = z.object({
  username: z
    .string()
    .regex(/^[a-z0-9][a-z0-9_-]{1,38}$/, "Use lowercase letters, numbers, dashes."),
  profession_id: z.string().uuid({ message: "Pick your profession." }),
  full_name: z.string().max(120).default(""),
  headline: z.string().max(140).default(""),
});

export async function completeOnboardingAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    const parsed = onboardingSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }
    const supabase = await getSupabaseServerClient();

    if (
      parsed.data.username.toLowerCase() !== profile.username.toLowerCase()
    ) {
      const { data: available } = await supabase.rpc("is_username_available", {
        candidate: parsed.data.username,
      });
      if (!available) {
        return { ok: false, error: "That username is already taken." };
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: parsed.data.username.toLowerCase(),
        profession_id: parsed.data.profession_id,
        full_name: parsed.data.full_name,
        headline: parsed.data.headline,
        onboarding_completed: true,
      })
      .eq("id", profile.id);
    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorUserId: user.id,
      action: "onboarding.complete",
      entityType: "profile",
      entityId: profile.id,
    });
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to complete setup." };
  }
}
