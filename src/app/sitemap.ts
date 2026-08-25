import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
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
