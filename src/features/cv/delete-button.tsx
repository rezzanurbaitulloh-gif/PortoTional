"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteResumeButton({
  resumeId,
  name,
}: {
  resumeId: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const { deleteResumeAction } = await import("@/actions/cv");
      const res = await deleteResumeAction(resumeId);
      if (!res.ok) throw new Error(res.error);
      toast.success("CV deleted.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="text-danger hover:text-danger"
      onClick={remove}
      disabled={busy}
      aria-label={`Delete ${name}`}
    >
      {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}

export function DuplicateResumeButton({ resumeId }: { resumeId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function duplicate() {
    setBusy(true);
    try {
      const { duplicateResumeAction } = await import("@/actions/cv");
      const res = await duplicateResumeAction(resumeId);
      if (!res.ok) throw new Error(res.error);
      toast.success("CV duplicated.");
      router.push(`/app/cv/${res.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" onClick={duplicate} disabled={busy}>
      {busy ? <Loader2 className="animate-spin" /> : <Copy />} Duplicate CV
    </Button>
  );
}
