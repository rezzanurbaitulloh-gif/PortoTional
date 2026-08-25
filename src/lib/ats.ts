export interface AtsBreakdown {
  structure: number;
  readability: number;
  keywords: number;
  consistency: number;
  parsingSafety: number;
}

export interface AtsReport {
  score: number;
  breakdown: AtsBreakdown;
  notes: { area: string; note: string }[];
}

interface AtsInput {
  hasSummary: boolean;
  summaryLength: number;
  experienceCount: number;
  educationCount: number;
  skillCount: number;
  bulletsPerExperience: number[];
  avgSentenceWords: number;
  targetJobDescription: string | null;
  skillNames: string[];
  dateRangesValid: boolean;
  usesStandardHeadings: boolean;
  specialCharacterHeavy: boolean;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function analyzeAts(input: AtsInput): AtsReport {
  const notes: AtsReport["notes"] = [];

  let structure = 40;
  if (input.hasSummary) structure += 15;
  else notes.push({ area: "Structure", note: "Add a short professional summary at the top." });
  if (input.experienceCount > 0) structure += 15;
  else notes.push({ area: "Structure", note: "Include at least one work or project experience." });
  if (input.educationCount > 0) structure += 10;
  else notes.push({ area: "Structure", note: "Add your education history." });
  if (input.skillCount >= 5) structure += 10;
  else notes.push({ area: "Structure", note: "List more skills (at least five)." });
  if (input.usesStandardHeadings) structure += 10;
  else notes.push({ area: "Structure", note: "Use standard section headings so parsers recognize them." });

  const avgBullets =
    input.bulletsPerExperience.length > 0
      ? input.bulletsPerExperience.reduce((a, b) => a + b, 0) /
        input.bulletsPerExperience.length
      : 0;
  let readability = 45 + Math.min(avgBullets, 6) * 6;
  if (input.avgSentenceWords > 0 && input.avgSentenceWords <= 22)
    readability += 12;
  else
    notes.push({
      area: "Readability",
      note: "Shorten sentences to around 12–20 words for better readability.",
    });
  readability = clamp(readability);

  let keywords = 55;
  if (input.targetJobDescription && input.skillNames.length > 0) {
    const jd = input.targetJobDescription.toLowerCase();
    const matched = input.skillNames.filter((s) =>
      jd.includes(s.toLowerCase()),
    ).length;
    keywords = 50 + (matched / input.skillNames.length) * 50;
    if (matched / input.skillNames.length < 0.4) {
      notes.push({
        area: "Keywords",
        note:
          "Only some of your skills appear in the job description. If they genuinely apply, mention them in relevant bullets.",
      });
    }
  } else if (!input.targetJobDescription) {
    keywords = 70;
    notes.push({
      area: "Keywords",
      note: "Add a job description in the CV settings to measure keyword relevance.",
    });
  }

  const consistency = input.dateRangesValid ? 95 : 60;
  if (!input.dateRangesValid)
    notes.push({
      area: "Consistency",
      note: "Some date ranges look inconsistent — check start and end dates.",
    });

  let parsingSafety = 90;
  if (input.specialCharacterHeavy) {
    parsingSafety -= 15;
    notes.push({
      area: "Parsing safety",
      note: "Reduce decorative symbols and special characters; ATS parsers prefer plain text.",
    });
  }

  const breakdown: AtsBreakdown = {
    structure: clamp(structure),
    readability: clamp(readability),
    keywords: clamp(keywords),
    consistency: clamp(consistency),
    parsingSafety: clamp(parsingSafety),
  };

  return {
    score: Math.round(
      Object.values(breakdown).reduce((a, b) => a + b, 0) /
        Object.keys(breakdown).length,
    ),
    breakdown,
    notes,
  };
}
