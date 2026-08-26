import type { Metadata } from "next";
import Link from "next/link";
import { Apple, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Download PortoTional",
  description:
    "Download the PortoTional Android app (direct APK) or use PortoTional Web on any device. iOS installation guide included.",
};

const APK_URL = process.env.NEXT_PUBLIC_APK_URL ?? "";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";

export default function DownloadPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-ivory">
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ivory">
          Get PortoTional
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Pick your platform. Your Master Identity, CVs and profile stay in
          sync across web and mobile.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Smartphone className="h-4 w-4 text-gold" /> Android
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted">
                Direct APK distribution while we prepare Play Store release.
              </p>
              {APK_URL ? (
                <>
                  <Button asChild className="mt-3 w-full">
                      <a href={APK_URL} download>
                      Download APK
                    </a>
                  </Button>
                  <ul className="mt-3 space-y-1 text-[11px] text-muted">
                    <li>Version {APP_VERSION}</li>
                    <li>Minimum Android 8.0 (Oreo)</li>
                    <li>Install: allow &quot;install unknown apps&quot; for your browser, then open the downloaded file.</li>
                  </ul>
                </>
              ) : (
                <p className="mt-3 rounded-md border border-line bg-surface-2 p-3 text-[11px] leading-relaxed text-muted">
                  The APK is not published yet. Meanwhile, the best Android
                  experience is{" "}
                  <Link href="/signup" className="text-gold hover:underline">
                    PortoTional Web
                  </Link>{" "}
                  — add it to your home screen for an app-like feel.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Apple className="h-4 w-4 text-gold" /> iOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted">
                Pre-App Store distribution uses TestFlight, per Apple policy.
              </p>
              <p className="mt-3 rounded-md border border-line bg-surface-2 p-3 text-[11px] leading-relaxed text-muted">
                TestFlight invites open with the beta. Until then, use
                PortoTional Web — it installs to your home screen like an app.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Monitor className="h-4 w-4 text-gold" /> Desktop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted">
                The full builder experience lives on the web — no install
                needed.
              </p>
              <Button asChild variant="secondary" className="mt-3 w-full">
                <Link href="/signup">Use PortoTional Web</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
