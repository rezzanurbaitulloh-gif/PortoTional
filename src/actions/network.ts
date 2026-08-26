"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { requireCurrentProfile } from "@/services/identity";
import { logAudit } from "@/services/audit";

const usernameSchema = z.string().min(2).max(40);

async function profileIdByUsername(username: string): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  return data?.id ?? null;
}

/* ---------------- Saved Professionals (§14) ---------------- */

export async function toggleSaveProfessionalAction(input: unknown): Promise<{
  ok: boolean;
  error?: string;
  saved?: boolean;
}> {
  try {
    await requireUser();
    const me = await requireCurrentProfile();
    const parsed = z
      .object({ username: usernameSchema })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid username." };

    const supabase = await getSupabaseServerClient();
    const targetId = await profileIdByUsername(parsed.data.username);
    if (!targetId) return { ok: false, error: "Profile not found." };
    if (targetId === me.id) {
      return { ok: false, error: "You cannot save your own profile." };
    }

    const existing = await supabase
      .from("saved_professionals")
      .select("id")
      .eq("saver_profile_id", me.id)
      .eq("target_profile_id", targetId)
      .maybeSingle();

    if (existing.data) {
      await supabase.from("saved_professionals").delete().eq("id", existing.data.id);
      revalidatePath("/app/saved");
      return { ok: true, saved: false };
    }

    const { error } = await supabase.from("saved_professionals").insert({
      saver_profile_id: me.id,
      target_profile_id: targetId,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/saved");
    return { ok: true, saved: true };
  } catch {
    return { ok: false, error: "Failed to update saved list." };
  }
}

export async function createCollectionAction(name: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    await requireUser();
    const me = await requireCurrentProfile();
    const clean = name.trim().slice(0, 60);
    if (clean.length < 1) return { ok: false, error: "Name is required." };
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("saved_collections").insert({
      owner_profile_id: me.id,
      name: clean,
    });
    if (error) {
      return {
        ok: false,
        error: error.code === "23505" ? "A collection with that name exists." : error.message,
      };
    }
    revalidatePath("/app/saved");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to create the collection." };
  }
}

export async function moveToCollectionAction(
  savedId: string,
  collectionId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const me = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("saved_professionals")
      .update({ collection_id: collectionId })
      .eq("id", savedId)
      .eq("saver_profile_id", me.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/saved");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to move the entry." };
  }
}

export async function removeSavedAction(savedId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const me = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    await supabase
      .from("saved_professionals")
      .delete()
      .eq("id", savedId)
      .eq("saver_profile_id", me.id);
    revalidatePath("/app/saved");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to remove." };
  }
}

/* ---------------- Contact Requests (§15) ---------------- */

export async function sendContactRequestAction(input: unknown): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const user = await requireUser();
    const me = await requireCurrentProfile();
    const parsed = z
      .object({
        username: usernameSchema,
        message: z.string().max(1000).default(""),
        intent: z.enum(["contact", "collaboration"]).default("contact"),
      })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request." };

    const supabase = await getSupabaseServerClient();
    const targetId = await profileIdByUsername(parsed.data.username);
    if (!targetId) return { ok: false, error: "Profile not found." };
    if (targetId === me.id) {
      return { ok: false, error: "You cannot contact yourself." };
    }

    // Rate-limit: max 10 pending requests per sender.
    const { count } = await supabase
      .from("contact_requests")
      .select("id", { count: "exact", head: true })
      .eq("from_profile_id", me.id)
      .eq("status", "pending");
    if ((count ?? 0) >= 10) {
      return { ok: false, error: "Too many pending requests. Wait for replies." };
    }

    // No duplicates while one is still pending.
    const dup = await supabase
      .from("contact_requests")
      .select("id")
      .eq("from_profile_id", me.id)
      .eq("to_profile_id", targetId)
      .eq("status", "pending")
      .maybeSingle();
    if (dup.data) {
      return { ok: false, error: "A pending request already exists for this person." };
    }

    const { error } = await supabase.from("contact_requests").insert({
      from_profile_id: me.id,
      to_profile_id: targetId,
      message: parsed.data.message.trim(),
      intent: parsed.data.intent,
    });
    if (error) return { ok: false, error: error.message };

    // Notify recipient via service role (bypasses RLS).
    const adminMod = await import("@/lib/supabase/admin");
    const admin = adminMod.getSupabaseAdminClient();
    const { data: toProf } = await admin
      .from("profiles")
      .select("user_id")
      .eq("id", targetId)
      .maybeSingle();
    if (toProf?.user_id) {
      const { notifyUser: notify } = await import("@/services/audit");
      await notify({
        userId: toProf.user_id,
        type: "profile",
        title:
          parsed.data.intent === "collaboration"
            ? "New collaboration request"
            : "New contact request",
        body:
          parsed.data.message.slice(0, 140) ||
          `${me.username} wants to connect with you.`,
        actionUrl: "/app/contacts",
        entityId: me.id,
      });
    }

    await logAudit({
      actorUserId: user.id,
      action: "contact_request.send",
      entityType: "profile",
      entityId: targetId,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to send the request." };
  }
}

export async function respondContactRequestAction(
  id: string,
  accept: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const me = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const { data: req } = await supabase
      .from("contact_requests")
      .select("*")
      .eq("id", id)
      .eq("to_profile_id", me.id)
      .eq("status", "pending")
      .maybeSingle();
    if (!req) return { ok: false, error: "Request not found or already handled." };

    const { error } = await supabase
      .from("contact_requests")
      .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    const adminMod = await import("@/lib/supabase/admin");
    const admin = adminMod.getSupabaseAdminClient();
    const { data: fromProf } = await admin
      .from("profiles")
      .select("user_id")
      .eq("id", req.from_profile_id)
      .maybeSingle();
    if (fromProf?.user_id) {
      const { notifyUser: notify } = await import("@/services/audit");
      await notify({
        userId: fromProf.user_id,
        type: "profile",
        title: accept ? "Your contact request was accepted" : "Your contact request was declined",
        body: `${me.username} ${accept ? "accepted" : "declined"} your request.`,
        actionUrl: `/u/${me.username}`,
      });
    }
    await logAudit({
      actorUserId: user.id,
      action: accept ? "contact_request.accept" : "contact_request.decline",
      entityType: "contact_request",
      entityId: id,
    });
    revalidatePath("/app/contacts");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to respond." };
  }
}
