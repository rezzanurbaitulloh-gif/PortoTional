"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/services/identity";
import { logAudit } from "@/services/audit";

export async function setFeatureFlagAction(input: unknown): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const adminProfile = await requireAdmin();
    const parsed = z
      .object({
        key: z.string().min(2).max(60),
        enabled: z.boolean(),
      })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid flag input." };

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled: parsed.data.enabled, updated_at: new Date().toISOString() })
      .eq("key", parsed.data.key);
    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorUserId: adminProfile.user_id,
      action: `admin.flag_${parsed.data.enabled ? "on" : "off"}`,
      entityType: "feature_flag",
      entityId: parsed.data.key,
    });
    revalidatePath("/app/admin/system");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update the flag." };
  }
}
