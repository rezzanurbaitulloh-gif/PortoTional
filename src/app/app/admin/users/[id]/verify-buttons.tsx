"use client";

import { useTransition } from "react";
import { BadgeCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

/** §16 — admin verification with mandatory §22 reason. Audited server-side. */
export function VerifyButtons({
  userId,
  current,
}: {
  userId: string;
  current: string;
}) {
  const [pending, startTransition] = useTransition();

  function run(status: "unverified" | "verified", label: string) {
    const reason = window.prompt(`Reason for marking this user "${label}"?`);
    if (!reason || reason.trim().length < 3) {
      if (reason !== null) alert("A reason of at least 3 characters is required.");
      return;
    }
    startTransition(async () => {
      const { setVerificationAction } = await import("@/actions/admin");
      const res = await setVerificationAction({ userId, status, reason });
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={current === "verified" ? "secondary" : "outline"}
        disabled={pending}
        onClick={() => run("verified", "Verified")}
      >
        <BadgeCheck /> Mark Verified
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run("unverified", "Unverified")}
      >
        <ShieldX /> Reset
      </Button>
    </div>
  );
}
