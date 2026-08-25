"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { requireCurrentProfile, getPlan } from "@/services/identity";
import { planLimits } from "@/lib/constants";
import { logAudit } from "@/services/audit";
import type { WebsiteRow, WebsiteSectionRow } from "@/types/database";

export async function getWebsiteForOwner(): Promise<{
  website: WebsiteRow | null;
  sections: WebsiteSectionRow[];
}> {
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();
  let { data: website } = await supabase
    .from("websites")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!website) {
    const { data: created } = await supabase
      .from("websites")
      .insert({ profile_id: profile.id, subdomain: profile.username })
      .select()
      .single();
    website = created;
    const { data: tpl } = await supabase
      .from("templates")
      .select("id")
      .eq("type", "website")
      .eq("slug", "editorial-minimal")
      .maybeSingle();
    if (tpl && website) {
      await supabase
        .from("websites")
        .update({ template_id: tpl.id })
        .eq("id", website.id);
      website.template_id = tpl.id;
    }
  }

  const { data: sections } = await supabase
    .from("website_sections")
    .select("*")
    .eq("website_id", (website as WebsiteRow).id)
    .order("sort_order");

  return {
    website: (website as WebsiteRow) ?? null,
    sections: (sections as WebsiteSectionRow[]) ?? [],
  };
}

const configSchema = z.object({
  theme: z.string().max(60).optional(),
  typography: z.string().max(40).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  layout: z.string().max(30).optional(),
  animations: z.boolean().optional(),
  threeD: z.boolean().optional(),
  heroTagline: z.string().max(200).optional(),
});

const seoSchema = z.object({
  title: z.string().max(80).optional(),
  description: z.string().max(200).optional(),
  ogImage: z.string().max(600).optional(),
  index: z.boolean().optional(),
});

export async function updateWebsiteAction(input: {
  configuration?: unknown;
  seo_configuration?: unknown;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const { data: website } = await supabase
      .from("websites")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!website) return { ok: false, error: "Create your website first." };

    const patch: Record<string, unknown> = {};
    if (input.configuration !== undefined) {
      const parsed = configSchema.safeParse(input.configuration);
      if (!parsed.success) return { ok: false, error: "Invalid design settings" };
      patch.configuration = { ...website.configuration, ...parsed.data };
    }
    if (input.seo_configuration !== undefined) {
      const parsed = seoSchema.safeParse(input.seo_configuration);
      if (!parsed.success) return { ok: false, error: "Invalid SEO settings" };
      patch.seo_configuration = { ...website.seo_configuration, ...parsed.data };
    }

    const { error } = await supabase
      .from("websites")
      .update(patch)
      .eq("id", website.id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/showcase/website");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save the website." };
  }
}

export async function saveWebsiteSectionsAction(
  websiteId: string,
  ordered: { id: string; is_visible: boolean }[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const profile = await requireCurrentProfile();
    const supabase = await getSupabaseServerClient();
    const { data: owned } = await supabase
      .from("websites")
      .select("id")
      .eq("id", websiteId)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!owned) return { ok: false, error: "Website not found." };
    for (let i = 0; i < ordered.length; i++) {
      const { error } = await supabase
        .from("website_sections")
        .update({ sort_order: i, is_visible: ordered[i].is_visible })
        .eq("id", ordered[i].id)
        .eq("website_id", websiteId);
      if (error) return { ok: false, error: error.message };
    }
    revalidatePath("/sites", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save sections." };
  }
}

export async function togglePublishAction(
  publish: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const profile = await requireCurrentProfile();
    const plan = await getPlan(user.id);

    if (publish && !planLimits(plan).websitePublish) {
      return {
        ok: false,
        error:
          "Publishing a personal website is a Pro feature. Upgrade to publish your site.",
      };
    }

    const supabase = await getSupabaseServerClient();
    const { data: profileCheck } = await supabase
      .from("profiles")
      .select("visibility, onboarding_completed")
      .eq("id", profile.id)
      .maybeSingle();

    const visibilityPublic =
      (
        (profileCheck?.visibility as Record<string, boolean> | null) ?? {}
      ).profile === true;
    if (publish && !visibilityPublic) {
      return {
        ok: false,
        error:
          "Your public profile must be visible before your website can be published. Enable it in Public Profile settings.",
      };
    }

    const { error } = await supabase
      .from("websites")
      .update({ published: publish })
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };

    await logAudit({
      actorUserId: user.id,
      action: publish ? "website.publish" : "website.unpublish",
      entityType: "website",
    });
    revalidatePath("/app/showcase/website");
    revalidatePath("/sites");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to change publish state." };
  }
}
