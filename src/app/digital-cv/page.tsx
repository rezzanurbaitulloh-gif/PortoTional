import type { Metadata } from "next";
import { SeoLanding } from "@/components/shared/seo-landing";

export const metadata: Metadata = {
  title: "Digital CV — Your Resume, Always Online & Up to Date",
  description:
    "Stop emailing attachments. Share a living digital CV at portotional.vercel.app/u/yourname with verified content, QR code and one-tap PDF download.",
};

export default function Page() {
  return (
    <SeoLanding
      h1="A digital CV that lives at your own link"
      intro="A static PDF goes stale the moment you send it. A PortoTional digital CV is a professional profile page at your personal URL — always current, searchable, and backed by the same structured data that powers your downloadable CV. Recruiters see your headline, skills and availability instantly; you see every view in analytics."
      bullets={[
        "Personal link: portotional.vercel.app/u/username",
        "QR code for business cards and portfolios",
        "Control exactly which sections are public and which stay private",
        "One-click PDF download for recruiters who want the classic file",
        "Optional search-engine indexing you can turn off anytime",
      ]}
      faq={[
        { q: "Can I keep parts of my profile private?", a: "Yes. Visibility controls let you publish some sections while keeping others private. Private fields never appear on your public page." },
        { q: "Does it replace my PDF CV?", a: "It complements it. Your digital profile hosts the story; visitors can still download a polished PDF generated from the same data." },
        { q: "Is my profile indexed by Google?", a: "Only if you allow it. Search-engine indexing is opt-in per user and can be disabled at any time." },
      ]}
    />
  );
}
