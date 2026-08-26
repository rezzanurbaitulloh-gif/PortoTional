export function transactionStatusLabel(s: string): string {
  switch (s) {
    case "settlement":
    case "capture":
      return "Paid";
    case "pending":
      return "Pending";
    case "deny":
    case "failure":
      return "Failed";
    case "expire":
      return "Expired";
    case "cancel":
      return "Cancelled";
    case "refund":
      return "Refunded";
    default:
      return s;
  }
}

export type PaymentRow = {
  id: string;
  user_id: string;
  provider: string;
  provider_payment_id: string | null;
  amount: number | string;
  currency: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function invoiceNumber(paymentId: string): string {
  const d = new Date();
  return `PT-${d.getFullYear()}-${paymentId.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export function formatIDR(n: number | string): string {
  return `Rp ${Number(n ?? 0).toLocaleString("id-ID")}`;
}
