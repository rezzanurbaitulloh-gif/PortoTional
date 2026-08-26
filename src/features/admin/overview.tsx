import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";

type Metric = { label: string; value: string };

export async function AdminOverview() {
  const admin = getSupabaseAdminClient();

  const [usersRes, profilesRes, paymentsRes, aiRes] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("payments")
      .select("status, metadata, amount")
      .in("status", ["settlement", "capture"]),
    admin.from("ai_generations").select("id", { count: "exact", head: true }),
  ]);

  const paid = (paymentsRes.data ?? []) as {
    status: string;
    metadata: Record<string, unknown>;
    amount: number | string;
  }[];
  const revenue = paid.reduce(
    (sum, p) => sum + Number(p.metadata?.gross_amount ?? p.amount ?? 0),
    0,
  );

  const userTotal = (
    usersRes.data as { total?: number } | null
  )?.total ?? 0;

  const metrics: Metric[] = [
    {
      label: "Users",
      value: String(userTotal),
    },
    { label: "Profiles", value: String(profilesRes.count ?? 0) },
    { label: "AI generations", value: String(aiRes.count ?? 0) },
    {
      label: "Pro revenue",
      value: `Rp ${revenue.toLocaleString("id-ID")}`,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-widest text-muted">
              {m.label}
            </p>
            <p className="mt-1 text-xl font-semibold text-ivory">{m.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
