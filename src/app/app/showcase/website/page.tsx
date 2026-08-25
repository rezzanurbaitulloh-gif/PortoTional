import { websiteUrl } from "@/lib/app-url";
import { getCurrentProfile, getPlan } from "@/services/identity";
import { getWebsiteForOwner } from "@/actions/website";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { WebsiteCustomizer } from "@/features/website/customizer";
import type {
  ProfileRow,
  TemplateRow,
  WebsiteSectionRow,
} from "@/types/database";

export const metadata = { title: "My Website" };

export default async function ShowcaseWebsitePage() {
  const profile = (await getCurrentProfile()) as ProfileRow;
  const supabase = await getSupabaseServerClient();

  const [{ website, sections }, userRes] = await Promise.all([
    getWebsiteForOwner(),
    supabase.auth.getUser(),
  ]);

  const plan = userRes.data.user ? await getPlan(userRes.data.user.id) : "free";

  const { data: themes } = await supabase
    .from("templates")
    .select("*")
    .eq("type", "website")
    .eq("is_active", true)
    .order("is_premium");

  return (
    <div className="mx-auto max-w-3xl">
      <WebsiteCustomizer
        website={website}
        sections={(sections ?? []) as WebsiteSectionRow[]}
        themes={(themes ?? []) as TemplateRow[]}
        username={profile.username}
        siteUrl={websiteUrl(profile.username)}
        isLocalhost={(process.env.APP_URL ?? "").includes("localhost")}
        plan={plan}
      />
    </div>
  );
}
