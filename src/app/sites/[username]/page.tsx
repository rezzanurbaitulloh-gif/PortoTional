import { websiteUrl } from "@/lib/app-url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  AVAILABILITY_LABELS,
  formatDateRange,
  PROFICIENCY_LABELS,
} from "@/lib/utils";
import type {
  PublicProfileData,
  TemplateRow,
  WebsiteRow,
} from "@/types/database";

export const revalidate = 60;

interface SiteData {
  profile: PublicProfileData;
  website: WebsiteRow | null;
  sections: { section_type: string; is_visible: boolean; sort_order: number }[];
  template: TemplateRow | null;
  showcases: Record<string, unknown>[];
}

async function loadSite(username: string): Promise<SiteData | null> {
  const db = getSupabaseAdminClient();
  const rpc = await db.rpc("get_public_profile", {
    target_username: username,
  });
  const profile = (rpc.data as PublicProfileData | null) ?? null;
  if (!profile || !profile.public) return null;

  const siteRes = await db
    .from("websites")
    .select("*")
    .eq("subdomain", username)
    .maybeSingle();
  const website = (siteRes.data as WebsiteRow | null) ?? null;

  // §8 — the website consumes the same canonical showcase data. No re-entry.
  let showcases: Record<string, unknown>[] = [];
  {
    const { data: profRow } = await db
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    const scRes = await db
      .from("showcases")
      .select(
        "id,type,title,short_description,cover_url,gallery,role,organization,skills,tags,start_date,end_date,github_url,demo_url,results_impact,case_study,featured,show_on_website",
      )
      .eq("profile_id", profRow?.id ?? "")
      .eq("visibility", "public")
      .order("sort_order");
    showcases = ((scRes.data ?? []) as Record<string, unknown>[]).filter(
      (x) => x.show_on_website !== false,
    );
  }

  let template: TemplateRow | null = null;
  if (website?.template_id) {
    const tpl = await db
      .from("templates")
      .select("*")
      .eq("id", website.template_id)
      .maybeSingle();
    template = (tpl.data as TemplateRow | null) ?? null;
  }

  return { profile, website, sections: [], template, showcases };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const site = await loadSite(username);
  if (!site?.website?.published) {
    return { title: "Website not found", robots: { index: false } };
  }
  const seoTitle = site.website.seo_configuration?.title;
  const seoDesc = site.website.seo_configuration?.description;
  const title =
    seoTitle ||
    `${site.profile.full_name ?? username}${site.profile.headline ? ` — ${site.profile.headline}` : ""}`;
  return {
    title,
    description:
      seoDesc || site.profile.summary?.slice(0, 160) || title,
    robots: { index: site.website.seo_configuration?.index !== false },
    alternates: { canonical: websiteUrl(username) },
    openGraph: {
      title,
      description: seoDesc ?? "",
      images: site.profile.photo_url ? [{ url: site.profile.photo_url }] : undefined,
    },
  };
}

