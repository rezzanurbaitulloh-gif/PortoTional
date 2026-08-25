import { requireCurrentProfile } from "@/services/identity";
import { AiStudioClient } from "@/features/ai/studio-client";

export default async function AiStudioPage() {
  const profile = await requireCurrentProfile();
  return (
    <div className="mx-auto max-w-3xl">
      <AiStudioClient
        profile={{
          fullName: profile.full_name,
          headline: profile.headline,
          location: profile.location,
          summaryLength: profile.summary.length,
        }}
      />
    </div>
  );
}
