import { getCurrentProfile, getIdentityBundle } from "@/services/identity";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkExperienceConsistency } from "@/lib/consistency";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/features/identity/profile-form";
import { PhotoUploader } from "@/features/identity/photo-uploader";
import type { ExperienceRow, ProfileRow } from "@/types/database";

const SECTION_ROUTE_BY_SLUG: Record<string, { href: string; label: string }> = {
  about: { href: "/app/identity", label: "About" },
  experience: { href: "/app/identity/experience", label: "Experience" },
  teachingexperience: { href: "/app/identity/experience", label: "Teaching experience" },
  education: { href: "/app/identity/education", label: "Education" },
  skills: { href: "/app/identity/skills", label: "Skills" },
  subjects: { href: "/app/identity/skills", label: "Subjects" },
  projects: { href: "/app/identity/work", label: "Projects" },
  selectedwork: { href: "/app/identity/work", label: "Selected work" },
  featuredwork: { href: "/app/identity/work", label: "Featured work" },
  portfolio: { href: "/app/identity/work", label: "Portfolio" },
  gallery: { href: "/app/identity/work", label: "Gallery" },
  publications: { href: "/app/identity/work", label: "Publications" },
  certifications: { href: "/app/identity/certifications", label: "Certifications" },
  achievements: { href: "/app/identity/achievements", label: "Achievements" },
  languages: { href: "/app/identity/languages", label: "Languages" },
};

export default async function IdentityOverviewPage() {
  const profile = (await getCurrentProfile()) as ProfileRow;
  if (!profile) return null;

  const supabase = await getSupabaseServerClient();
  const [{ data: profession }, bundleRes] = await Promise.all([
    profile.profession_id
      ? supabase
          .from("professions")
          .select("name, configuration")
          .eq("id", profile.profession_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    getIdentityBundle(profile.id),
  ]);
  const bundle = bundleRes;
  const issues = checkExperienceConsistency(
    bundle.experiences.map((e) => e as ExperienceRow),
  );

  const recommended = (
    ((profession?.configuration as Record<string, unknown> | null)?.recommendedSections as string[]) ?? []
  )
    .map((slug) => SECTION_ROUTE_BY_SLUG[slug.toLowerCase()])
    .filter(Boolean)
    .filter(
      (r, i, arr) =>
        arr.findIndex((x) => x.href === r.href) === i,
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ivory">My Identity</h1>
        <p className="mt-1 text-sm text-muted">
          This is your Master Professional Identity — the single source of truth
          behind every CV, your public profile and your website.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <PhotoUploader photoUrl={profile.photo_url} fullName={profile.full_name} />
        </CardContent>
      </Card>

      {profession && recommended.length > 0 ? (
        <Card className="border-gold/25 bg-gold/[0.03]">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-ivory">
              Recommended for {String(profession.name)}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {recommended.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-soft hover:bg-gold/10"
                  >
                    {r.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-5 pt-5">
          <ProfileForm
            initial={{
              full_name: profile.full_name,
              headline: profile.headline,
              summary: profile.summary,
              location: profile.location,
              availability: profile.availability,
              availability_message: profile.availability_message ?? "",
              summaryProfileForAi: {
                fullName: profile.full_name,
                headline: profile.headline,
                location: profile.location,
                experiences: bundle.experiences.slice(0, 6),
                education: bundle.educations.slice(0, 4),
                skills: bundle.skills.map((s) => s.name).slice(0, 20),
                certifications:
                  bundle.certifications.map((c) => c.name).slice(0, 10),
              },
            }}
          />
        </CardContent>
      </Card>

      {issues.length > 0 ? (
        <Card className="border-gold/30 bg-gold/[0.03]">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-ivory">Timeline check</p>
            <ul className="mt-2 space-y-1.5">
              {issues.map((issue, i) => (
                <li key={i} className="text-sm text-ivory-dim">
                  • {issue.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
