"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gold" aria-hidden />
        <h1 className="mt-4 text-lg font-semibold text-ivory">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          An unexpected error occurred. Your recent changes were saved. You can
          retry or return to the dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>
            <RotateCcw /> Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/app/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
