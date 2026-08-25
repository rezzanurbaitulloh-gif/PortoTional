import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const eventSchema = z.object({
  websiteId: z.string().uuid(),
  eventType: z.enum(["page_view", "resume_download", "cta_click", "qr_scan"]),
  path: z.string().max(300).default("/"),
  referrer: z.string().max(400).default(""),
  sessionId: z.string().min(6).max(80),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

function parseDevice(ua: string): string {
  const s = ua.toLowerCase();
  if (s.includes("mobile") || s.includes("android")) return "mobile";
  if (s.includes("ipad") || s.includes("tablet")) return "tablet";
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }
    const { websiteId, eventType, path, referrer, sessionId, metadata } =
      parsed.data;

    const admin = getSupabaseAdminClient();
    const { data: site } = await admin
      .from("websites")
      .select("id")
      .eq("id", websiteId)
      .eq("published", true)
      .maybeSingle();
    if (!site) return NextResponse.json({ ok: false }, { status: 200 });

    await admin.from("analytics_events").insert({
      website_id: websiteId,
      event_type: eventType,
      path,
      referrer: referrer.slice(0, 400),
      device: parseDevice(req.headers.get("user-agent") ?? ""),
      anonymous_session_id: sessionId,
      metadata,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
