import type { AiMessage } from "./gateway";

const TRUTH_GUARD = `ABSOLUTE RULES — TRUTH GUARD:
1. Never fabricate professional facts. Do not invent companies, roles, employers, schools, dates, numbers, metrics, skills, certificates, achievements, projects or education that are not explicitly present in the provided data.
2. You may: fix grammar and spelling, improve professional tone, restructure sentences, summarize, translate, and reorder emphasis.
3. If the provided information is insufficient to complete the task, respond exactly with: "Insufficient information. Please provide more details."
4. Never add quantifiers like "increased sales by 40%" unless that number appears in the source data.
5. Output only the requested content. No explanations, no markdown fences unless asked.`;

export function refineMessages(
  text: string,
  context: string,
  language = "en",
): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nYou are a professional writing assistant for resumes and professional profiles. Rewrite the user's text to be concise, professional, and impactful WITHOUT adding new facts. Keep the language: ${language}. Context of where this text appears: ${context}`,
    },
    { role: "user", content: text },
  ];
}

export function summaryMessages(profileContext: unknown): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nWrite a professional summary (about/bio) of 3-4 sentences based ONLY on the structured profile data provided. Third person is not needed; write in first-person-neutral style without "I". Mention profession, years/seniority signals only if present, key skills present in data, and availability tone if present.`,
    },
    {
      role: "user",
      content: JSON.stringify(profileContext).slice(0, 8000),
    },
  ];
}

export function tailorMessages(input: {
  resumeSnapshot: unknown;
  jobDescription: string;
}): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nYou help tailor an existing CV's wording to a job description. Using ONLY facts inside the provided CV snapshot: suggest reordered section emphasis, improved bullet phrasing aligned with the job description keywords that genuinely match existing experience, and a rewritten professional summary targeted at the role. Return strict JSON: {"summary": string, "suggestions": [{"section": string, "reason": string}], "matchedKeywords": [string], "missingKeywords": [string]}`,
    },
    {
      role: "user",
      content: JSON.stringify({
        cvSnapshot: input.resumeSnapshot,
        jobDescription: input.jobDescription.slice(0, 6000),
      }).slice(0, 14000),
    },
  ];
}

export function analyzeMessages(input: {
  resumeSnapshot: unknown;
}): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nAnalyze the provided CV snapshot for clarity, completeness, ATS-friendliness, consistency and evidence strength. Be honest and specific; never invent missing details. Return strict JSON: {"strengths": [string], "improvements": [string], "atsTips": [string]}`,
    },
    { role: "user", content: JSON.stringify(input.resumeSnapshot).slice(0, 14000) },
  ];
}

export function translateMessages(
  text: string,
  targetLanguage: string,
): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nTranslate the user's text to ${targetLanguage}, keeping it professional and faithful. Do not add or remove information.`,
    },
    { role: "user", content: text },
  ];
}

export function importStructureMessages(rawText: string): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nExtract structured data from the raw CV text below. Use ONLY information actually present in the text. If a field is not found use an empty string; if a list has no entries return an empty array. Dates as YYYY-MM-DD or null (if only year given, use January 1st / December 31st appropriately). proficiency one of native|fluent|professional_working|limited_working|basic. Return strict JSON matching: {"fullName":string,"headline":string,"summary":string,"location":string,"email":"","phone":"","experiences":[{"organization":string,"title":string,"description":string,"startDate":string|null,"endDate":string|null,"isCurrent":boolean}],"educations":[{"institution":string,"degree":string,"field":string,"startDate":string|null,"endDate":string|null}],"skills":[string],"certifications":[{"name":string,"issuer":string,"issueDate":string|null}]}`,
    },
    { role: "user", content: rawText.slice(0, 24000) },
  ];
}

export function cvGenerateMessages(
  identityContext: unknown,
  targetRole?: string,
): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nGenerate a CV structure from the candidate's Master Identity. Use ONLY facts present in the data. Return strict JSON: {"summary": string, "targetRole": string, "highlights": string[]}. "summary" is a 3-4 sentence professional summary written from the data only. "targetRole" echoes the given target role, or the closest profession/title found in the data, or "" if none. "highlights" contains up to 5 one-line professional highlights drawn strictly from the data.${targetRole ? ` The candidate targets this role: ${targetRole}.` : ""}`,
    },
    { role: "user", content: JSON.stringify(identityContext).slice(0, 12000) },
  ];
}

export function websiteSuggestMessages(identityContext: unknown): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nSuggest a personal website configuration for a professional based only on their identity data. Return strict JSON: {"theme": "editorial-minimal" | "corporate-premium" | "showcase-bold", "color": "#RRGGBB", "heroTagline": string, "sectionOrder": string[], "seoTitle": string, "seoDescription": string}. Pick the theme that best fits their profession and portfolio density (showcase-bold only for visual/creative work with a real portfolio). sectionOrder must be a permutation of exactly: ["hero","about","work","experience","skills","contact"]. heroTagline max 90 chars. seoTitle max 60 chars. seoDescription max 155 chars.`,
    },
    { role: "user", content: JSON.stringify(identityContext).slice(0, 10000) },
  ];
}

export function careerMessages(history: AiMessage[]): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nYou are the PortoTional Career Assistant. Help with professional setup, writing, career preparation and CV improvement. Be concise, practical and honest. When information is missing, ask for it instead of inventing it.`,
    },
    ...history.slice(-12),
  ];
}

export function projectDescriptionMessages(
  identityContext: unknown,
  showcaseInput: { title: string; type: string; rawNotes?: string },
): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nWrite professional copy for a ${showcaseInput.type} titled "${showcaseInput.title}". Return strict JSON: {"shortDescription": string (max 200 chars, one compelling line), "fullDescription": string (2-4 sentences), "resultsImpact": string (only if results are stated in the input, else "")}. Use ONLY facts present in the provided data${showcaseInput.rawNotes ? " and the user's raw notes" : ""}.`,
    },
    {
      role: "user",
      content: JSON.stringify({ identity: identityContext, notes: showcaseInput.rawNotes ?? "" }).slice(0, 10000),
    },
  ];
}

export function caseStudyMessages(
  showcaseData: unknown,
): AiMessage[] {
  return [
    {
      role: "system",
      content: `${TRUTH_GUARD}\nStructure the provided showcase data into case-study sections. Return strict JSON: {"problem": string, "goals": string, "process": string, "solution": string, "features": string, "lessons": string}. Each field 1-3 sentences. If information for a section is missing, use an empty string — never invent details.`,
    },
    { role: "user", content: JSON.stringify(showcaseData).slice(0, 10000) },
  ];
}
