import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Globe,
  Lightbulb,
  TriangleAlert,
} from "lucide-react";
import { requireCurrentProfile, getIdentityBundle, getPlan } from "@/services/identity";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { computeIdentityCompletion } from "@/lib/completion";
import { checkExperienceConsistency } from "@/lib/consistency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { websiteUrl, websiteDisplayHost } from "@/lib/app-url";
import type { ResumeRow, WebsiteRow } from "@/types/database";
import type { ExperienceRow } from "@/types/database";

export default async function DashboardPage() {
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();

  const [bundle, resumesRes, websiteRes] = await Promise.all([
    getIdentityBundle(profile.id),
    supabase
      .from("resumes")
      .select("*")
      .eq("profile_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("websites")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle(),
  ]);

  const resumes = (resumesRes.data as ResumeRow[]) ?? [];
  const website = (websiteRes.data as WebsiteRow | null) ?? null;
  const completion = computeIdentityCompletion({
    profile,
    experiences: bundle.experiences,
    educations: bundle.educations,
    skills: bundle.skills,
    works: bundle.works,
    certifications: bundle.certifications,
  });

  const issues = checkExperienceConsistency(
    bundle.experiences.map((e) => e as ExperienceRow),
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile.full_name.split(" ")[0] || profile.username;

  const nextIncomplete = completion.items.find((i) => !i.done);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ivory">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your Master Identity is the source of truth — everything below is
          generated from it.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-56 flex-1">
              <p className="text-sm font-medium text-ivory">
                Professional Identity
              </p>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-valuenow={completion.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gold transition-all"
                  style={{ width: `${completion.percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {completion.percent}% complete ·{" "}
                {completion.items.filter((i) => !i.done).length} items left
              </p>
            </div>
            {nextIncomplete ? (
              <Button asChild variant="outline" size="sm">
                <Link href={nextIncomplete.href ?? "/app/identity"}>
                  Continue setup: {nextIncomplete.label}
                  <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Badge variant="success">Identity complete</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {issues.length > 0 ? (
        <Card className="border-gold/30 bg-gold/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TriangleAlert className="h-4 w-4 text-gold" /> Consistency check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {issues.slice(0, 4).map((issue, i) => (
              <p key={i} className="text-sm text-ivory-dim">
                • {issue.message}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gold" /> Recent CVs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resumes.length === 0 ? (
              <EmptyState
                title="No CV yet"
                description="Generate your first ATS-ready CV from your identity."
                action={
                  <Button size="sm" asChild>
                    <Link href="/app/cv/new">Create CV</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {resumes.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/app/cv/${r.id}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-white/5"
                    >
                      <span className="truncate text-ivory">{r.name}</span>
                      <span className="text-xs text-muted">{r.page_size}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/app/cv"
                    className="inline-flex items-center gap-1 px-2 pt-1 text-xs text-gold hover:underline"
                  >
                    All CVs <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-gold" /> Public Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.visibility.profile ? (
              <>
                <a
                  href={`/u/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate rounded-md px-2 py-1.5 font-mono text-xs text-gold hover:bg-white/5"
                >
                  /u/{profile.username}
                </a>
                <p className="px-2 pt-2 text-xs text-success">Visible</p>
              </>
            ) : (
              <>
                <p className="px-2 py-1.5 text-sm text-muted">
                  Your profile is private.
                </p>
                <Button size="sm" variant="secondary" asChild className="mx-2 mt-2">
                  <Link href="/app/showcase/profile">Publish profile</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-gold" /> Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            {website?.published ? (
              <>
                <a
                  href={websiteUrl(website.subdomain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate rounded-md px-2 py-1.5 font-mono text-xs text-gold hover:bg-white/5"
                >
                  {websiteDisplayHost(website.subdomain)}
                </a>
                <p className="px-2 pt-2 text-xs text-success">Published</p>
              </>
            ) : (
              <>
                <p className="px-2 py-1.5 text-sm text-muted">
                  Not published yet.
                </p>
                <Button size="sm" variant="secondary" asChild className="mx-2 mt-2">
                  <Link href="/app/showcase/website">Set up website</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-gold" /> Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-ivory-dim">
          {!profile.summary.trim() && (
            <p>
              • Write a professional summary with{" "}
              <Link href="/app/ai" className="text-gold hover:underline">
                AI Studio → Generate summary
              </Link>
              . It only uses facts from your identity.
            </p>
          )}
          {bundle.works.length === 0 && (
            <p>
              • Add one project or work sample to strengthen your portfolio and
              public profile.
            </p>
          )}
          {bundle.skills.length < 5 && (
            <p>• List at least five skills — recruiters and ATS both scan for them.</p>
          )}
          {resumes.length > 0 && (
            <p>
              • Tailor a CV to a specific job in{" "}
              <Link href={`/app/cv/${resumes[0].id}`} className="text-gold hover:underline">
                the builder
              </Link>{" "}
              to raise its keyword relevance score.
            </p>
          )}
        </CardContent>
      </Card>

      {(await getPlan((await requireCurrentProfile()).user_id)) === "free" ? (
        <p className="text-center text-sm text-muted">
          Need more CVs, premium templates and a personal website?{" "}
          <Link href="/pricing" className="text-gold hover:underline">
            See Pro →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
