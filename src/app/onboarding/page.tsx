import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile, listProfessions } from "@/services/identity";
import { OnboardingFlow } from "@/features/onboarding/flow";
import type { ProfileRow } from "@/types/database";

export const metadata = { title: "Setup" };

export default async function OnboardingPage() {
  const profile = (await getCurrentProfile()) as ProfileRow | null;
  if (!profile) redirect("/login");
  if (profile.onboarding_completed) redirect("/app/dashboard");

  const professions = await listProfessions();

  return (
    <Suspense>
      <OnboardingFlow
        professions={professions.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description ?? "",
          recommendedSections:
            (p.configuration?.recommendedSections as string[]) ?? [],
        }))}
        currentUsername={profile.username}
        fullName={profile.full_name}
      />
    </Suspense>
  );
}
