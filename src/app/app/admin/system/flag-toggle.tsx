"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function FlagToggle({
  flagKey,
  enabled: initial,
}: {
  flagKey: string;
  enabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(value: boolean) {
    setEnabled(value);
    setBusy(true);
    try {
      const { setFeatureFlagAction } = await import("@/actions/flags");
      const res = await setFeatureFlagAction({ key: flagKey, enabled: value });
      if (!res.ok) throw new Error(res.error);
      toast.success(`${flagKey} ${value ? "enabled" : "disabled"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
      setEnabled(!value);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Switch
      checked={enabled}
      onCheckedChange={toggle}
      disabled={busy}
      aria-label={`Toggle ${flagKey}`}
    />
  );
}
