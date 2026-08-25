import { requireCurrentProfile } from "@/services/identity";
import { appUrl } from "@/lib/app-url";
import { ProfileVisibilityPanel } from "@/features/profile/visibility-panel";
import QRCode from "qrcode";

export default async function ShowcaseProfilePage() {
  const profile = await requireCurrentProfile();
  const baseUrl = appUrl();
  const publicUrl = `${baseUrl}/u/${profile.username}`;
  const resumeUrl = `${baseUrl}/api/public-resume/${profile.username}`;
  const websiteUrl = `https://${profile.username}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  const [qrProfile, qrResume, qrWebsite] = await Promise.all([
    QRCode.toDataURL(publicUrl, { width: 220, margin: 1, color: { dark: "#0B0C10", light: "#F8F9FA" } }),
    QRCode.toDataURL(resumeUrl, { width: 220, margin: 1, color: { dark: "#0B0C10", light: "#F8F9FA" } }),
    QRCode.toDataURL(websiteUrl, { width: 220, margin: 1, color: { dark: "#0B0C10", light: "#F8F9FA" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <ProfileVisibilityPanel
        username={profile.username}
        isPublic={profile.visibility.profile}
        visibility={profile.visibility}
        publicUrl={publicUrl}
        resumeUrl={resumeUrl}
        websiteUrl={websiteUrl}
        qrCodes={{ profile: qrProfile, resume: qrResume, website: qrWebsite }}
        hasPhoto={Boolean(profile.photo_url)}
      />
    </div>
  );
}
