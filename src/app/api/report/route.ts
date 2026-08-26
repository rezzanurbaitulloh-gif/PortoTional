import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";

const schema = z.object({
  target_type: z.enum(["profile", "website"]),
  target_username: z.string().min(2).max(40),
  reason: z.enum([
    "inappropriate_content",
    "impersonation",
    "spam",
    "fake_information",
    "other",
  ]),
  details: z.string().max(1000).default(""),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid report." }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    // Resolve the target profile and make sure it exists.
    const { data: target } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("username", parsed.data.target_username)
      .maybeSingle();
    if (!target) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    if (target.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot report your own profile." },
        { status: 400 },
      );
    }

    // Basic self-spam guard: max 5 open reports per reporter.
    const { count } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("reporter_user_id", user.id)
      .in("status", ["open", "reviewing"]);
    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: "You already have open reports. Please wait for review." },
        { status: 429 },
      );
    }

    const { error } = await supabase.from("reports").insert({
      reporter_user_id: user.id,
      ...parsed.data,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit report." },
      { status: 500 },
    );
  }
}
