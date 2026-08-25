import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function logAudit(input: {
  actorUserId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = getSupabaseAdminClient();
    await admin.from("audit_logs").insert({
      actor_user_id: input.actorUserId,
      action: input.action,
      entity_type: input.entityType ?? "",
      entity_id: input.entityId ?? "",
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    console.error("[audit]", err);
  }
}

export async function notifyUser(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
}) {
  try {
    const admin = getSupabaseAdminClient();
    await admin.from("notifications").insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? "",
    });
  } catch (err) {
    console.error("[notify]", err);
  }
}
