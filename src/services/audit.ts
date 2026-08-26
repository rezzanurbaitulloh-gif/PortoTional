import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function logAudit(input: {
  actorUserId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  /** §22 — required for dangerous actions */
  reason?: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}) {
  try {
    const admin = getSupabaseAdminClient();
    await admin.from("audit_logs").insert({
      actor_user_id: input.actorUserId,
      action: input.action,
      reason: input.reason ?? "",
      before_state: input.beforeState ?? null,
      after_state: input.afterState ?? null,
      entity_type: input.entityType ?? "",
      entity_id: input.entityId ?? "",
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    console.error("[audit]", err);
  }
}

const CATEGORY_BY_TYPE: Record<string, string> = {
  payment: "payments",
  subscription: "payments",
  cv: "cv",
  website: "profile",
  profile: "profile",
  system: "system",
};

export async function notifyUser(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  actionUrl?: string;
  entityId?: string;
}) {
  try {
    const admin = getSupabaseAdminClient();

    // §35 — respect the user's in-app notification preferences.
    const { data: prof } = await admin
      .from("profiles")
      .select("notification_prefs")
      .eq("user_id", input.userId)
      .maybeSingle();
    const prefs = (prof?.notification_prefs ?? {}) as Record<string, boolean>;
    const category = CATEGORY_BY_TYPE[input.type] ?? "system";
    if (prefs[category] === false) return;

    await admin.from("notifications").insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? "",
      action_url: input.actionUrl ?? null,
      entity_id: input.entityId ?? null,
    });
  } catch (err) {
    console.error("[notify]", err);
  }
}
