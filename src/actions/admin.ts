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
      .object({
        userId: uuid,
        suspended: z.boolean(),
        /** §22 — dangerous actions require a recorded reason. */
        reason: z.string().min(3).max(300),
      })
      .safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "A reason (3–300 chars) is required for this action.",
      };
    }
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

    const before = {
      banned_until: userData.user.banned_until ?? null,
    };
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
      reason: parsed.data.reason,
      beforeState: before,
      afterState: {
        banned_until: parsed.data.suspended
          ? new Date(Date.now() + 876000 * 3600 * 1000).toISOString()
          : null,
      },
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
    // Resolution notes double as the §22 audit reason.
    const reason =
      parsed.data.note ||
      `Report ${parsed.data.reportId.slice(0, 8)} ${parsed.data.status}`;

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
      reason,
      afterState: { status: parsed.data.status },
    });
    revalidatePath("/app/admin/reports");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update the report." };
  }
}

const GRANT_SCHEMA = z.object({
  userId: uuid,
  months: z.coerce.number().int().min(1).max(120),
  reason: z.string().min(3).max(300),
});

/** §19/§23 — manual Pro grant via entitlement records. Never touches payments. */
export async function grantProAction(input: unknown): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const adminProfile = await requireAdmin();
    const { roleHasPermission } = await import("@/lib/permissions");
    if (!roleHasPermission(adminProfile.role ?? "USER", "entitlement.grant")) {
      return { ok: false, error: "Not permitted." };
    }
    const parsed = GRANT_SCHEMA.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Months (1–120) and a reason are required." };
    }

    const admin = getSupabaseAdminClient();
    const now = new Date();
    const end = new Date(now.getTime() + parsed.data.months * 30 * 24 * 3600 * 1000);

    await admin.from("subscriptions").upsert({
      user_id: parsed.data.userId,
      provider: "manual_grant",
      provider_subscription_id: `grant-${adminProfile.user_id.slice(0, 8)}-${now.getTime()}`,
      plan: "pro",
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
    });
    for (const feature of ["premium_website", "advanced_ai", "analytics", "multiple_cv", "premium_templates"]) {
      await admin.from("entitlements").upsert(
        { user_id: parsed.data.userId, feature, value: true },
        { onConflict: "user_id,feature" },
      );
    }

    await logAudit({
      actorUserId: adminProfile.user_id,
      action: "admin.grant_pro",
      entityType: "user",
      entityId: parsed.data.userId,
      reason: parsed.data.reason,
      beforeState: null,
      afterState: { plan: "pro", months: parsed.data.months, until: end.toISOString() },
    });
    revalidatePath("/app/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to grant Pro." };
  }
}

export async function revokeProAction(input: unknown): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const adminProfile = await requireAdmin();
    const { roleHasPermission } = await import("@/lib/permissions");
    if (!roleHasPermission(adminProfile.role ?? "USER", "entitlement.revoke")) {
      return { ok: false, error: "Not permitted." };
    }
    const parsed = z
      .object({ userId: uuid, reason: z.string().min(3).max(300) })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: "A reason is required." };

    const admin = getSupabaseAdminClient();
    await admin
      .from("subscriptions")
      .update({ plan: "free", status: "canceled" })
      .eq("user_id", parsed.data.userId);
    await admin.from("entitlements").delete().eq("user_id", parsed.data.userId);

    await logAudit({
      actorUserId: adminProfile.user_id,
      action: "admin.revoke_pro",
      entityType: "user",
      entityId: parsed.data.userId,
      reason: parsed.data.reason,
      afterState: { plan: "free" },
    });
    revalidatePath("/app/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to revoke Pro." };
  }
}

const VERIFY_SCHEMA = z.object({
  userId: uuid,
  status: z.enum(["unverified", "verified"]),
  reason: z.string().min(3).max(300),
});

export async function setVerificationAction(input: unknown): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const adminProfile = await requireAdmin();
    const { roleHasPermission } = await import("@/lib/permissions");
    if (!roleHasPermission(adminProfile.role ?? "USER", "verification.review")) {
      return { ok: false, error: "Not permitted." };
    }
    const parsed = VERIFY_SCHEMA.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid verification input." };

    const supabase = await getSupabaseServerClient();
    const { data: before } = await supabase
      .from("profiles")
      .select("verification_status")
      .eq("user_id", parsed.data.userId)
      .maybeSingle();

    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: parsed.data.status })
      .eq("user_id", parsed.data.userId);
    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorUserId: adminProfile.user_id,
      action:
        parsed.data.status === "verified"
          ? "admin.verify_user"
          : "admin.unverify_user",
      entityType: "user",
      entityId: parsed.data.userId,
      reason: parsed.data.reason,
      beforeState: { verification_status: before?.verification_status ?? null },
      afterState: { verification_status: parsed.data.status },
    });
    revalidatePath(`/app/admin/users/${parsed.data.userId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update verification." };
  }
}
