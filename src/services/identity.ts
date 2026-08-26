import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  MasterIdentityBundle,
  ProfessionRow,
  ProfileRow,
} from "@/types/database";

export const getCurrentProfile = cache(
  async (): Promise<ProfileRow | null> => {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle();
    return (data as ProfileRow | null) ?? null;
  },
);

export async function requireCurrentProfile(): Promise<ProfileRow> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  return profile;
}

export async function getPlan(userId: string): Promise<string> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.rpc("effective_plan", { uid: userId });
  return (data as string) ?? "free";
}

export async function listProfessions(): Promise<ProfessionRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("professions")
    .select("*")
    .order("name");
  return (data as ProfessionRow[]) ?? [];
}

export async function getIdentityBundle(
  profileId: string,
): Promise<Omit<MasterIdentityBundle, "profession">> {
  const supabase = await getSupabaseServerClient();
  const [experiences, educations, skills, works, achievements, certifications, languages, socialLinks] =
    await Promise.all([
      supabase.from("experiences").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("educations").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("skills").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("works").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("achievements").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("certifications").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("languages").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("social_links").select("*").eq("profile_id", profileId).order("sort_order"),
    ]);
  return {
    profile: {} as ProfileRow,
    experiences: experiences.data ?? [],
    educations: educations.data ?? [],
    skills: skills.data ?? [],
    works: works.data ?? [],
    achievements: achievements.data ?? [],
    certifications: certifications.data ?? [],
    languages: languages.data ?? [],
    socialLinks: socialLinks.data ?? [],
  };
}

export async function requireAdmin(): Promise<ProfileRow> {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) redirect("/app/dashboard");
  return profile;
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return Boolean(profile?.is_admin);
}
