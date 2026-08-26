"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/services/identity";
import { logAudit, notifyUser } from "@/services/audit";

const uuid = z.string().uuid();

export async function setUserSuspendedAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const adminProfile = await requireAdmin();
    const parsed = z
      .object({ userId: uuid, suspended: z.boolean() })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid input." };
    if (parsed.data.userId === adminProfile.user_id) {
      return { ok: false, error: "You cannot suspend your own account." };
    }

    const admin = getSupabaseAdminClient();
    const { data: userData, error: getErr } = await admin.auth.admin.getUserById(
      parsed.data.userId,
    );
    if (getErr || !userData?.user) {
      return { ok: false, error: "User not found." };
    }

    const { error } = await admin.auth.admin.updateUserById(
      parsed.data.userId,
      { ban_duration: parsed.data.suspended ? "876000h" : "none" },
    );
    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorUserId: adminProfile.user_id,
      action: parsed.data.suspended ? "admin.suspend_user" : "admin.restore_user",
      entityType: "user",
      entityId: parsed.data.userId,
    });
    if (parsed.data.suspended) {
      await notifyUser({
        userId: parsed.data.userId,
        type: "system",
        title: "Account suspended",
        body: "Your account has been suspended by an administrator. Contact support if you believe this is a mistake.",
      });
    }
    revalidatePath("/app/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update the user." };
  }
}

export async function resolveReportAction(input: unknown): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const adminProfile = await requireAdmin();
    const parsed = z
      .object({
        reportId: uuid,
        status: z.enum(["reviewing", "resolved", "dismissed"]),
        note: z.string().max(500).default(""),
      })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid input." };

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("reports")
      .update({
        status: parsed.data.status,
        resolution_note: parsed.data.note,
        reviewed_by: adminProfile.user_id,
      })
      .eq("id", parsed.data.reportId);
    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorUserId: adminProfile.user_id,
      action: `admin.report_${parsed.data.status}`,
      entityType: "report",
      entityId: parsed.data.reportId,
    });
    revalidatePath("/app/admin/reports");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update the report." };
  }
}
