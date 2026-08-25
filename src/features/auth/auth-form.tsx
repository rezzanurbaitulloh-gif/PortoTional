"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/logo";

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.11-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.75 12 .75 7.4.75 3.44 3.4 1.53 7.26l3.66 2.84C6.09 7.31 8.8 5.04 12 5.04z"
      />
      <path
        fill="#4285F4"
        d="M23.25 12.27c0-.85-.08-1.67-.22-2.46H12v4.65h6.32c-.27 1.46-1.09 2.69-2.32 3.52l3.62 2.81c2.12-1.96 3.63-4.85 3.63-8.52z"
      />
      <path
        fill="#FBBC05"
        d="M5.19 14.4a7.2 7.2 0 0 1 0-4.3L1.53 7.26a11.26 11.26 0 0 0 0 9.98l3.66-2.84z"
      />
      <path
        fill="#34A853"
        d="M12 23.25c3.04 0 5.59-1 7.45-2.72l-3.62-2.81c-1 .68-2.29 1.08-3.83 1.08-3.2 0-5.91-2.27-6.81-5.4l-3.66 2.84c1.91 3.86 5.87 7.01 10.47 7.01z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "oauth"
      ? "Sign-in with that provider failed or was cancelled."
      : null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const nextPath =
    searchParams.get("next") &&
    searchParams.get("next")!.startsWith("/") &&
    !searchParams.get("next")!.startsWith("//")
      ? searchParams.get("next")!
      : "/app/dashboard";

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = getSupabaseBrowserClient();
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/onboarding");
        } else {
          setMessage(
            "Check your inbox — we sent a confirmation link to finish creating your account.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(nextPath);
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-ivory">
            {mode === "login"
              ? "Welcome back"
              : "Create your professional identity"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "login"
              ? "Sign in to continue building your Master Identity."
              : "Setup once — showcase everywhere."}
          </p>

          <div className="mt-6 grid gap-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null || loading}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => handleOAuth("github")}
              disabled={oauthLoading !== null || loading}
            >
              {oauthLoading === "github" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <GithubIcon />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="gold-rule flex-1 opacity-40" />
            <span className="text-xs uppercase tracking-widest text-muted">
              or with email
            </span>
            <div className="gold-rule flex-1 opacity-40" />
          </div>

          <form onSubmit={handleEmailAuth} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "signup" ? "At least 8 characters" : "Your password"
                }
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
            {message ? (
              <p role="status" className="text-sm text-success">
                {message}
              </p>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : <Mail />}
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {mode === "login" ? (
              <>
                New to PortoTional?{" "}
                <Link href="/signup" className="text-gold hover:underline">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-gold hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
