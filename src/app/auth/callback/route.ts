import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app/dashboard";

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .maybeSingle();

      const safeNext =
        next.startsWith("/") && !next.startsWith("//") ? next : "/app/dashboard";
      const forwardSlash = safeNext.indexOf("/", 1);
      const dest =
        !profile?.onboarding_completed &&
        !safeNext.startsWith("/onboarding")
          ? "/onboarding"
          : forwardSlash === -1
            ? safeNext
            : safeNext;
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
