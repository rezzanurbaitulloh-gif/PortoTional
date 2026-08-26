"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logAudit } from "@/services/audit";

export async function deleteAccountAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const parsed = z
      .object({ password: z.string().min(8).max(100) })
      .safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Enter your current password to confirm." };
    }

    const supabase = await getSupabaseServerClient();
    const userRes = await supabase.auth.getUser();
    const user = userRes.data.user;
    if (!user?.email) return { ok: false, error: "Not signed in." };

    // Verify the password before destroying anything.
    const check = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.password,
    });
    if (check.error) {
      return { ok: false, error: "Incorrect password." };
    }

    await logAudit({
      actorUserId: user.id,
      action: "account.delete_requested",
      entityType: "user",
      entityId: user.id,
    });

    const admin = getSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { ok: false, error: error.message };

    await supabase.auth.signOut();
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete the account." };
  }
}

const PREFS_SCHEMA = z.object({
  payments: z.boolean().optional(),
  profile: z.boolean().optional(),
  cv: z.boolean().optional(),
  system: z.boolean().optional(),
});

export async function updateNotificationPrefsAction(input: unknown): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const parsed = PREFS_SCHEMA.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid preferences." };
    const supabase = await getSupabaseServerClient();
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, notification_prefs")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle();
    if (!prof) return { ok: false, error: "Profile not found." };
    const merged = {
      ...((prof.notification_prefs ?? {}) as Record<string, boolean>),
      ...parsed.data,
    };
    const { error } = await supabase
      .from("profiles")
      .update({ notification_prefs: merged })
      .eq("id", prof.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save preferences." };
  }
}
