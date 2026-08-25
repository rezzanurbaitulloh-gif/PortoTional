import { createHash } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export function midtransBaseUrl(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
}

export function midtransConfigured(): boolean {
  const key = process.env.MIDTRANS_SERVER_KEY ?? "";
  return key.startsWith("Mid-server-");
}

export async function createSnapTransaction(input: {
  orderId: string;
  grossAmount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
}): Promise<{ token: string; redirectUrl: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!midtransConfigured()) {
    throw new Error("Midtrans is not configured.");
  }
  const auth = Buffer.from(`${serverKey}:`).toString("base64");
  const res = await fetch(`${midtransBaseUrl()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.grossAmount,
      },
      customer_details: {
        first_name: input.customerName || "PortoTional User",
        email: input.customerEmail,
      },
      item_details: [
        {
          id: "porto-pro-monthly",
          name: "PortoTional Pro — 1 month",
          price: input.grossAmount,
          quantity: 1,
        },
      ],
      callbacks: {
        finish: `${process.env.APP_URL}/settings?payment=finish`,
        error: `${process.env.APP_URL}/settings?payment=error`,
        pending: `${process.env.APP_URL}/settings?payment=pending`,
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midtrans error ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { token: string; redirect_url: string };
  return { token: data.token, redirectUrl: data.redirect_url };
}

export function verifyMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
  const expected = createHash("sha512")
    .update(
      `${input.orderId}${input.statusCode}${input.grossAmount}${serverKey}`,
    )
    .digest("hex");
  return expected === input.signatureKey;
}

export async function grantProSubscription(userId: string) {
  const admin = getSupabaseAdminClient();
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

  const { error: subErr } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      provider: "midtrans",
      plan: "pro",
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (subErr) throw new Error(`subscription update failed: ${subErr.message}`);

  const features = [
    "premium_website",
    "advanced_ai",
    "analytics",
    "premium_templates",
    "three_d_identity",
  ];
  for (const feature of features) {
    const { error } = await admin.from("entitlements").upsert(
      {
        user_id: userId,
        feature,
        value: true,
        expires_at: end.toISOString(),
      },
      { onConflict: "user_id,feature" },
    );
    if (error) throw new Error(`entitlement ${feature} failed: ${error.message}`);
  }
}
