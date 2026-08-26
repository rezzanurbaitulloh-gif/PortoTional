import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  verifyMidtransSignature,
  grantProSubscription,
} from "@/lib/payments/midtrans";
import { notifyUser } from "@/services/audit";

const webhookSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.enum([
    "capture",
    "settlement",
    "pending",
    "deny",
    "cancel",
    "expire",
    "refund",
  ]),
  fraud_status: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const d = parsed.data;

  const valid = verifyMidtransSignature({
    orderId: d.order_id,
    statusCode: d.status_code,
    grossAmount: d.gross_amount,
    signatureKey: d.signature_key,
  });
  if (!valid) {
    return NextResponse.json(
      { error: "signature verification failed" },
      { status: 403 },
    );
  }

  const admin = getSupabaseAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id, user_id, status, metadata")
    .eq("provider_payment_id", d.order_id)
    .maybeSingle();
  if (!payment) {
    return NextResponse.json({ received: true, note: "unknown order" });
  }

  await admin
    .from("payments")
    .update({ status: d.transaction_status })
    .eq("id", payment.id);

  if (
    (d.transaction_status === "settlement" ||
      (d.transaction_status === "capture" &&
        ["accept", "Challenge"].includes(d.fraud_status ?? "accept"))) &&
    payment.status !== "settlement"
  ) {
    await grantProSubscription(payment.user_id);
    await notifyUser({
      userId: payment.user_id,
      type: "payment",
      title: "Payment successful — Pro is active",
      body: "Your PortoTional Pro subscription is now active. Premium templates, personal website and advanced AI are unlocked.",
      actionUrl: "/app/settings",
      entityId: payment.id,
    });
  }

  if (["deny", "cancel", "expire"].includes(d.transaction_status)) {
    await notifyUser({
      userId: payment.user_id,
      type: "payment",
      title:
        d.transaction_status === "deny" ? "Payment failed" : "Payment cancelled",
      body: `Your payment (${d.order_id}) was ${d.transaction_status}. You can retry anytime from Settings.`,
      actionUrl: "/app/settings",
      entityId: payment.id,
    });
  }

  if (["deny", "cancel", "expire"].includes(d.transaction_status)) {
    await admin
      .from("subscriptions")
      .update({ plan: "free", status: "expired" })
      .eq("user_id", payment.user_id);
  }

  return NextResponse.json({ received: true });
}
