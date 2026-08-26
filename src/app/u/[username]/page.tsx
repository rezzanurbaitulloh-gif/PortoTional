import { websiteUrl, websiteDisplayHost } from "@/lib/app-url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/public";
import {
  AVAILABILITY_LABELS,
  formatDateRange,
  PROFICIENCY_LABELS,
} from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";
import { PublicTracker, TrackedExternalLink } from "@/features/website/public-tracker";
import { DownloadCtaButton } from "@/features/profile/download-cta";
import { ReportProfileDialog } from "@/features/profile/report-dialog";
import { ProfileActions } from "@/features/profile/profile-actions";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { PublicProfileData } from "@/types/database";

async function getViewer(
  username: string,
): Promise<{ userId: string | null; saved: boolean; isOwner: boolean }> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { userId: null, saved: false, isOwner: false };

    const [{ data: me }, savedRes] = await Promise.all([
      supabase.from("profiles").select("username").eq("user_id", user.id).maybeSingle(),
      supabase.rpc("is_saved_professional", { target_username: username }),
    ]);
    return {
      userId: user.id,
      saved: Boolean(savedRes.data),
      isOwner: me?.username?.toLowerCase() === username.toLowerCase(),
    };
  } catch {
    return { userId: null, saved: false, isOwner: false };
  }
}

export const revalidate = 60;

