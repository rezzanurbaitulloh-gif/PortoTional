import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";

const TABLES = [
  "profiles",
  "experiences",
  "educations",
  "skills",
  "works",
  "achievements",
  "certifications",
  "languages",
  "social_links",
] as const;

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await getSupabaseServerClient();
    const admin = getSupabaseAdminClient();

    const bundle: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      account: { id: user.id, email: user.email },
    };

    for (const table of TABLES) {
      const { data } = await supabase.from(table).select("*");
      bundle[table] = data ?? [];
    }

    // CVs and related content live under the profile; fetch by ownership.
    const { data: resumes } = await supabase.from("resumes").select("*");
    bundle.resumes = resumes ?? [];
    const resumeIds = (resumes ?? []).map((r) => r.id);
    if (resumeIds.length) {
      const [sections, versions] = await Promise.all([
        supabase.from("resume_sections").select("*").in("resume_id", resumeIds),
        supabase.from("resume_versions").select("*").in("resume_id", resumeIds),
      ]);
      bundle.resume_sections = sections.data ?? [];
      bundle.resume_versions = versions.data ?? [];
    }

    const [websites, payments, notifications] = await Promise.all([
      supabase.from("websites").select("*"),
      supabase.from("payments").select("*"),
      supabase.from("notifications").select("*"),
    ]);
    bundle.websites = websites.data ?? [];
    bundle.payments = payments.data ?? [];
    bundle.notifications = notifications.data ?? [];

    void admin;

    return new NextResponse(JSON.stringify(bundle, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="portotional-export-${user.id.slice(0, 8)}.json"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed." },
      { status: 500 },
    );
  }
}
