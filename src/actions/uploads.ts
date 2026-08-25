"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { requireCurrentProfile } from "@/services/identity";
import { logAudit } from "@/services/audit";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function validateImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return "No file received.";
  if (!IMAGE_TYPES.has(file.type)) {
    return "Unsupported format. Use JPG, PNG or WEBP.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image is too large. Maximum size is 5 MB.";
  }
  const header = await file.slice(0, 12).arrayBuffer();
  const sig = Array.from(new Uint8Array(header))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const isJpeg = sig.startsWith("ffd8");
  const isPng = sig.startsWith("89504e47");
  const isWebp = sig.includes("57454250");
  if (!(isJpeg || isPng || isWebp)) {
    return "File content does not look like a valid image.";
  }
  return null;
}

function extFor(type: string) {
  return type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
}

export async function uploadProfilePhotoAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    const file = formData.get("file") as File | null;
    const err = await validateImage(file as File);
    if (err) return { ok: false, error: err };
    const f = file as File;

    const supabase = await getSupabaseServerClient();
    const path = `${user.id}/photo-${Date.now()}.${extFor(f.type)}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, await f.arrayBuffer(), {
        contentType: f.type,
        cacheControl: "3600",
        upsert: true,
      });
    if (error) return { ok: false, error: error.message };

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);

    if (profile.photo_url?.includes("/avatars/")) {
      try {
        const oldPath = new URL(profile.photo_url).pathname
          .split("/storage/v1/object/public/avatars/")[1];
        if (oldPath && oldPath !== path) {
          await supabase.storage.from("avatars").remove([decodeURIComponent(oldPath)]);
        }
      } catch {}
    }

    await supabase
      .from("profiles")
      .update({ photo_url: data.publicUrl })
      .eq("id", profile.id);
    await logAudit({ actorUserId: user.id, action: "profile.photo.update" });
    revalidatePaths();
    return { ok: true, url: data.publicUrl };
  } catch {
    return { ok: false, error: "Upload failed. Please try again." };
  }
}

export async function removeProfilePhotoAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    await supabase
      .from("profiles")
      .update({ photo_url: null })
      .eq("id", profile.id);
    revalidatePaths();
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to remove photo." };
  }
}

export async function uploadWorkImageAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  try {
    const user = await requireUser();
    const file = formData.get("file") as File | null;
    const err = await validateImage(file as File);
    if (err) return { ok: false, error: err };
    const f = file as File;

    const supabase = await getSupabaseServerClient();
    const path = `${user.id}/work-${Date.now()}.${extFor(f.type)}`;
    const { error } = await supabase.storage
      .from("work-images")
      .upload(path, await f.arrayBuffer(), { contentType: f.type });
    if (error) return { ok: false, error: error.message };
    const { data } = supabase.storage.from("work-images").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch {
    return { ok: false, error: "Upload failed. Please try again." };
  }
}

function revalidatePaths() {
  for (const p of [
    "/app/dashboard",
    "/app/identity",
    "/app/cv",
    "/app/showcase/profile",
  ]) {
    revalidatePath(p);
  }
}
