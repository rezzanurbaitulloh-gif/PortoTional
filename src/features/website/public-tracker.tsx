"use client";

import { useEffect, useRef } from "react";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem("porto-sid");
    if (!id) {
      id = `s-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      sessionStorage.setItem("porto-sid", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export function PublicTracker({ websiteId }: { websiteId: string | null }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!websiteId || sent.current) return;
    sent.current = true;
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        websiteId,
        eventType: "page_view",
        path: window.location.pathname,
        referrer: document.referrer,
        sessionId: getSessionId(),
        metadata: {},
      }),
      keepalive: true,
    }).catch(() => {});
  }, [websiteId]);

  return null;
}

export async function trackEvent(
  websiteId: string | null,
  eventType: "resume_download" | "cta_click" | "qr_scan",
  label?: string,
) {
  if (!websiteId) return;
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        websiteId,
        eventType,
        path: window.location.pathname,
        referrer: document.referrer,
        sessionId: getSessionId(),
        metadata: label ? { label } : {},
      }),
      keepalive: true,
    });
  } catch {}
}

export function TrackedExternalLink({
  websiteId,
  href,
  label,
  children,
  className,
}: {
  websiteId: string | null;
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={className}
      onClick={() => void trackEvent(websiteId, "cta_click", label)}
    >
      {children}
    </a>
  );
}
