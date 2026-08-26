import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { buildResumeSnapshot } from "@/actions/cv";
import { buildResumeHtml } from "@/features/cv/document-string";
import { htmlToPdf } from "@/lib/pdf/render";
import type { ResumeDoc, ResumeSectionType } from "@/features/cv/document";
import type {
  CertificationRow,
  EducationRow,
  ExperienceRow,
  ProfileRow,
  ResumeRow,
  ResumeSectionRow,
  SkillRow,
  TemplateRow,
  WorkRow,
} from "@/types/database";

function iso(d: string | null): string | null {
  return d ? d.slice(0, 10) : null;
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const body = (await req.json()) as { resumeId?: string; pageSize?: string };
    if (!body.resumeId) {
      return NextResponse.json({ error: "resumeId is required." }, { status: 400 });
    }
    const snapshot = (await buildResumeSnapshot(body.resumeId)) as {
      resume: ResumeRow;
      sections: ResumeSectionRow[];
      master: {
        profile: Partial<ProfileRow> & { professionName?: string | null };
        experiences: ExperienceRow[];
        educations: EducationRow[];
        skills: SkillRow[];
        works: WorkRow[];
        certifications: CertificationRow[];
      };
    };

    const supabase = await getSupabaseServerClient();
    let templateSlug = "classic-professional";
    if (snapshot.resume.template_id) {
      const { data: tpl } = await supabase
        .from("templates")
        .select("slug")
        .eq("id", snapshot.resume.template_id)
        .maybeSingle();
      templateSlug =
        ((tpl as TemplateRow | null)?.slug as string) ?? templateSlug;
    }

    const doc: ResumeDoc = {
      pageSize: (["A4", "F4", "LETTER"].includes(body.pageSize ?? "")
        ? body.pageSize
        : snapshot.resume.page_size) as "A4" | "F4" | "LETTER",
      accentColor: snapshot.resume.settings?.accentColor ?? "#0B0C10",
      showPhoto: snapshot.resume.settings?.showPhoto ?? true,
      fontScale: snapshot.resume.settings?.fontScale ?? 1,
      templateSlug,
      language: snapshot.resume.language,
      profile: {
        fullName: snapshot.master.profile.full_name ?? "",
        headline: snapshot.master.profile.headline ?? "",
        summaryOverride:
          (snapshot.sections.find(
            (s) =>
              s.section_type === "summary" &&
              s.custom_content &&
              typeof s.custom_content.text === "string",
          )?.custom_content?.text as string | undefined) ?? null,
        masterSummary: snapshot.master.profile.summary ?? "",
        photoUrl: snapshot.master.profile.photo_url ?? null,
        location: snapshot.master.profile.location ?? "",
        profession: snapshot.master.profile.professionName ?? null,
      },
      sections: snapshot.sections
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({
          type: s.section_type as ResumeSectionType,
          visible: s.is_visible,
        })),
      experiences: snapshot.master.experiences.map((e) => ({
        id: e.id,
        organization: e.organization,
        title: e.title,
        description: e.description,
        startDate: iso(e.start_date),
        endDate: iso(e.end_date),
        isCurrent: e.is_current,
        location: e.location,
      })),
      educations: snapshot.master.educations.map((ed) => ({
        id: ed.id,
        institution: ed.institution,
        degree: ed.degree,
        field: ed.field,
        description: "",
        startDate: iso(ed.start_date),
        endDate: iso(ed.end_date),
      })),
      skills: snapshot.master.skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiencyLabel: s.proficiency_label,
      })),
      works: snapshot.master.works.map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        role: w.role,
        url: w.url,
        tags: w.tags,
        startDate: iso(w.start_date),
        endDate: iso(w.end_date),
      })),
      certifications: snapshot.master.certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        credentialId: c.credential_id,
        issueDate: iso(c.issue_date),
      })),
    };

    const html = buildResumeHtml(doc);
    const pdf = await htmlToPdf(html, { pageSize: doc.pageSize });

    const fileName = `${(snapshot.resume.name || "cv")
      .replace(/[^a-z0-9\-_ ]/gi, "")
      .trim()
      .replace(/\s+/g, "-")}-${doc.pageSize}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[pdf]", err);
    return NextResponse.json(
      {
        error:
          "Your CV was saved, but PDF generation failed. You can retry without losing your changes.",
        // Temporary diagnostics — remove after PDF production issue is resolved.
        detail: String((err as Error)?.message ?? err).slice(0, 200),
      },
      { status: 502 },
    );
  }
}
