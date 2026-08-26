import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { formatIDR, transactionStatusLabel } from "@/lib/billing";

export const metadata: Metadata = { title: "Billing & Transactions" };

function StatusBadge({ status }: { status: string }) {
  const label = transactionStatusLabel(status);
  const tone =
    label === "Paid"
      ? "bg-success/15 text-success border-success/30"
      : label === "Pending"
        ? "bg-gold/10 text-gold border-gold/30"
        : label === "Refunded"
          ? "bg-surface-2 text-muted border-line"
          : "bg-danger/15 text-danger border-danger/30";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {label}
    </span>
  );
}

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await getSupabaseServerClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-ivory"
        >
          <ArrowLeft className="h-3 w-3" /> Settings
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-ivory">
          Billing &amp; Transactions
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your payment history and invoices.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {(payments ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No transactions yet.{" "}
              <Link href="/pricing" className="text-gold hover:underline">
                Upgrade to Pro
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium">Amount</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {(payments ?? []).map((p) => {
                    const meta = (p.metadata ?? {}) as Record<string, unknown>;
                    return (
                      <tr key={p.id} className="border-b border-line/60">
                        <td className="py-2.5 pr-3 whitespace-nowrap text-muted">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 pr-3 text-ivory">
                          PortoTional Pro — 1 year
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          {formatIDR((meta.gross_amount as number) ?? p.amount)}
                        </td>
                        <td className="py-2.5 pr-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-2.5 text-right">
                          <Link
                            href={`/app/billing/${p.id}`}
                            className="text-xs font-medium text-gold hover:underline"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
