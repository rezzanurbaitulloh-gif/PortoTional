import { requireCurrentProfile, getPlan } from "@/services/identity";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { BarChart3, Lock } from "lucide-react";
import Link from "next/link";
import type { WebsiteRow } from "@/types/database";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();
  const user = (await supabase.auth.getUser()).data.user;
  const plan = user ? await getPlan(user.id) : "free";

  if (plan !== "pro") {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={<Lock />}
          title="Analytics is a Pro feature"
          description="Upgrade to see visitors, page views, downloads and traffic sources for your personal website — privacy-friendly, no cookies for tracking people."
          action={
            <Button asChild>
              <Link href="/pricing">See Pro</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { data: website } = await supabase
    .from("websites")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!website) {
    return (
      <EmptyState
        icon={<BarChart3 />}
        title="No website yet"
        description="Set up your personal website first, then analytics will appear here."
      />
    );
  }
  const siteId = (website as Pick<WebsiteRow, "id">).id;

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, path, referrer, device, created_at, anonymous_session_id")
    .eq("website_id", siteId)
    .gte("created_at", since);

  const rows = events ?? [];
  const views = rows.filter((e) => e.event_type === "page_view");
  const uniqueSessions = new Set(views.map((v) => v.anonymous_session_id)).size;
  const downloads = rows.filter((e) => e.event_type === "resume_download").length;
  const ctaClicks = rows.filter((e) => e.event_type === "cta_click").length;

  const byPath = new Map<string, number>();
  for (const v of views) byPath.set(v.path || "/", (byPath.get(v.path || "/") ?? 0) + 1);
  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const byRef = new Map<string, number>();
  for (const v of views) {
    let host = "direct";
    try {
      if (v.referrer) host = new URL(v.referrer).hostname;
    } catch {}
    byRef.set(host, (byRef.get(host) ?? 0) + 1);
  }
  const topRefs = [...byRef.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const byDevice = new Map<string, number>();
  for (const v of views) byDevice.set(v.device || "desktop", (byDevice.get(v.device || "desktop") ?? 0) + 1);

  function Stat({ label, value }: { label: string; value: number | string }) {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gold">{value}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ivory">Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          Last 30 days · privacy-friendly: no personal data is stored.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Page views" value={views.length} />
        <Stat label="Unique visitors" value={uniqueSessions} />
        <Stat label="Resume downloads" value={downloads} />
        <Stat label="CTA clicks" value={ctaClicks} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top pages</CardTitle>
          </CardHeader>
          <CardContent>
            {topPaths.length === 0 ? (
              <p className="text-sm text-muted">No data yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {topPaths.map(([path, n]) => (
                  <li key={path} className="flex justify-between text-sm">
                    <span className="truncate font-mono text-xs text-ivory-dim">{path}</span>
                    <span className="text-muted">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Traffic sources</CardTitle>
          </CardHeader>
          <CardContent>
            {topRefs.length === 0 ? (
              <p className="text-sm text-muted">No data yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {topRefs.map(([ref, n]) => (
                  <li key={ref} className="flex justify-between text-sm">
                    <span className="truncate text-ivory-dim">{ref}</span>
                    <span className="text-muted">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {byDevice.size === 0 ? (
              <p className="text-sm text-muted">No data yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {[...byDevice.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([device, n]) => (
                    <li key={device} className="flex justify-between text-sm capitalize">
                      <span className="text-ivory-dim">{device}</span>
                      <span className="text-muted">{n}</span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
