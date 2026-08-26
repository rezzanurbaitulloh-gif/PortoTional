"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RespondButtons({ requestId }: { requestId: string }) {
  const [busy, setBusy] = useState(false);

  async function respond(accept: boolean) {
    setBusy(true);
    try {
      const { respondContactRequestAction } = await import("@/actions/network");
      const res = await respondContactRequestAction(requestId, accept);
      if (!res.ok) throw new Error(res.error);
      toast.success(accept ? "Request accepted." : "Request declined.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button size="sm" disabled={busy} onClick={() => respond(true)}>
        <Check /> Accept
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => respond(false)}>
        <X /> Decline
      </Button>
    </div>
  );
}
