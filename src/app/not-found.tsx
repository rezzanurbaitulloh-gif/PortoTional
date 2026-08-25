import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <p className="mt-10 font-serif text-6xl text-gold">404</p>
      <h1 className="mt-4 text-lg font-medium text-ivory">
        This page could not be found
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted">
        The link may be outdated or the profile doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md border border-line px-4 py-2 text-sm text-ivory-dim transition-colors hover:border-gold/50 hover:text-gold"
      >
        Back to home
      </Link>
    </div>
  );
}
