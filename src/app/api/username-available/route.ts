import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.object({ username: z.string().min(1).max(60) });

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    username: req.nextUrl.searchParams.get("username") ?? "",
  });
  if (!parsed.success || !/^[a-z0-9][a-z0-9_-]{1,38}$/.test(parsed.data.username)) {
    return NextResponse.json({ available: false });
  }
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("is_username_available", {
    candidate: parsed.data.username,
  });
  if (error) {
    return NextResponse.json(
      { error: "Could not check availability right now." },
      { status: 502 },
    );
  }
  return NextResponse.json({ available: data === true });
}
