import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/shared/print-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import {
  formatIDR,
  invoiceNumber,
  transactionStatusLabel,
  type PaymentRow,
} from "@/lib/billing";

export const metadata: Metadata = { title: "Transaction Detail" };

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await getSupabaseServerClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!payment) notFound();

  const p = payment as PaymentRow;
  const meta = p.metadata ?? {};
  const paid = ["settlement", "capture"].includes(p.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/app/billing"
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-ivory"
        >
          <ArrowLeft className="h-3 w-3" /> Billing &amp; Transactions
        </Link>
        <PrintButton />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            Transaction Detail
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                paid
                  ? "border-success/30 bg-success/15 text-success"
                  : p.status === "pending"
                    ? "border-gold/30 bg-gold/10 text-gold"
                    : "border-danger/30 bg-danger/15 text-danger"
              }`}
            >
              {transactionStatusLabel(p.status)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 text-sm">
          <Row label="Invoice number" value={invoiceNumber(p.id)} mono />
          <Row label="Transaction ID" value={p.provider_payment_id ?? "—"} mono />
          <Row label="Product" value="PortoTional Pro — 1 year" />
          <Row label="Amount" value={formatIDR((meta.gross_amount as number) ?? p.amount)} />
          <Row label="Payment gateway" value={p.provider === "midtrans" ? "Midtrans" : p.provider} />
          <Row label="Payment method" value={(meta.payment_type as string) ?? "—"} />
          <Row label="Transaction date" value={new Date(p.created_at).toLocaleString()} />
          {(meta.transaction_time as string) ? (
            <Row label="Settled at" value={String(meta.transaction_time)} />
          ) : null}
          {paid ? (
            <p className="pt-3 text-xs text-muted">
              This invoice is generated from verified gateway data. Keep it for
              your records.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Printable invoice */}
      <Card id="invoice">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Invoice</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex items-start justify-between border-b border-line pb-4">
            <div>
              <p className="font-semibold text-ivory">PortoTional</p>
              <p className="text-xs text-muted">portotional.vercel.app</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-muted">{invoiceNumber(p.id)}</p>
              <p className="text-xs text-muted">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <table className="mt-4 w-full">
            <tbody>
              <tr className="border-b border-line/60">
                <td className="py-2">PortoTional Pro subscription (12 months)</td>
                <td className="py-2 text-right">{formatIDR((meta.gross_amount as number) ?? p.amount)}</td>
              </tr>
              <tr className="border-b border-line/60">
                <td className="py-2 text-muted">Discount</td>
                <td className="py-2 text-right text-muted">{formatIDR(0)}</td>
              </tr>
              <tr className="border-b border-line/60">
                <td className="py-2 text-muted">Tax</td>
                <td className="py-2 text-right text-muted">Included</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-ivory">Total</td>
                <td className="py-3 text-right font-semibold text-ivory">
                  {formatIDR((meta.gross_amount as number) ?? p.amount)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">
            Status: {transactionStatusLabel(p.status)} · Paid via{" "}
            {p.provider === "midtrans" ? "Midtrans" : p.provider}
            {(meta.payment_type as string) ? ` (${meta.payment_type})` : ""}.
          </p>
        </CardContent>
      </Card>

      <style>{`@media print { body * { visibility: hidden; } #invoice, #invoice * { visibility: visible; } #invoice { position: absolute; inset: 0; } [data-print] { display: none; } }`}</style>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <p className="flex items-start justify-between gap-6">
      <span className="shrink-0 text-muted">{label}</span>
      <span className={`text-right ${mono ? "break-all font-mono text-xs" : ""}`}>
        {value}
      </span>
    </p>
  );
}
