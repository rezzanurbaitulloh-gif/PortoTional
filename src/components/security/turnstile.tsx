"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

/**
 * §20 — Cloudflare Turnstile. Renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is configured; otherwise renders nothing and the server skips verification.
 */
export function Turnstile({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
      setReady(true);
      return;
    }
    window.onTurnstileLoad = () => setReady(true);
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    s.async = true;
    document.head.appendChild(s);
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey || !ready || !ref.current || !window.turnstile) return;
    const widgetId = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(null),
    });
    return () => {
      try {
        window.turnstile?.reset(widgetId);
      } catch {}
    };
  }, [siteKey, ready, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="mt-3" aria-label="Bot verification" />;
}

export function turnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
