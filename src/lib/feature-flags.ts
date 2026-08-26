import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** §78 — feature flags gate optional features, never authorization. */
export const getFeatureFlags = cache(
  async (): Promise<Record<string, boolean>> => {
    try {
      const supabase = await getSupabaseServerClient();
      const { data } = await supabase.from("feature_flags").select("*");
      return Object.fromEntries(
        (data ?? []).map((f: { key: string; enabled: boolean }) => [
          f.key,
          f.enabled,
        ]),
      );
    } catch {
      return {};
    }
  },
);

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[key] !== false; // unknown flags default to on
}
