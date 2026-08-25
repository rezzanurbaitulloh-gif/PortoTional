export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface ChatResult {
  text: string;
  provider: string;
  model: string;
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

interface ProviderConfig {
  name: string;
  baseUrl: string;
  keys: string[];
  models: string[];
}

function buildProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  const naraKeys = (process.env.NARA_API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (naraKeys.length && process.env.NARA_BASE_URL) {
    providers.push({
      name: "nara",
      baseUrl: process.env.NARA_BASE_URL.replace(/\/$/, ""),
      keys: naraKeys,
      models: (process.env.NARA_DEFAULT_MODEL ?? "mistral-large")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
    });
  }
  const chinaKeys = (process.env.CHINA_API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (chinaKeys.length && process.env.CHINA_BASE_URL) {
    providers.push({
      name: "china",
      baseUrl: process.env.CHINA_BASE_URL.replace(/\/$/, ""),
      keys: chinaKeys,
      models: (process.env.CHINA_DEFAULT_MODEL ?? "qwen-plus")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
    });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: "gemini",
      baseUrl: (
        process.env.GEMINI_BASE_URL ??
        "https://generativelanguage.googleapis.com/v1beta/openai/"
      ).replace(/\/$/, ""),
      keys: [process.env.GEMINI_API_KEY],
      models: [process.env.GEMINI_MODEL ?? "gemini-2.5-flash"],
    });
  }
  return providers;
}

export class AiGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiGatewayError";
  }
}

async function callOpenAiCompatible(
  providerName: string,
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: AiMessage[],
  opts: ChatOptions,
): Promise<ChatResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 2000,
        ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new AiGatewayError(
        `${providerName}/${model} HTTP ${res.status}: ${body.slice(0, 300)}`,
      );
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: ChatResult["usage"];
      model?: string;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new AiGatewayError(`${providerName}/${model} empty output`);
    return {
      text,
      provider: providerName,
      model: data.model ?? model,
      usage: data.usage ?? {},
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function aiChat(
  messages: AiMessage[],
  opts: ChatOptions = {},
): Promise<ChatResult> {
  const providers = buildProviders();
  if (!providers.length) {
    throw new AiGatewayError(
      "No AI provider is configured on the server. Add provider credentials to continue.",
    );
  }
  const errors: string[] = [];
  for (const p of providers) {
    for (const key of p.keys) {
      for (const model of p.models) {
        try {
          return await callOpenAiCompatible(
            p.name,
            p.baseUrl,
            key,
            model,
            messages,
            opts,
          );
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err));
        }
      }
    }
  }
  console.error("[ai-gateway] all providers failed:", errors.join(" | "));
  throw new AiGatewayError(
    "The AI service is temporarily unavailable. Your data is safe — please retry in a moment.",
  );
}
