"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, CloudOff, Loader2 } from "lucide-react";

export type AutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export function useAutosave(
  save: () => Promise<{ ok: boolean; error?: string }>,
  values: unknown,
  delayMs = 1500,
) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const res = await saveRef.current();
        if (res.ok) {
          setStatus("saved");
          setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2500);
        } else {
          setStatus("error");
          toast.error(res.error ?? "Save failed — your changes are still here.");
        }
      } catch {
        setStatus("error");
      }
    }, delayMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  async function saveNow() {
    if (timer.current) clearTimeout(timer.current);
    setStatus("saving");
    const res = await saveRef.current();
    if (res.ok) {
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2500);
      return true;
    }
    setStatus("error");
    return false;
  }

  return { status, saveNow };
}

export function AutosaveBadge({ status }: { status: AutosaveStatus }) {
  if (status === "idle") return null;
  const map: Record<AutosaveStatus, { label: string; icon: React.ReactNode; cls: string }> = {
    idle: { label: "", icon: null, cls: "" },
    dirty: { label: "Unsaved changes", icon: <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />, cls: "text-muted" },
    saving: { label: "Saving…", icon: <Loader2 className="h-3 w-3 animate-spin" />, cls: "text-muted" },
    saved: { label: "Saved ✓", icon: <Check className="h-3 w-3 text-success" />, cls: "text-success" },
    error: { label: "Not saved", icon: <CloudOff className="h-3 w-3 text-danger" />, cls: "text-danger" },
  };
  const it = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${it.cls}`} role="status">
      {it.icon}
      {it.label}
    </span>
  );
}
