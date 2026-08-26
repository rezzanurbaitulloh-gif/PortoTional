"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { requireCurrentProfile, getPlan } from "@/services/identity";
import { planLimits } from "@/lib/constants";
import { logAudit, notifyUser } from "@/services/audit";
import { showcaseSchema } from "@/lib/validation/showcase";
import type { ShowcaseRow } from "@/types/database";

const SHOWCASE_TYPES = [
  "project",
  "activity",
  "achievement",
  "certification",
  "experience",
  "event",
  "design",
  "publication",
  "custom",
] as const;

export async function listShowcases(): Promise<ShowcaseRow[]> {
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("showcases")
    .select("*")
    .eq("profile_id", profile.id)
    .order("sort_order");
  return (data as ShowcaseRow[]) ?? [];
}

export async function createShowcaseAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    const parsed = showcaseSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid showcase." };
    }

    const plan = await getPlan(user.id);
    const supabase = await getSupabaseServerClient();
    const { count } = await supabase
      .from("showcases")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id);
    if ((count ?? 0) >= planLimits(plan).maxShowcases) {
      return {
        ok: false,
        error: `The ${plan} plan allows up to ${planLimits(plan).maxShowcases} showcases. Upgrade to Pro for more.`,
      };
    }

    // Only one featured item per profile? No — allow multiple, but keep order.
    const { data: last } = await supabase
      .from("showcases")
      .select("sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const { data: created, error } = await supabase
      .from("showcases")
      .insert({
        profile_id: profile.id,
        ...parsed.data,
        sort_order: (last?.[0]?.sort_order ?? -1) + 1,
      })
      .select()
      .single();
    if (error) return { ok: false, error: error.message };

    if (parsed.data.visibility === "public") {
      await notifyUser({
        userId: user.id,
        type: "profile",
        title: "Showcase published",
        body: `"${parsed.data.title}" is now visible on your public profile.`,
        actionUrl: `/u/${profile.username}`,
        entityId: created.id,
      });
    }
    await logAudit({
      actorUserId: user.id,
      action: "showcase.create",
      entityType: "showcase",
      entityId: created.id,
      afterState: { title: parsed.data.title },
    });
    revalidatePath("/app/showcase");
    revalidatePath(`/u/${profile.username}`);
    return { ok: true, id: created.id };
  } catch {
    return { ok: false, error: "Failed to create the showcase." };
  }
}

export async function updateShowcaseAction(
  id: string,
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Invalid id." };
    const parsed = showcaseSchema.partial().safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid showcase." };
    }

    const supabase = await getSupabaseServerClient();
    const { data: before } = await supabase
      .from("showcases")
      .select("*")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!before) return { ok: false, error: "Showcase not found." };

    const { error } = await supabase
      .from("showcases")
      .update(parsed.data)
      .eq("id", id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorUserId: user.id,
      action: "showcase.update",
      entityType: "showcase",
      entityId: id,
      reason: `Updated ${before.title}`,
      beforeState: { title: before.title, visibility: before.visibility, featured: before.featured },
      afterState: { title: parsed.data.title ?? before.title, visibility: parsed.data.visibility ?? before.visibility, featured: parsed.data.featured ?? before.featured },
    });
    revalidatePath("/app/showcase");
    revalidatePath(`/u/${profile.username}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update the showcase." };
  }
}

export async function deleteShowcaseAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Invalid id." };

    const supabase = await getSupabaseServerClient();
    const { data: before } = await supabase
      .from("showcases")
      .select("title")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!before) return { ok: false, error: "Showcase not found." };

    const { error } = await supabase
      .from("showcases")
      .delete()
      .eq("id", id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorUserId: user.id,
      action: "showcase.delete",
      entityType: "showcase",
      entityId: id,
      reason: `Deleted "${before.title}"`,
      beforeState: { title: before.title },
    });
    revalidatePath("/app/showcase");
    revalidatePath(`/u/${profile.username}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete the showcase." };
  }
}

export async function reorderShowcasesAction(
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    await Promise.all(
      orderedIds.map((id, idx) =>
        supabase
          .from("showcases")
          .update({ sort_order: idx })
          .eq("id", id)
          .eq("profile_id", profile.id),
      ),
    );
    revalidatePath("/app/showcase");
    revalidatePath(`/u/${profile.username}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to reorder." };
  }
}
