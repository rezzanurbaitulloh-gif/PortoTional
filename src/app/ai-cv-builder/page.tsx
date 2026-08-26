import type { Metadata } from "next";
import { SeoLanding } from "@/components/shared/seo-landing";

export const metadata: Metadata = {
  title: "AI CV Builder — Build Your CV With AI That Never Invents",
  description:
    "PortoTional's AI CV Builder turns your real experience into a polished, ATS-ready CV. AI assists with wording only — it never fabricates facts.",
};

export default function Page() {
  return (
    <SeoLanding
      h1="AI CV Builder that respects your truth"
      intro="Most AI CV tools invent impressive-sounding achievements you never earned. PortoTional works differently: your Master Professional Identity is the single source of truth, and our AI refines the language of what you actually did — grammar, structure, tone — without ever adding companies, numbers or skills that are not yours."
      bullets={[
        "Generate a complete CV draft from your Master Identity in one click",
        "Refine any bullet from rough notes like 'handled company Instagram' into professional language",
        "Truth Guard engine blocks fabricated metrics, employers and certifications",
        "Every AI suggestion requires your explicit approval before saving",
        "Export to clean PDF, ready to send",
      ]}
      faq={[
        { q: "Does the AI write fake experience?", a: "No. PortoTional's Truth Guard rules forbid inventing work history, job titles, metrics, certificates or education. If information is missing, the assistant asks you for details instead of making them up." },
        { q: "Is the AI free to use?", a: "Yes — every user gets a generous free AI quota. Pro members get higher limits and priority processing." },
        { q: "Can I edit AI suggestions?", a: "Always. Nothing AI-generated touches your data until you press Accept. You can also edit the suggestion before accepting." },
      ]}
    />
  );
}