export default async function PersonalWebsitePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const site = await loadSite(username);

  if (!site || !site.website || !site.website.published) {
    notFound();
  }

  const p = site.profile;
  const cfg = site.website.configuration;
  const accent = cfg.color ?? "#D4AF37";
  const darkTheme = ["corporate-premium", "showcase-bold"].includes(cfg.theme);
  const serifDisplay = cfg.theme === "corporate-premium";

  const hasWorks = (p.works?.length ?? 0) > 0;
  const hasExperience = (p.experiences?.length ?? 0) > 0;

  return (
    <div
      className="min-h-screen"
      style={{
        background: darkTheme ? "#101114" : "#F8F9FA",
        color: darkTheme ? "#F8F9FA" : "#1A1C20",
        ["--accent" as never]: accent,
      }}
    >
      {/* HERO */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-24 text-center">
        {p.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photo_url}
            alt={p.full_name ?? ""}
            className={`mx-auto h-28 w-28 object-cover ${
              serifDisplay ? "rounded-full" : "rounded-2xl"
            } border`}
            style={{ borderColor: `${accent}55` }}
          />
        ) : null}
        <h1
          className={`mt-6 text-4xl font-semibold tracking-tight sm:text-5xl ${
            serifDisplay ? "font-serif" : ""
          }`}
        >
          {p.full_name}
        </h1>
        <p className="mt-2 text-lg" style={{ color: accent }}>
          {cfg.heroTagline || p.headline}
        </p>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed opacity-80">
          {p.summary}
        </p>
        {p.availability ? (
          <span
            className="mt-5 inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: `${accent}22`, color: accent }}
          >
            ● {AVAILABILITY_LABELS[p.availability]}
          </span>
        ) : null}
      </section>

      {/* ABOUT */}
      {(p.skills?.length ?? 0) > 0 ? (
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <SectionHeading dark={darkTheme}>About</SectionHeading>
          <ul className="flex flex-wrap justify-center gap-2">
            {p.skills!.map((s, i) => (
              <li
                key={i}
                className="rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: darkTheme ? "#2c303a" : "#d9dde3", opacity: 0.85 }}
                title={PROFICIENCY_LABELS[s.proficiency_label] ?? ""}
              >
                {s.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* FEATURED PROJECTS + SHOWCASE (§8 canonical data) */}
      {site.showcases.length > 0 ? (
        <>
          {site.showcases.filter((x) => x.featured).length > 0 ? (
            <section className="mx-auto max-w-4xl px-6 pb-16">
              <SectionHeading dark={darkTheme}>Featured Projects</SectionHeading>
              <div className="grid gap-5 sm:grid-cols-2">
                {site.showcases.filter((x) => x.featured).slice(0, 4).map((sc) => (
                  <WebsiteShowcaseCard key={String(sc.id)} sc={sc} accent={accent} dark={darkTheme} expanded />
                ))}
              </div>
            </section>
          ) : null}
          {site.showcases.filter((x) => !x.featured).length > 0 ? (
            <section className="mx-auto max-w-4xl px-6 pb-16">
              <SectionHeading dark={darkTheme}>Showcase</SectionHeading>
              <div className="grid gap-5 sm:grid-cols-2">
                {site.showcases.filter((x) => !x.featured).slice(0, 8).map((sc) => (
                  <WebsiteShowcaseCard key={String(sc.id)} sc={sc} accent={accent} dark={darkTheme} />
                ))}
              </div>
            </section>
          ) : null}
          {/* GALLERY — aggregated showcase media */}
          {(() => {
            const shots = site.showcases.flatMap((sc) =>
              Array.isArray(sc.gallery) ? (sc.gallery as { url: string }[]) : [],
            );
            if (!shots.length) return null;
            return (
              <section className="mx-auto max-w-4xl px-6 pb-16">
                <SectionHeading dark={darkTheme}>Gallery</SectionHeading>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {shots.slice(0, 8).map((g, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={g.url}
                      alt=""
                      loading="lazy"
                      className="h-28 w-full rounded-lg border object-cover"
                      style={{ borderColor: darkTheme ? "#2c303a" : "#e2e5ea" }}
                    />
                  ))}
                </div>
              </section>
            );
          })()}
        </>
      ) : hasWorks ? (
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <SectionHeading dark={darkTheme}>Selected Work</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            {p.works!.slice(0, 6).map((w) => (
              <article
                key={w.id}
                className="card-lift rounded-xl border p-5"
                style={{ borderColor: darkTheme ? "#2c303a" : "#e2e5ea" }}
              >
                <h3 className="font-medium">
                  {w.url ? (
                    <a href={w.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: accent }}>
                      {w.title} ↗
                    </a>
                  ) : (
                    w.title
                  )}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-sm opacity-75">{w.description}</p>
                {w.tags?.length ? (
                  <p className="mt-2 text-[11px] uppercase tracking-wide opacity-50">
                    {w.tags.join(" · ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* EXPERIENCE */}
      {hasExperience ? (
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <SectionHeading dark={darkTheme}>Experience</SectionHeading>
          <ol className="space-y-6">
            {p.experiences!.map((e, i) => (
              <li key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <h3 className="font-medium">{e.title}</h3>
                  <span className="text-xs opacity-60">
                    {formatDateRange(e.start_date, e.end_date, e.is_current)}
                  </span>
                </div>
                <p className="text-sm" style={{ color: accent }}>
                  {[e.organization, e.location].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* EDUCATION */}
      {(p.educations?.length ?? 0) > 0 ? (
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <SectionHeading dark={darkTheme}>Education</SectionHeading>
          <ol className="space-y-3">
            {p.educations!.map((ed, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{ed.institution}</span>
                <span className="opacity-70">
                  {" "}
                  — {[ed.degree, ed.field].filter(Boolean).join(", ")}
                </span>
                <span className="ml-2 text-xs opacity-50">
                  {formatDateRange(ed.start_date, ed.end_date)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* CONTACT */}
      <section className="border-t py-16 text-center" style={{ borderColor: darkTheme ? "#2c303a" : "#e2e5ea" }}>
        <SectionHeading dark={darkTheme}>Contact</SectionHeading>
        {(p.social_links?.length ?? 0) > 0 ? (
          <ul className="flex flex-wrap justify-center gap-3">
            {p.social_links!.map((l, i) => (
              <li key={i}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-block rounded-md border px-4 py-2 text-sm transition-colors hover:opacity-100 opacity-80"
                  style={{ borderColor: `${accent}66`, color: accent }}
                >
                  {l.platform}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm opacity-60">Reach out via any link on my profile.</p>
        )}
        <Link
          href={`/u/${p.username}`}
          className="mt-8 inline-block text-xs opacity-40 hover:opacity-80"
        >
          View professional profile →
        </Link>
      </section>

      <footer className="pb-10 text-center">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-widest opacity-30 hover:opacity-60"
          style={{ letterSpacing: "0.18em" }}
        >
          Built with PortoTional
        </Link>
      </footer>
    </div>
  );
}

function SectionHeading({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark: boolean;
}) {
  return (
    <h2
      className="mb-6 text-center text-xs font-semibold uppercase"
      style={{ color: "inherit", opacity: 0.45, letterSpacing: "0.22em" }}
      data-dark={dark}
    >
      {children}
    </h2>
  );
}

function WebsiteShowcaseCard({
  sc,
  accent,
  dark,
  expanded = false,
}: {
  sc: Record<string, unknown>;
  accent: string;
  dark: boolean;
  expanded?: boolean;
}) {
  const cs = sc.case_study as Record<string, string> | null;
  const hasCaseStudy = Boolean(cs && Object.values(cs).some((v) => v?.trim()));
  return (
    <article
      className="card-lift overflow-hidden rounded-xl border"
      style={{ borderColor: dark ? "#2c303a" : "#e2e5ea" }}
    >
      {sc.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={String(sc.cover_url)}
          alt={String(sc.title ?? "")}
          loading="lazy"
          className="h-44 w-full border-b object-cover"
          style={{ borderColor: dark ? "#2c303a" : "#e2e5ea" }}
        />
      ) : null}
      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">{String(sc.title ?? "")}</h3>
          <span
            className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide opacity-70"
            style={{ borderColor: dark ? "#2c303a" : "#e2e5ea" }}
          >
            {String(sc.type ?? "project")}
          </span>
        </div>
        {sc.role || sc.organization ? (
          <p className="text-xs italic opacity-60">
            {[sc.role, sc.organization].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        <p className="line-clamp-3 text-sm opacity-75">
          {String(sc.short_description ?? "")}
        </p>
        {Array.isArray(sc.skills) && (sc.skills as string[]).length ? (
          <p className="text-[11px] uppercase tracking-wide opacity-50">
            {(sc.skills as string[]).slice(0, 4).join(" · ")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-1 text-xs">
          {sc.github_url ? (
            <a href={String(sc.github_url)} target="_blank" rel="noopener noreferrer nofollow" style={{ color: accent }}>
              Code ↗
            </a>
          ) : null}
          {sc.demo_url ? (
            <a href={String(sc.demo_url)} target="_blank" rel="noopener noreferrer nofollow" style={{ color: accent }}>
              Live ↗
            </a>
          ) : null}
        </div>
        {hasCaseStudy ? (
          <details className="mt-2 rounded-lg border p-3" style={{ borderColor: dark ? "#2c303a" : "#e8eaee" }}>
            <summary className="cursor-pointer text-xs font-medium" style={{ color: accent }}>
              Read case study
            </summary>
            <dl className="mt-3 space-y-2.5 text-xs leading-relaxed opacity-85">
              {(
                [
                  ["Problem", "problem"],
                  ["Goals", "goals"],
                  ["Process", "process"],
                  ["Solution", "solution"],
                  ["Key features", "features"],
                  ["Lessons learned", "lessons"],
                ] as const
              ).map(([label, key]) =>
                cs?.[key]?.trim() ? (
                  <div key={key}>
                    <dt className="font-semibold">{label}</dt>
                    <dd className="whitespace-pre-wrap">{cs[key]}</dd>
                  </div>
                ) : null,
              )}
              {sc.results_impact ? (
                <div>
                  <dt className="font-semibold">Results</dt>
                  <dd>{String(sc.results_impact)}</dd>
                </div>
              ) : null}
            </dl>
          </details>
        ) : expanded && sc.results_impact ? (
          <p className="pt-1 text-xs font-medium" style={{ color: accent }}>
            📈 {String(sc.results_impact)}
          </p>
        ) : null}
      </div>
    </article>
  );
}
