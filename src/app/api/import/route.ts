import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { aiChat } from "@/lib/ai/gateway";
import { importStructureMessages } from "@/lib/ai/prompts";
import { getPlan } from "@/services/identity";
import { planLimits } from "@/lib/constants";
import { rateLimit } from "@/lib/ai/rate-limit";
import { z } from "zod";

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_BYTES = 20 * 1024 * 1024;

const extractedSchema = z.object({
  fullName: z.string().default(""),
  headline: z.string().default(""),
  summary: z.string().default(""),
  location: z.string().default(""),
  experiences: z
    .array(
      z.object({
        organization: z.string().default(""),
        title: z.string().default(""),
        description: z.string().default(""),
        startDate: z.string().nullable().default(null),
        endDate: z.string().nullable().default(null),
        isCurrent: z.boolean().default(false),
      }),
    )
    .default([]),
  educations: z
    .array(
      z.object({
        institution: z.string().default(""),
        degree: z.string().default(""),
        field: z.string().default(""),
        startDate: z.string().nullable().default(null),
        endDate: z.string().nullable().default(null),
      }),
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  certifications: z
    .array(
      z.object({
        name: z.string().default(""),
        issuer: z.string().default(""),
        issueDate: z.string().nullable().default(null),
      }),
    )
    .default([]),
});

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    const mod = (await import("pdf-parse")) as unknown as {
      default?: unknown;
    } & Record<string, unknown>;
    const pdfParse = (mod.default ?? mod) as (
      buf: Buffer,
    ) => Promise<{ text: string }>;
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buf);
    return result.text;
  }
  const mammoth = await import("mammoth");
  const buf = Buffer.from(await file.arrayBuffer());
  const result = await mammoth.extractRawText({ buffer: buf });
  return result.value;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const plan = await getPlan(user.id);
    const rl = rateLimit(`import:${user.id}`, Math.min(planLimits(plan).aiPerHour, 10));
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Import limit reached for this hour. Please try again later." },
        { status: 429 },
      );
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported format. Upload a PDF or DOCX file." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum is 20 MB." },
        { status: 400 },
      );
    }

    let text: string;
    try {
      text = await extractText(file);
    } catch {
      return NextResponse.json(
        {
          error:
            "We could not read that file. It may be corrupted or password-protected — try another PDF or DOCX.",
        },
        { status: 422 },
      );
    }
    if (!text.trim()) {
      return NextResponse.json(
        {
          error:
            "No readable text found. If your CV is a scanned image, type your details manually instead.",
        },
        { status: 422 },
      );
    }

    const result = await aiChat(importStructureMessages(text), {
      jsonMode: true,
      temperature: 0.1,
    });

    let jsonText = result.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
    }
    let raw: unknown;
    try {
      raw = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: "The AI could not structure this CV reliably. Try again or enter details manually." },
        { status: 502 },
      );
    }

    const parsed = extractedSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "The AI output did not match the expected structure." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      detected: parsed.data,
      meta: { provider: result.provider, model: result.model, chars: text.length },
    });
  } catch (err) {
    console.error("[import]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed." },
      { status: 502 },
    );
  }
}
