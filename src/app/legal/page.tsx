import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Legal & Trust" };

const DOCS = [
  { slug: "terms", label: "Terms of Service" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "refund", label: "Refund Policy" },
  { slug: "ai-usage", label: "AI Usage & Disclaimer" },
  { slug: "guidelines", label: "Community Guidelines" },
];

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-ivory">← Home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ivory">Legal &amp; Trust</h1>
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface">
          {DOCS.map((d) => (
            <li key={d.slug}>
              <Link href={`/legal/${d.slug}`} className="block px-5 py-4 text-sm text-ivory transition-colors hover:bg-white/5">
                {d.label} <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
