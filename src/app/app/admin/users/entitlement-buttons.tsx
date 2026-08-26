"use client";

import { useTransition } from "react";
import { Crown, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

/** §19 — manual Pro grant/revoke with mandatory §22 reason. Payments untouched. */
export function EntitlementButtons({
  userId,
  hasPro,
}: {
  userId: string;
  hasPro: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {hasPro ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          title="Revoke Pro"
          onClick={() => {
            const reason = window.prompt("Reason for revoking Pro?");
            if (!reason || reason.trim().length < 3) {
              if (reason !== null) alert("A reason of at least 3 characters is required.");
              return;
            }
            startTransition(async () => {
              const { revokeProAction } = await import("@/actions/admin");
              const res = await revokeProAction({ userId, reason });
              if (!res.ok) alert(res.error);
            });
          }}
        >
          <ShieldX /> Revoke Pro
        </Button>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          title="Grant Pro months"
          onClick={() => {
            const monthsRaw = window.prompt(
              "Grant how many months of Pro? (1–120)",
              "3",
            );
            if (!monthsRaw) return;
            const months = Number(monthsRaw);
            if (!Number.isInteger(months) || months < 1 || months > 120) {
              alert("Enter an integer between 1 and 120.");
              return;
            }
            const reason = window.prompt("Reason for this grant?");
            if (!reason || reason.trim().length < 3) {
              if (reason !== null) alert("A reason of at least 3 characters is required.");
              return;
            }
            startTransition(async () => {
              const { grantProAction } = await import("@/actions/admin");
              const res = await grantProAction({ userId, months, reason });
              if (!res.ok) alert(res.error);
            });
          }}
        >
          <Crown /> Grant Pro
        </Button>
      )}
    </div>
  );
}
