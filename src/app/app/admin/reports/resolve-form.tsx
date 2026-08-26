"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResolveReportForm({ reportId }: { reportId: string }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(status: "reviewing" | "resolved" | "dismissed") {
    setBusy(true);
    try {
      const { resolveReportAction } = await import("@/actions/admin");
      const res = await resolveReportAction({ reportId, status, note });
      if (!res.ok) throw new Error(res.error);
      toast.success(`Report ${status}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Resolution note (optional)"
        className="h-8 w-64 text-xs"
        aria-label="Resolution note"
      />
      <Button size="sm" variant="outline" disabled={busy} onClick={() => run("reviewing")}>
        <Eye /> Reviewing
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={busy || note.trim().length < 3}
        title="A short reason is required to dismiss"
        onClick={() => run("dismissed")}
      >
        <X /> Dismiss
      </Button>
      <Button
        size="sm"
        disabled={busy || note.trim().length < 3}
        title="A short reason is required to resolve"
        onClick={() => run("resolved")}
      >
        <Check /> Resolve
      </Button>
    </div>
  );
}
