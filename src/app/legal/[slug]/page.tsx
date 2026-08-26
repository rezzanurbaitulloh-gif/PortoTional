import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/layout/logo";

const DOCS: Record<
  string,
  { title: string; updated: string; sections: { h: string; body: string[] }[] }
> = {
  terms: {
    title: "Terms of Service",
    updated: "2026-08-26",
    sections: [
      {
        h: "1. The service",
        body: [
          "PortoTional is an AI-assisted professional identity platform. It helps you build a Master Professional Identity, generate CVs, publish a public profile and maintain a personal website.",
          "The service is provided on a software-as-a-service basis through portotional.vercel.app and its future custom domains.",
        ],
      },
      {
        h: "2. Your account",
        body: [
          "You are responsible for the accuracy of the information you store, for keeping your credentials safe, and for activity under your account.",
          "You may delete your account at any time from Settings. Deletion removes your profile, files, CVs, websites and analytics data.",
        ],
      },
      {
        h: "3. Acceptable use",
        body: [
          "Do not upload unlawful content, impersonate other people, publish fake professional credentials, or attempt to disrupt or scrape the platform at scale.",
          "Public content may be reported and reviewed by moderators. Accounts that violate these terms may be suspended.",
        ],
      },
      {
        h: "4. AI assistance",
        body: [
          "AI features refine the language of your own information. They are forbidden from inventing professional facts, and every AI suggestion requires your approval before it is saved.",
        ],
      },
      {
        h: "5. Changes",
        body: [
          "We may update these terms as the product evolves. Material changes will be announced in-app before taking effect.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "2026-08-26",
    sections: [
      {
        h: "What we store",
        body: [
          "Your account details (email, auth provider identifiers), your Master Identity content (profile, experience, education, skills, portfolio, certificates, languages), your CVs, website configuration, uploaded photos and project images, payment records, notification preferences, and minimal usage analytics (profile views, CV downloads).",
        ],
      },
      {
        h: "What stays private by default",
        body: [
          "Your Master Identity is private by default. Nothing becomes public until you explicitly enable your public profile. Field-level visibility controls decide which sections appear publicly, and search-engine indexing is opt-in.",
        ],
      },
      {
        h: "Third parties",
        body: [
          "Authentication and database hosting: Supabase. Hosting: Vercel. Payments: Midtrans. AI processing: configured AI providers receive only the text you explicitly send for refinement, never your full identity. We do not sell personal data.",
        ],
      },
      {
        h: "Your rights",
        body: [
          "Export all of your data as JSON from Settings, disable public visibility anytime, or permanently delete your account — which cascades to all stored personal content.",
        ],
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    updated: "2026-08-26",
    sections: [
      {
        h: "Subscriptions",
        body: [
          "PortoTional Pro is billed per year in advance. If Pro is not right for you, contact support within 7 days of purchase for a full refund.",
          "Refunds after 7 days may be considered pro-rata in case of verified service failure.",
        ],
      },
      {
        h: "How refunds work",
        body: [
          "Approved refunds are returned through the original Midtrans payment channel. Processing typically completes within 5–14 business days depending on your bank or e-wallet provider.",
        ],
      },
    ],
  },
  "ai-usage": {
    title: "AI Usage & Disclaimer",
    updated: "2026-08-26",
    sections: [
      {
        h: "Truth Guard",
        body: [
          "PortoTional AI operates under absolute truth-preservation rules: it may improve grammar, structure, tone and clarity of what you provide, but it must never invent employers, roles, metrics, certifications, education or skills.",
          "If provided information is insufficient, the assistant asks for more detail instead of guessing.",
        ],
      },
      {
        h: "Approval flow",
        body: [
          "AI output is always presented as a suggestion. Original → Suggestion → Accept / Edit / Regenerate / Reject. Nothing replaces your data without your explicit action.",
        ],
      },
      {
        h: "Limits",
        body: [
          "Free users get a generous hourly AI quota; Pro users get higher limits. Abuse protection applies automatically. Provider keys never reach your browser.",
        ],
      },
      {
        h: "Accuracy disclaimer",
        body: [
          "AI suggestions can still be awkward or incomplete. You remain responsible for reviewing anything you accept before publishing or sending it.",
        ],
      },
    ],
  },
  guidelines: {
    title: "Community Guidelines",
    updated: "2026-08-26",
    sections: [
      {
        h: "Be real",
        body: [
          "Publish truthful information about yourself. Do not impersonate others or claim credentials you do not hold.",
        ],
      },
      {
        h: "Be respectful",
        body: [
          "No harassment, hate speech, explicit material or spam in public profiles, portfolio links or usernames.",
        ],
      },
      {
        h: "Reporting & enforcement",
        body: [
          "Anyone can report a public profile via the Report link. Moderators review reports and may dismiss them or take action ranging from content takedown to account suspension.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = DOCS[slug];
  return doc ? { title: doc.title } : { title: "Legal" };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
          <Link href="/legal" className="text-sm text-muted hover:text-ivory">
            ← All documents
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ivory">
          {doc.title}
        </h1>
        <p className="mt-1 text-xs text-muted">Last updated {doc.updated}</p>
        <div className="mt-8 space-y-8">
          {doc.sections.map((sec) => (
            <section key={sec.h}>
              <h2 className="text-base font-semibold text-ivory">{sec.h}</h2>
              {sec.body.map((p) => (
                <p key={p.slice(0, 24)} className="mt-2 text-sm leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
