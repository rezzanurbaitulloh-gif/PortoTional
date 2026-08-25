import { notFound, redirect } from "next/navigation";
import { getCurrentProfile, getIdentityBundle, getPlan } from "@/services/identity";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CvBuilder } from "@/features/cv/builder";
import type { BuilderSection } from "@/features/cv/store";
import type {
  CertificationRow,
  EducationRow,
  ExperienceRow,
  ProfileRow,
  ResumeSectionRow,
  ResumeRow,
  SkillRow,
  TemplateRow,
  WorkRow,
} from "@/types/database";

export default async function CvBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = (await getCurrentProfile()) as ProfileRow;
  if (!profile) redirect("/login");

  const supabase = await getSupabaseServerClient();
  const [{ data: resume }, bundle] = await Promise.all([
    supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .maybeSingle(),
    getIdentityBundle(profile.id),
  ]);

  if (!resume) notFound();
  const r = resume as ResumeRow;

  const [sectionsRes, templatesRes, profNameRes] = await Promise.all([
    supabase
      .from("resume_sections")
      .select("*")
      .eq("resume_id", id)
      .order("sort_order"),
    supabase.from("templates").select("*").eq("type", "cv").eq("is_active", true),
    r.template_id
      ? supabase.from("templates").select("slug").eq("id", r.template_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  let professionName: string | null = null;
  if (profile.profession_id) {
    const { data: prof } = await supabase
      .from("professions")
      .select("name")
      .eq("id", profile.profession_id)
      .maybeSingle();
    professionName = (prof?.name as string | undefined) ?? null;
  }
  void profNameRes;

  const sections: BuilderSection[] = ((sectionsRes.data ?? []) as ResumeSectionRow[]).map(
    (s) => ({
      section_type: s.section_type,
      source_reference: s.source_reference ?? [],
      custom_content: s.custom_content ?? null,
      is_visible: s.is_visible,
    }),
  );

  const templates = (templatesRes.data ?? []) as TemplateRow[];
  const user = (await supabase.auth.getUser()).data.user;
  const plan = await getPlan(user!.id);

  return (
    <div className="mx-auto max-w-[1400px]">
      <CvBuilder
        resumeId={id}
        plan={plan}
        templates={templates}
        initialSections={sections}
        initialFields={{
          name: r.name,
          target_role: r.target_role,
          target_company: r.target_company,
          target_job_description: r.target_job_description,
          language: r.language,
          page_size: r.page_size,
          template_id: r.template_id,
        }}
        initialSettings={
          r.settings ?? { accentColor: "#D4AF37", showPhoto: true, fontScale: 1 }
        }
        master={{
          fullName: profile.full_name,
          headline: profile.headline,
          summary: profile.summary,
          photoUrl: profile.photo_url,
          location: profile.location,
          profession: professionName,
          experiences: bundle.experiences.map((e) => e as ExperienceRow),
          educations: bundle.educations.map((e) => e as EducationRow),
          skills: bundle.skills.map((e) => e as SkillRow),
          works: bundle.works.map((e) => e as WorkRow),
          certifications: bundle.certifications.map((e) => e as CertificationRow),
        }}
      />
    </div>
  );
}
