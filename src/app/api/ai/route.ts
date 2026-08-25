import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { aiChat } from "@/lib/ai/gateway";
import {
  analyzeMessages,
    refineMessages,
  summaryMessages,
  tailorMessages,
  translateMessages,
} from "@/lib/ai/prompts";
import { rateLimit } from "@/lib/ai/rate-limit";
import { getPlan } from "@/services/identity";
import { planLimits } from "@/lib/constants";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("refine"),
    text: z.string().min(1).max(6000),
    context: z.string().max(200).default("resume content"),
    language: z.enum(["en", "id"]).default("en"),
  }),
  z.object({
    action: z.literal("summary"),
    profile: z.record(z.string(), z.unknown()),
  }),
  z.object({
    action: z.literal("tailor"),
    snapshot: z.record(z.string(), z.unknown()),
    jobDescription: z.string().min(30).max(8000),
  }),
  z.object({
    action: z.literal("analyze"),
    snapshot: z.record(z.string(), z.unknown()),
  }),
  z.object({
    action: z.literal("translate"),
    text: z.string().min(1).max(4000),
    targetLanguage: z.string().max(40),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    const plan = await getPlan(user.id);
    const limit = planLimits(plan).aiPerHour;
    const rl = rateLimit(`ai:${user.id}`, limit);
    if (!rl.ok) {
      return NextResponse.json(
        {
          error: `You have reached your hourly AI limit (${limit} requests on the ${plan} plan). Try again in about ${Math.ceil(rl.retryAfterSec / 60)} minutes.`,
        },
        { status: 429 },
      );
    }

    let messages;
    let jsonMode = false;
    switch (parsed.data.action) {
      case "refine":
        messages = refineMessages(parsed.data.text, parsed.data.context, parsed.data.language);
        break;
      case "summary":
        messages = summaryMessages(parsed.data.profile);
        break;
      case "tailor":
        jsonMode = true;
        messages = tailorMessages({
          resumeSnapshot: parsed.data.snapshot,
          jobDescription: parsed.data.jobDescription,
        });
        break;
      case "analyze":
        jsonMode = true;
        messages = analyzeMessages({ resumeSnapshot: parsed.data.snapshot });
        break;
      case "translate":
        messages = translateMessages(parsed.data.text, parsed.data.targetLanguage);
        break;
    }

    const result = await aiChat(messages, { jsonMode });

    const supabase = await getSupabaseServerClient();
    await supabase.from("ai_generations").insert({
      user_id: user.id,
      type: parsed.data.action,
      input_reference: {},
      output: { text: result.text },
      provider: result.provider,
      model: result.model,
      token_usage: result.usage,
    });

    return NextResponse.json({
      text: result.text,
      provider: result.provider,
      model: result.model,
      remaining: rl.remaining,
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message === "UNAUTHENTICATED"
        ? "Please sign in to use AI features."
        : err instanceof Error
          ? err.message
          : "The AI service could not complete this request.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
