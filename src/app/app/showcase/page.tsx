import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getPlan,
} from "@/services/identity";
import { listShowcases } from "@/actions/showcase";
import { ShowcaseManager } from "@/features/showcase/manager";
import type { ProfileRow } from "@/types/database";

export const metadata = { title: "Showcase" };

export default async function ShowcasePage() {
  const profile = (await getCurrentProfile()) as ProfileRow | null;
  if (!profile) redirect("/login");

  const [showcases, plan] = await Promise.all([
    listShowcases(),
    getPlan(profile.user_id),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <ShowcaseManager
        initial={showcases}
        username={profile.username}
        plan={plan}
      />
    </div>
  );
}
