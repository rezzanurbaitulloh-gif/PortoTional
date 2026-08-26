import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuditLogRow } from "@/types/database";

export const metadata: Metadata = { title: "Admin · Audit Logs" };

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.min(50, Number(sp.page ?? "1") || 1));
  const perPage = 30;

  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  const rows = (data ?? []) as AuditLogRow[];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-line text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5">
              <span className="font-mono text-xs text-muted">
                {new Date(r.created_at).toLocaleString()}
              </span>
              <span className="font-medium text-gold">{r.action}</span>
              <span className="text-xs text-muted">
                actor {r.actor_user_id ? `${r.actor_user_id.slice(0, 8)}…` : "system"}
              </span>
              {r.entity_type ? (
                <span className="text-xs text-muted">
                  target {r.entity_type}
                  {r.entity_id ? ` ${String(r.entity_id).slice(0, 8)}…` : ""}
                </span>
              ) : null}
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="py-6 text-center text-muted">No audit entries yet.</li>
          ) : null}
        </ul>
      </CardContent>
    </Card>
  );
}
