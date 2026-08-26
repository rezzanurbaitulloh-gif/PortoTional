"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { requireCurrentProfile, getPlan } from "@/services/identity";
import { planLimits } from "@/lib/constants";
import { logAudit } from "@/services/audit";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

async function validateImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return "No file received.";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Only JPEG, PNG or WebP images are supported.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image is too large. Maximum size is 10 MB.";
  }
  const header = await file.slice(0, 4).arrayBuffer();
  const sig = Array.from(new Uint8Array(header))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const ok =
    sig.startsWith("ffd8") || sig.startsWith("89504e47") || sig.includes("57454250");
  if (!ok) return "File content does not look like a valid image.";
  return null;
}

function extFor(type: string) {
  return type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
}

export async function listAssets() {
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("files")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function uploadAssetAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    const file = formData.get("file") as File | null;
    const category = String(formData.get("category") ?? "general").slice(0, 40);
    const err = await validateImage(file as File);
    if (err) return { ok: false, error: err };
    const f = file as File;

    const supabase = await getSupabaseServerClient();
    const plan = await getPlan(user.id);
    const { count } = await supabase
      .from("files")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id);
    if ((count ?? 0) >= planLimits(plan).maxAssets) {
      return {
        ok: false,
        error: `The ${plan} plan allows up to ${planLimits(plan).maxAssets} stored assets.`,
      };
    }

    const path = `${user.id}/asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(f.type)}`;
    const { error: upErr } = await supabase.storage
      .from("work-images")
      .upload(path, await f.arrayBuffer(), {
        contentType: f.type,
        cacheControl: "31536000",
        upsert: false,
      });
    if (upErr) return { ok: false, error: upErr.message };

    const { data } = supabase.storage.from("work-images").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("files").insert({
      profile_id: profile.id,
      storage_path: path,
      file_name: f.name.slice(0, 120),
      mime_type: f.type,
      size: f.size,
      purpose: "library",
      category,
    });
    if (dbErr) return { ok: false, error: dbErr.message };

    await logAudit({ actorUserId: user.id, action: "asset.upload", entityId: path });
    revalidatePath("/app/assets");
    return { ok: true, url: data.publicUrl };
  } catch {
    return { ok: false, error: "Upload failed." };
  }
}

export async function renameAssetAction(id: string, newName: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Invalid id." };
    const name = newName.trim().slice(0, 120);
    if (!name) return { ok: false, error: "Name cannot be empty." };
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("files")
      .update({ file_name: name })
      .eq("id", id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/assets");
    return { ok: true };
  } catch {
    return { ok: false, error: "Rename failed." };
  }
}

export async function deleteAssetAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Invalid id." };
    const supabase = await getSupabaseServerClient();
    const { data: row } = await supabase
      .from("files")
      .select("storage_path, purpose")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!row) return { ok: false, error: "Asset not found." };

    // Only remove from storage when it belongs to the library bucket.
    if (String(row.storage_path).startsWith(`${user.id}/asset-`)) {
      await supabase.storage.from("work-images").remove([row.storage_path]);
    }
    const { error } = await supabase
      .from("files")
      .delete()
      .eq("id", id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };

    await logAudit({ actorUserId: user.id, action: "asset.delete", entityId: id });
    revalidatePath("/app/assets");
    return { ok: true };
  } catch {
    return { ok: false, error: "Delete failed." };
  }
}
