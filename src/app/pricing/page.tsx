import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free with your Master Identity. Upgrade to Pro for unlimited CVs, premium templates, personal website and analytics.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-obsidian-raised">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
          <Button size="sm" variant="secondary" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-center text-3xl font-semibold text-ivory">Pricing</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Payments in Indonesia are handled securely via Midtrans.
        </p>

        <div className="mt-12 grid gap-5 text-left sm:grid-cols-2">
          <Card className="border-line">
            <CardHeader className="pb-3">
              <CardTitle>Free</CardTitle>
              <p className="text-sm text-muted">Rp 0 — forever</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-ivory-dim">
                {[
                  "Master Professional Identity",
                  "Basic AI: refine & summary",
                  "Up to 2 CVs · A4 & F4 export",
                  "Free CV templates",
                  "Public profile & sharing",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {i}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gold/50 shadow-[0_0_40px_rgba(212,175,55,0.06)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2">
                Pro <Badge>Rp 49rb/mo</Badge>
              </CardTitle>
              <p className="text-sm text-muted">Billed monthly via Midtrans</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-ivory-dim">
                {[
                  "Everything in Free",
                  "Unlimited CVs",
                  "Premium CV templates (Executive Gold)",
                  "Personal website at username.portotional.vercel.app",
                  "Website analytics (privacy-friendly)",
                  "Advanced AI: job tailoring & CV analysis",
                  "Priority support",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {i}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" asChild>
                <Link href="/signup?plan=pro">Start free — upgrade anytime</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          Payment status is always verified server-side through Midtrans webhooks
          before Pro features activate.
        </p>
      </main>
    </div>
  );
}
