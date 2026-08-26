import { NextRequest, NextResponse } from "next/server";

/** §20 — server-side Turnstile verification. Skipped when unconfigured. */
export async function POST(req: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: true, skipped: true });

  let token = "";
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
      },
    );
    const data = await res.json();
    if (!data.success) {
      return NextResponse.json({ error: "Verification failed." }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // Fail closed on network errors — abuse-sensitive flow.
    return NextResponse.json({ error: "Verification unavailable." }, { status: 502 });
  }
}
