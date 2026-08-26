import type { Metadata } from "next";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Under maintenance",
  robots: { index: false },
};

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-line px-4 py-4">
        <Link href="/" aria-label="PortoTional home">
          <Logo />
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <Wrench className="mx-auto h-12 w-12 text-gold" aria-hidden />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ivory">
            PortoTional is temporarily under maintenance
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            We are making things better. Please check back in a little while —
            your data is safe and everything will be right here.
          </p>
          <p className="mt-8 text-xs text-muted">
            Follow our status updates or contact support if you need help.
          </p>
        </div>
      </div>
    </main>
  );
}
