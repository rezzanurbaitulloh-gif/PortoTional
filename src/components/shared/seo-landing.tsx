import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export function SeoLanding({
  h1,
  intro,
  bullets,
  faq,
}: {
  h1: string;
  intro: string;
  bullets: string[];
  faq: { q: string; a: string }[];
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/discover" className="text-muted hover:text-ivory">
              Discover
            </Link>
            <Link href="/pricing" className="text-muted hover:text-ivory">
              Pricing
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
          {h1}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ivory-dim">{intro}</p>

        <section className="mt-10" aria-label="Key capabilities">
          <h2 className="text-lg font-semibold text-ivory">
            What you get
          </h2>
          <ul className="mt-4 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-ivory-dim">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-label="Frequently asked questions">
          <h2 className="text-lg font-semibold text-ivory">
            Frequently asked questions
          </h2>
          <dl className="mt-4 space-y-5">
            {faq.map((f) => (
              <div key={f.q}>
                <dt className="text-sm font-medium text-ivory">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 rounded-xl border border-gold/30 bg-gold/[0.04] p-6 text-center">
          <p className="text-sm text-ivory">
            Build it once with your Master Professional Identity.
          </p>
          <Button asChild className="mt-4">
            <Link href="/signup">Start free</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
