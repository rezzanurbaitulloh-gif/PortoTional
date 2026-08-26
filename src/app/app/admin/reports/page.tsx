import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ReportRow } from "@/types/database";
import { ResolveReportForm } from "./resolve-form";

export const metadata: Metadata = { title: "Admin · Reports" };

const STATUS_TONE: Record<string, string> = {
  open: "border-gold/30 bg-gold/10 text-gold",
  reviewing: "border-line bg-surface-2 text-ivory-dim",
  resolved: "border-success/30 bg-success/15 text-success",
  dismissed: "border-line bg-surface-2 text-muted",
};

export default async function AdminReportsPage() {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as ReportRow[];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Reports &amp; Moderation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No reports. The community is behaving.
            </p>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-line p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ivory">
                      {r.reason.replaceAll("_", " ")} —{" "}
                      <span className="font-mono text-xs text-gold">
                        /u/{r.target_username}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.target_type} · reported{" "}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[r.status] ?? ""}`}
                  >
                    {r.status}
                  </span>
                </div>
                {r.details ? (
                  <p className="mt-2 rounded-md bg-surface-2 p-3 text-xs leading-relaxed text-ivory-dim">
                    {r.details}
                  </p>
                ) : null}
                {r.status === "open" || r.status === "reviewing" ? (
                  <ResolveReportForm reportId={r.id} />
                ) : r.resolution_note ? (
                  <p className="mt-2 text-xs text-muted">
                    Resolution: {r.resolution_note}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
