"use client";

import { useTransition } from "react";
import { RotateCcw, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/** §22 — critical ops require confirmation + a recorded reason. */
export function SuspendButton({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={suspended ? "outline" : "secondary"}
      disabled={pending}
      onClick={() => {
        const reason = window.prompt(
          suspended
            ? "Reason for restoring this account?"
            : "Reason for suspending this account?",
        );
        if (!reason || reason.trim().length < 3) {
          if (reason !== null) {
            alert("A reason of at least 3 characters is required.");
          }
          return;
        }
        startTransition(async () => {
          const { setUserSuspendedAction } = await import("@/actions/admin");
          const res = await setUserSuspendedAction({
            userId,
            suspended,
            reason,
          });
          if (!res.ok) alert(res.error);
        });
      }}
    >
      {suspended ? (
        <>
          <RotateCcw /> Restore
        </>
      ) : (
        <>
          <ShieldOff /> Suspend
        </>
      )}
    </Button>
  );
}