async function getProfile(username: string): Promise<PublicProfileData | null> {
  const { data } = await supabaseAdmin.rpc("get_public_profile", {
    target_username: username,
  });
  return (data as PublicProfileData | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile || !profile.public) {
    return { title: "Profile not available", robots: { index: false } };
  }
  const title =
    profile.full_name
      ? `${profile.full_name}${profile.headline ? ` — ${profile.headline}` : ""}`
      : `@${profile.username}`;
  return {
    title,
    description:
      profile.summary?.slice(0, 160) ||
      profile.headline ||
      `${profile.full_name} on PortoTional`,
    openGraph: {
      title,
      description: profile.summary?.slice(0, 200) ?? "",
      images: profile.photo_url ? [{ url: profile.photo_url }] : undefined,
      type: "profile",
    },
    alternates: { canonical: `/u/${profile.username}` },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [profile, viewer] = await Promise.all([
    getProfile(username),
    getViewer(username),
  ]);

  if (!profile) notFound();

  // §6 — evidence-first: canonical showcases power Featured Work & gallery.
  const { data: showcaseRows } = await supabaseAdmin.rpc(
    "list_public_showcases",
    { target_username: username },
  );
  const showcases =
    (showcaseRows as Array<Record<string, unknown>> | null) ?? [];
  const featuredShowcases = showcases.filter((x) => x.featured);
  const shownShowcases = showcases.filter((x) => !x.featured);
  if (!profile.public) {
    return (
      <PrivateProfileState username={username} />
    );
  }

  const website = profile.website_id
    ? { id: profile.website_id, published: true }
    : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-obsidian-raised">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
          <Link
            href="/signup"
            className="text-xs text-muted hover:text-gold"
          >
            Create your own →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
          {profile.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photo_url}
              alt={profile.full_name ?? ""}
              className="h-24 w-24 rounded-full border border-line object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-line bg-surface text-2xl font-semibold text-gold">
              {(profile.full_name ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-ivory">{profile.full_name}</h1>
            <p className="mt-0.5 text-sm text-gold">{profile.headline}</p>
            <p className="mt-1 text-xs text-muted">
              {[profile.profession, profile.location]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {profile.availability ? (
              <Badge variant="success" className="mt-2">
                {AVAILABILITY_LABELS[profile.availability] ?? profile.availability}
                {profile.availability_message ? ` · ${profile.availability_message}` : ""}
              </Badge>
            ) : null}
            <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-ivory-dim">
              {profile.summary}
            </p>
          </div>
        </section>

        {viewer.userId && !viewer.isOwner ? (
          <div className="mt-6 flex justify-center sm:justify-start">
            <ProfileActions username={username} initiallySaved={viewer.saved} />
          </div>
        ) : null}

        {featuredShowcases.length > 0 ? (
          <Section title="Featured Work">
            <ul className="grid gap-4 sm:grid-cols-2">
              {featuredShowcases.map((sc) => (
                <li key={String(sc.id)}>
                  <ShowcaseCard sc={sc} />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {shownShowcases.length > 0 ? (
          <Section title="Showcase">
            <ul className="grid gap-4 sm:grid-cols-2" id="showcase-grid">
              {shownShowcases.map((sc) => (
                <li key={String(sc.id)} id={`showcase-${String(sc.id)}`}>
                  <ShowcaseCard sc={sc} />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {profile.skills && profile.skills.length > 0 ? (
          <Section title="Skills">
            <ul className="flex flex-wrap gap-2">
              {profile.skills.map((s, i) => {
                const evidence = showcases.filter((sc) =>
                  Array.isArray(sc.skills)
                    ? (sc.skills as string[]).some(
                        (k) => k.toLowerCase() === s.name.toLowerCase(),
                      )
                    : false,
                ).length;
                return (
                  <li key={i}>
                    <span
                      className="rounded-full border border-line px-3 py-1 text-xs text-ivory-dim"
                      title={[
                        PROFICIENCY_LABELS[s.proficiency_label] ?? "",
                        evidence > 0 ? `used in ${evidence} showcase${evidence > 1 ? "s" : ""}` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    >
                      {s.name}
                      {evidence > 0 ? (
                        <span className="ml-1 text-gold">· {evidence}</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11px] text-muted">
              Numbers show how many showcased projects use each skill.
            </p>
          </Section>
        ) : null}

        {profile.works && profile.works.length > 0 ? (
          <Section title="Featured Work">
            <ul className="grid gap-3 sm:grid-cols-2">
              {profile.works.map((w) => (
                <li key={w.id}>
                  <article className="card-lift h-full rounded-xl border border-line bg-surface p-4">
                    <h3 className="font-medium text-ivory">
                      {w.url ? (
                        <a href={w.url} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                          {w.title} ↗
                        </a>
                      ) : (
                        w.title
                      )}
                    </h3>
                    {w.role ? (
                      <p className="mt-0.5 text-xs italic text-muted">{w.role}</p>
                    ) : null}
                    <p className="mt-1.5 line-clamp-3 text-sm text-ivory-dim">
                      {w.description}
                    </p>
                    {w.tags?.length ? (
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-muted">
                        {w.tags.join(" · ")}
                      </p>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {profile.experiences && profile.experiences.length > 0 ? (
          <Section title="Experience">
            <ol className="space-y-4">
              {profile.experiences.map((e, i) => (
                <li key={i} className="relative border-l border-line pl-4">
                  <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-gold" aria-hidden />
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <h3 className="font-medium text-ivory">{e.title}</h3>
                    <span className="text-xs text-muted">
                      {formatDateRange(e.start_date, e.end_date, e.is_current)}
                    </span>
                  </div>
                  <p className="text-sm text-gold/90">
                    {[e.organization, e.location].filter(Boolean).join(" · ")}
                  </p>
                  {e.description ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ivory-dim">
                      {e.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {profile.educations && profile.educations.length > 0 ? (
          <Section title="Education">
            <ol className="space-y-3">
              {profile.educations.map((ed, i) => (
                <li key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <h3 className="font-medium text-ivory">{ed.institution}</h3>
                    <span className="text-xs text-muted">
                      {formatDateRange(ed.start_date, ed.end_date)}
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    {[ed.degree, ed.field].filter(Boolean).join(", ")}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {profile.certifications && profile.certifications.length > 0 ? (
          <Section title="Certifications">
            <ul className="space-y-2">
              {profile.certifications.map((c, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium text-ivory">
                    {c.credential_url ? (
                      <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                        {c.name} ↗
                      </a>
                    ) : (
                      c.name
                    )}
                  </span>
                  <span className="ml-2 text-muted">{c.issuer}</span>
                  {c.issue_date ? (
                    <span className="ml-2 text-xs text-muted">
                      · {new Date(c.issue_date).getFullYear()}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {profile.achievements && profile.achievements.length > 0 ? (
          <Section title="Achievements">
            <ul className="space-y-2">
              {profile.achievements.map((a, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium text-ivory">{a.title}</span>
                  {a.issuer ? <span className="ml-2 text-muted">{a.issuer}</span> : null}
                  {a.date ? (
                    <span className="ml-2 text-xs text-muted">
                      · {new Date(a.date).getFullYear()}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {profile.languages && profile.languages.length > 0 ? (
          <Section title="Languages">
            <ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-ivory-dim">
              {profile.languages.map((l, i) => (
                <li key={i}>
                  {l.language}{" "}
                  <span className="text-muted">· {PROFICIENCY_LABELS[l.proficiency] ?? l.proficiency}</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {profile.social_links && profile.social_links.length > 0 ? (
          <Section title="Links">
            <ul className="flex flex-wrap gap-3">
              {profile.social_links.map((l, i) => (
                <li key={i}>
                  <TrackedExternalLink
                    websiteId={website?.id ?? null}
                    href={l.url}
                    label={`social:${l.platform}`}
                    className="rounded-md border border-line px-3 py-1.5 text-xs text-ivory-dim hover:border-gold/50 hover:text-gold"
                  >
                    {l.platform}
                  </TrackedExternalLink>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <footer className="mt-14 border-t border-line pt-6 text-center">
          <DownloadCtaButton username={username} websiteId={website?.id ?? null} />
          <div className="mt-3">
            <ReportProfileDialog username={username} />
          </div>
          {website?.published ? (
            <p className="mt-3 text-xs text-muted">
              Personal site:{" "}
              <a
                href={websiteUrl(username)}
                className="text-gold hover:underline"
                rel="noopener noreferrer"
              >
                {websiteDisplayHost(username)}
              </a>
            </p>
          ) : null}
          <p className="mt-6">
            <Link href="/signup" className="text-xs text-muted hover:text-gold">
              Built with PortoTional &mdash; setup once, showcase everywhere.
            </Link>
          </p>
        </footer>
      </main>

      <PublicTracker websiteId={website?.id ?? null} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function PrivateProfileState({ username }: { username: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-4xl font-serif text-gold">Porto</p>
        <h1 className="mt-3 text-lg font-medium text-ivory">
          This profile is private
        </h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          @{username} has not made their professional profile public yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md border border-line px-4 py-2 text-sm text-ivory-dim hover:border-gold/40 hover:text-gold"
        >
          Learn about PortoTional
        </Link>
      </div>
    </div>
  );
}

function ShowcaseCard({ sc }: { sc: Record<string, unknown> }) {
  const cover = sc.coverUrl as string | null;
  const gallery = Array.isArray(sc.gallery)
    ? (sc.gallery as { url: string; caption?: string }[])
    : [];
  return (
    <article className="card-lift h-full overflow-hidden rounded-xl border border-line bg-surface">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={String(sc.title ?? "")}
          className="h-40 w-full border-b border-line object-cover"
        />
      ) : null}
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-ivory">{String(sc.title ?? "")}</h3>
          <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            {String(sc.type ?? "project")}
          </span>
        </div>
        {sc.role || sc.organization ? (
          <p className="text-xs italic text-muted">
            {[sc.role, sc.organization].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {sc.shortDescription ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-ivory-dim">
            {String(sc.shortDescription)}
          </p>
        ) : null}
        {Array.isArray(sc.skills) && (sc.skills as string[]).length ? (
          <p className="text-[11px] uppercase tracking-wide text-muted">
            {(sc.skills as string[]).slice(0, 4).join(" · ")}
          </p>
        ) : null}
        {gallery.length > 1 ? (
          <div className="flex gap-1.5 pt-1">
            {gallery.slice(0, 4).map((g, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={g.url}
                alt=""
                className="h-10 w-14 rounded border border-line object-cover"
              />
            ))}
          </div>
        ) : null}
        <div className="flex gap-3 pt-1 text-xs">
          {sc.githubUrl ? (
            <a href={String(sc.githubUrl)} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
              Code ↗
            </a>
          ) : null}
          {sc.demoUrl ? (
            <a href={String(sc.demoUrl)} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
              Live demo ↗
            </a>
          ) : null}
          {sc.resultsImpact ? (
            <span className="truncate text-muted" title={String(sc.resultsImpact)}>
              📈 {String(sc.resultsImpact)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
