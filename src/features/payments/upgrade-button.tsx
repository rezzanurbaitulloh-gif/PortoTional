"use client";

import { useState } from "react";
import { loadScript } from "@/lib/payments/snap";
import { Button } from "@/components/ui/button";
import { Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";

export function UpgradeButton() {
  const [busy, setBusy] = useState(false);

  async function startCheckout() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadScript();
      const snap = window.snap;
      if (!snap) throw new Error("Payment window is unavailable right now.");
      snap.pay(data.token, {
        onSuccess: () => toast.success("Payment received — Pro is active!"),
        onPending: () => toast.info("Payment pending — finish it to activate Pro."),
        onError: () => toast.error("Payment failed. No charge was made."),
        onClose: () => toast.info("You can finish the payment anytime from Settings."),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={startCheckout} disabled={busy}>
      {busy ? <Loader2 className="animate-spin" /> : <Rocket />}
      Upgrade to Pro — Rp 49.000/month
    </Button>
  );
}
