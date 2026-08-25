import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getPlan,
} from "@/services/identity";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CreateCvForm } from "@/features/cv/create-form";
import type { ProfileRow, TemplateRow } from "@/types/database";

export default async function NewCvPage() {
  const profile = (await getCurrentProfile()) as ProfileRow | null;
  if (!profile) redirect("/login");

  const supabase = await getSupabaseServerClient();
  const [{ data: templates }, userRes] = await Promise.all([
    supabase
      .from("templates")
      .select("*")
      .eq("type", "cv")
      .eq("is_active", true)
      .order("is_premium"),
    supabase.auth.getUser(),
  ]);

  const user = userRes.data.user;
  const plan = user ? await getPlan(user.id) : "free";

  return (
    <div className="mx-auto max-w-2xl">
      <CreateCvForm
        templates={(templates ?? []) as TemplateRow[]}
        plan={plan}
        suggestedName={`${profile.full_name || profile.username} — General CV`}
      />
    </div>
  );
}
