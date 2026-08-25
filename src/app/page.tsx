import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  Fingerprint,
  Globe,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: FileText,
    title: "ATS-ready CVs",
    description:
      "Multiple CVs from one identity. A4 & F4, live preview, real PDF export — not screenshots.",
  },
  {
    icon: Globe,
    title: "Public profile",
    description:
      "portotional.com/u/username — a fast, SEO-optimized page that answers who you are in seconds.",
  },
  {
    icon: Fingerprint,
    title: "Master Identity",
    description:
      "Enter your experience once. Every output stays consistent with your single source of truth.",
  },
  {
    icon: Sparkles,
    title: "AI that never invents",
    description:
      "AI improves your wording only. It cannot fabricate companies, roles or numbers.",
  },
  {
    icon: ScanLine,
    title: "ATS analysis",
    description:
      "Structure, readability and keyword scoring with honest guidance — no false guarantees.",
  },
  {
    icon: BarChart3,
    title: "Personal website (Pro)",
    description:
      "username.portotional.com rendered by one engine, customizable without code.",
  },
];

const PROFESSIONS = [
  "Developer", "UI/UX Designer", "Teacher", "Accountant", "Marketing",
  "Photographer", "Writer", "HR", "Engineer", "Architect", "Chef",
  "Consultant", "Student", "Freelancer", "Healthcare", "Content Creator",
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-obsidian/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ivory-dim md:flex" aria-label="Main">
            <a href="#features" className="hover:text-ivory">Features</a>
            <a href="#how" className="hover:text-ivory">How it works</a>
            <Link href="/pricing" className="hover:text-ivory">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 text-center sm:pt-28">
          <Badge variant="default" className="mb-6">
            Professional Identity Operating System
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ivory sm:text-6xl">
            Your professional identity.
            <br />
            <span className="font-display italic text-gold">Built once.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
            Enter your professional information once. PortoTional generates your
            ATS-ready CVs, public profile and personal website — with AI that
            assists but never invents.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">
                Create my professional identity <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted">
            <span>Identity</span>
            <span className="text-gold">→</span>
            <span />
            <span />
            <span>CV · Profile · Website</span>
            <span />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-y border-line bg-obsidian-raised py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-semibold text-ivory sm:text-3xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Setup",
                text: "Create your Master Identity — import an existing CV or start fresh. AI structures it; you review everything.",
              },
              {
                step: "2",
                title: "Refine",
                text: "Let AI improve wording, generate summaries and analyze ATS readiness. Facts always stay yours.",
              },
              {
                step: "3",
                title: "Showcase",
                text: "Generate tailored CVs, publish your public profile and launch your personal website.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 font-serif text-lg text-gold">
                  {item.step}
                </span>
                <h3 className="mt-4 font-medium text-ivory">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold text-ivory sm:text-3xl">
            Everything flows from one identity
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted">
            Not another CV generator &mdash; a system for your whole professional self.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="card-lift border-line">
                <CardHeader className="pb-2">
                  <f.icon className="h-5 w-5 text-gold" />
                  <CardTitle className="mt-2">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROFESSIONS */}
      <section className="border-y border-line bg-obsidian-raised py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-xl font-semibold text-ivory">
            Built for every profession
          </h2>
          <p className="mt-2 text-sm text-muted">
            PortoTional adapts its recommended sections to what you do — developer
            or designer, teacher or chef.
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {PROFESSIONS.map((p) => (
              <li
                key={p}
                className="rounded-full border border-line px-3 py-1 text-xs text-ivory-dim"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-semibold text-ivory sm:text-3xl">
            Start free. Upgrade when you&apos;re ready to showcase more.
          </h2>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            <Card className="border-line">
              <CardHeader className="pb-2">
                <CardTitle>Free</CardTitle>
                <p className="text-sm text-muted">Everything essential.</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ivory-dim">
                  {["Master Identity", "Basic AI assistance", "Up to 2 CVs", "Public profile"].map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {i}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-gold/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  Pro <Badge>Rp 49rb/mo</Badge>
                </CardTitle>
                <p className="text-sm text-muted">Showcase everywhere.</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ivory-dim">
                  {["Unlimited CVs & premium templates", "Personal website on your subdomain", "Analytics & advanced AI", "Priority support"].map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {i}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-obsidian-raised py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-semibold text-ivory">
            Setup once. Showcase everywhere.
          </h2>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/signup">
              Create my professional identity <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} PortoTional. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gold">Sign in</Link>
            <Link href="/signup" className="hover:text-gold">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
