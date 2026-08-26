import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatIDR } from "@/lib/billing";

export const metadata: Metadata = { title: "Admin · Transactions" };

const FILTERS = [
  { key: "all", label: "All", statuses: null },
  { key: "pending", label: "Pending", statuses: ["pending"] },
  { key: "successful", label: "Successful", statuses: ["settlement", "capture"] },
  { key: "failed", label: "Failed / Expired / Cancelled", statuses: ["deny", "cancel", "expire"] },
  { key: "refunded", label: "Refunded", statuses: ["refund"] },
] as const;

type Payment = {
  id: string;
  user_id: string;
  provider_payment_id: string | null;
  amount: number | string;
  currency: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type ProfileLite = { user_id: string; username: string; full_name: string };

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filter =
    FILTERS.find((f) => f.key === (sp.filter ?? "all")) ?? FILTERS[0];
  const q = (sp.q ?? "").slice(0, 80);

  const admin = getSupabaseAdminClient();
  let query = admin.from("payments").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter.statuses) query = query.in("status", [...filter.statuses]);
  const { data: payments } = await query;
  let rows = (payments ?? []) as Payment[];

  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.provider_payment_id?.toLowerCase().includes(needle) ||
        p.id.toLowerCase().includes(needle),
    );
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, username, full_name")
    .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const profileMap = new Map(
    ((profiles ?? []) as ProfileLite[]).map((p) => [p.user_id, p]),
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>Transactions</span>
          <nav className="flex flex-wrap gap-1" aria-label="Transaction filters">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={`/app/admin/transactions?filter=${f.key}`}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  f.key === filter.key
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-line text-muted hover:text-ivory"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </nav>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">User</th>
                <th className="py-2 pr-3 font-medium">Gateway ref</th>
                <th className="py-2 pr-3 font-medium">Amount</th>
                <th className="py-2 pr-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const prof = profileMap.get(p.user_id);
                return (
                  <tr key={p.id} className="border-b border-line/60">
                    <td className="whitespace-nowrap py-2.5 pr-3 text-muted">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="max-w-[180px] truncate py-2.5 pr-3">
                      {prof ? (
                        <Link
                          href={`/u/${prof.username}`}
                          target="_blank"
                          className="text-gold hover:underline"
                        >
                          {prof.username}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-muted">
                          {p.user_id.slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate py-2.5 pr-3 font-mono text-xs text-ivory-dim">
                      {p.provider_payment_id ?? "—"}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-3">
                      {formatIDR((p.metadata?.gross_amount as number) ?? p.amount)}
                    </td>
                    <td className="py-2.5">{p.status}</td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No transactions in this view.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
