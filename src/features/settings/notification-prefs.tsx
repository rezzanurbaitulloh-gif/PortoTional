"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { key: "payments", label: "Payments & subscription", hint: "Payment success, failures, renewal" },
  { key: "cv", label: "CV & AI activity", hint: "CV generation completed, AI results" },
  { key: "profile", label: "Profile & website", hint: "Publish status, profile updates" },
  { key: "system", label: "System announcements", hint: "Maintenance and product news" },
] as const;

export function NotificationPrefs({
  initial,
}: {
  initial: Record<string, boolean>;
}) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    payments: true,
    profile: true,
    cv: true,
    system: true,
    ...initial,
  });
  const [busy, setBusy] = useState(false);

  async function toggle(key: string, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setBusy(true);
    try {
      const { updateNotificationPrefsAction } = await import("@/actions/account");
      const res = await updateNotificationPrefsAction({ [key]: value });
      if (!res.ok) throw new Error(res.error);
      toast.success("Notification preferences saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
      setPrefs(prefs);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3" aria-busy={busy}>
      {CATEGORIES.map((c) => (
        <div
          key={c.key}
          className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3"
        >
          <div>
            <Label htmlFor={`np-${c.key}`} className="text-sm text-ivory">
              {c.label}
            </Label>
            <p className="mt-0.5 text-xs text-muted">{c.hint}</p>
          </div>
          <Switch
            id={`np-${c.key}`}
            checked={prefs[c.key] !== false}
            onCheckedChange={(v) => toggle(c.key, v)}
            disabled={busy}
            aria-label={`${c.label} notifications`}
          />
        </div>
      ))}
    </div>
  );
}
