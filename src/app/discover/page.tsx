import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { supabaseAdmin } from "@/lib/supabase/public";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Discover Professionals",
  description:
    "Find professionals by name, skill, profession and location on PortoTional — the AI-powered professional identity platform.",
};

type DiscoverRow = {
  username: string;
  full_name: string;
  headline: string;
  photo_url: string | null;
  location: string | null;
  profession_name: string | null;
  top_skills: string[];
  availability: string;
  relevance: number;
  total: number;
};

const PAGE_SIZE = 12;

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  // §78 — feature_discover gates this page (never authorization).
  const discoverEnabled = await isFeatureEnabled("feature_discover");

  const q = (sp.q ?? "").slice(0, 80);
  const location = (sp.location ?? "").slice(0, 60);
  const skill = (sp.skill ?? "").slice(0, 60);
  const profession = (sp.profession ?? "").slice(0, 60);
  const page = Math.max(1, Math.min(20, Number(sp.page ?? "1") || 1));

  let rows: DiscoverRow[] = [];
  let total = 0;
  try {
    const { data, error } = await supabaseAdmin.rpc("search_public_profiles", {
      q: q || null,
      p_location: location || null,
      p_skill: skill || null,
      p_profession: profession || null,
      page_size: PAGE_SIZE,
      page_offset: (page - 1) * PAGE_SIZE,
    });
    if (!error && data) {
      rows = data as DiscoverRow[];
      total = rows[0]?.total ?? rows.length;
    }
  } catch {
    // fall through to empty state
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(q || location || skill || profession);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted transition-colors hover:text-ivory"
          >
            Pricing
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {!discoverEnabled ? (
          <div className="rounded-xl border border-line bg-surface p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-gold" aria-hidden />
            <p className="mt-4 text-sm font-medium text-ivory">
              Discovery is temporarily unavailable.
            </p>
            <p className="mt-1 text-xs text-muted">
              Public profiles are still accessible via their direct links.
            </p>
          </div>
        ) : (
        <>
        <h1 className="text-3xl font-semibold tracking-tight text-ivory">
          Discover Professionals
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Search public professional profiles by name, skill, profession or
          location. Only profiles their owners made public appear here.
        </p>

        <form className="mt-6 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]" action="/discover" method="get">
          <div>
            <label htmlFor="d-q" className="sr-only">Search</label>
            <Input id="d-q" name="q" defaultValue={q} placeholder="Name, headline…" />
          </div>
          <div>
            <label htmlFor="d-skill" className="sr-only">Skill</label>
            <Input id="d-skill" name="skill" defaultValue={skill} placeholder="Skill (e.g. Figma)" />
          </div>
          <div>
            <label htmlFor="d-loc" className="sr-only">Location</label>
            <Input id="d-loc" name="location" defaultValue={location} placeholder="Location" />
          </div>
          <Button type="submit" aria-label="Search professionals">
            <Search /> Search
          </Button>
        </form>

        {rows.length > 0 ? (
          <>
            <p className="mt-8 text-xs text-muted" role="status">
              {total} professional{total === 1 ? "" : "s"} found
              {hasFilters ? " for your filters" : ""}
            </p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => (
                <li key={r.username}>
                  <Link
                    href={`/u/${r.username}`}
                    className="group block h-full rounded-xl border border-line bg-surface p-5 transition-colors hover:border-gold/40"
                  >
                    <div className="flex items-center gap-3">
                      {r.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.photo_url}
                          alt=""
                          className="h-12 w-12 rounded-full border border-line object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface-2 text-lg font-semibold text-gold"
                        >
                          {(r.full_name || r.username).slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ivory">
                          {r.full_name || r.username}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {r.headline || r.profession_name || "Professional"}
                        </p>
                      </div>
                    </div>
                    {r.top_skills?.length ? (
                      <p className="mt-3 truncate text-xs text-ivory-dim">
                        {r.top_skills.join(" · ")}
                      </p>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {r.location ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <MapPin className="h-3 w-3" /> {r.location}
                        </span>
                      ) : (
                        <span />
                      )}
                      {r.availability === "open_to_work" ? (
                        <Badge variant="success">Open to work</Badge>
                      ) : null}
                    </div>
                    <span className="mt-4 inline-block text-xs font-medium text-gold group-hover:underline">
                      View profile →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {totalPages > 1 ? (
              <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 ? (
                  <Link
                    href={{ query: { ...sp, page: String(page - 1) } }}
                    className="rounded-md border border-line px-3 py-1.5 text-xs text-ivory-dim hover:border-line-strong"
                  >
                    Previous
                  </Link>
                ) : null}
                <span className="px-2 text-xs text-muted">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={{ query: { ...sp, page: String(page + 1) } }}
                    className="rounded-md border border-line px-3 py-1.5 text-xs text-ivory-dim hover:border-line-strong"
                  >
                    Next
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <div className="mt-12 rounded-xl border border-line bg-surface p-10 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-4 text-sm font-medium text-ivory">
              {hasFilters
                ? "No public profiles match your search yet."
                : "No public profiles yet."}
            </p>
            <p className="mt-1 text-xs text-muted">
              Be the first — publish your professional profile and appear here.
            </p>
            <Button asChild className="mt-4">
              <Link href="/signup">Create your profile</Link>
            </Button>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}
