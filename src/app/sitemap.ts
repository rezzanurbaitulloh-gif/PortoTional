import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/public";
import { appUrl } from "@/lib/app-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/signup`, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const { data: profiles } = await supabaseAdmin.rpc("list_indexable_usernames");
    for (const username of (profiles as string[] | null) ?? []) {
      entries.push({
        url: `${base}/u/${username}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {}

  return entries;
}
