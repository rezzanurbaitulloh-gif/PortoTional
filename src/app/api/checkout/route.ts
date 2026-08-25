import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import {
  createSnapTransaction,
  midtransConfigured,
} from "@/lib/payments/midtrans";
import { PRO_PRICE_IDR } from "@/lib/constants";

const bodySchema = z.object({ plan: z.literal("pro") });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    if (!bodySchema.safeParse(body).success) {
      return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
    }
    if (!midtransConfigured()) {
      return NextResponse.json(
        { error: "Payments are temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    const supabase = await getSupabaseServerClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const orderId = `PORTO-PRO-${user.id.slice(0, 8)}-${Date.now()}`;
    const grossAmount = PRO_PRICE_IDR;

    await supabase.from("payments").insert({
      user_id: user.id,
      provider: "midtrans",
      provider_payment_id: orderId,
      amount: grossAmount,
      currency: "IDR",
      status: "pending",
      metadata: { plan: "pro", period: "monthly" },
    }).then(({ error }) => {
      if (error) throw new Error(`Could not record the payment: ${error.message}`);
    });

    const snap = await createSnapTransaction({
      orderId,
      grossAmount,
      customerId: user.id,
      customerName:
        (profile?.full_name as string) || user.email?.split("@")[0] || "",
      customerEmail: user.email ?? "",
    });

    return NextResponse.json(snap);
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed." },
      { status: 502 },
    );
  }
}
