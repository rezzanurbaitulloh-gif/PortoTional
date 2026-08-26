import type { ResumeDoc } from "./document";
import { resumeCss } from "./css";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtRange(
  start: string | null,
  end: string | null,
  current: boolean,
): string {
  const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short" };
  const s = start
    ? new Date(start + "T00:00:00").toLocaleDateString("en-US", opts)
    : "";
  const e = current
    ? "Present"
    : end
      ? new Date(end + "T00:00:00").toLocaleDateString("en-US", opts)
      : "";
  return [s, e].filter(Boolean).join(" — ");
}

function bulletsHtml(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (!lines.length) return "";
  return `<ul class="rt-bullets">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
}

export function buildResumeBody(doc: ResumeDoc): string {
  const scale = doc.fontScale || 1;
  const parts: string[] = [];

  parts.push(
    `<header class="rt-header">` +
      (doc.showPhoto && doc.profile.photoUrl
        ? `<img class="rt-photo" src="${esc(doc.profile.photoUrl)}" alt="" />`
        : "") +
      `<div class="rt-headline-block"><h1 class="rt-name">${esc(
        doc.profile.fullName || "Your Name",
      )}</h1><p class="rt-tagline">${esc(
        [doc.profile.headline, doc.profile.profession, doc.profile.location]
          .filter(Boolean)
          .join("  ·  ") || "Professional",
      )}</p></div></header>`,
  );

  for (const section of doc.sections.filter((s) => s.visible)) {
    switch (section.type) {
      case "summary": {
        const text = doc.profile.summaryOverride ?? doc.profile.masterSummary;
        if (!text.trim()) break;
        parts.push(
          `<section class="rt-section"><h2>Professional Summary</h2><p class="rt-summary">${esc(text)}</p></section>`,
        );
        break;
      }
      case "experience": {
        if (!doc.experiences.length) break;
        parts.push(
          `<section class="rt-section"><h2>Experience</h2>` +
            doc.experiences
              .map(
                (e) =>
                  `<article class="rt-item"><div class="rt-item-row"><span class="rt-item-title">${esc(e.title)}</span><span class="rt-item-range">${esc(fmtRange(e.startDate, e.endDate, e.isCurrent))}</span></div><p class="rt-item-sub">${esc([e.organization, e.location].filter(Boolean).join(" · "))}</p>${bulletsHtml(e.description)}</article>`,
              )
              .join("") +
            `</section>`,
        );
        break;
      }
      case "education": {
        if (!doc.educations.length) break;
        parts.push(
          `<section class="rt-section"><h2>Education</h2>` +
            doc.educations
              .map((ed) => {
                return `<article class="rt-item"><div class="rt-item-row"><span class="rt-item-title">${esc(ed.institution)}</span><span class="rt-item-range">${esc(fmtRange(ed.startDate, ed.endDate, false))}</span></div><p class="rt-item-sub">${esc([ed.degree, ed.field].filter(Boolean).join(", "))}</p></article>`;
              })
              .join("") +
            `</section>`,
        );
        break;
      }
      case "skills": {
        if (!doc.skills.length) break;
        parts.push(
          `<section class="rt-section"><h2>Skills</h2><ul class="rt-skills">${doc.skills
            .map((s) => `<li>${esc(s.name)}</li>`)
            .join("")}</ul></section>`,
        );
        break;
      }
      case "projects": {
        if (!doc.works.length) break;
        parts.push(
          `<section class="rt-section"><h2>Projects &amp; Works</h2>` +
            doc.works
              .map((w) => {
                const title = w.url
                  ? `<a href="${esc(w.url)}" style="color:inherit">${esc(w.title)}</a>`
                  : esc(w.title);
                return `<article class="rt-item"><div class="rt-item-row"><span class="rt-item-title">${title}</span><span class="rt-item-range">${esc(fmtRange(w.startDate, w.endDate, false))}</span></div>${w.role ? `<p class="rt-item-sub">${esc(w.role)}</p>` : ""}${bulletsHtml(w.description)}${w.tags?.length ? `<p class="rt-tags">${esc(w.tags.join(" · "))}</p>` : ""}</article>`;
              })
              .join("") +
            `</section>`,
        );
        break;
      }
      case "certifications": {
        if (!doc.certifications.length) break;
        parts.push(
          `<section class="rt-section"><h2>Certifications</h2>` +
            doc.certifications
              .map((c) => {
                const issued = c.issueDate
                  ? new Date(c.issueDate + "T00:00:00").toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })
                  : "";
                return `<article class="rt-item"><div class="rt-item-row"><span class="rt-item-title">${esc(c.name)}</span><span class="rt-item-range">${esc(issued)}</span></div>${c.issuer ? `<p class="rt-item-sub">${esc(c.issuer)}${c.credentialId ? ` · ID ${esc(c.credentialId)}` : ""}</p>` : ""}</article>`;
              })
              .join("") +
            `</section>`,
        );
        break;
      }
    }
  }

  return (
    `<div class="rt-doc rt-${doc.templateSlug}" style="font-size:${10 * scale}pt;--accent:${doc.accentColor}">` +
    parts.join("") +
    `</div>`
  );
}

export function buildResumeHtml(doc: ResumeDoc): string {
  const body = buildResumeBody(doc);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${resumeCss()}</style>
</head>
<body class="page ${doc.pageSize === "F4" ? "page-f4" : doc.pageSize === "LETTER" ? "page-letter" : "page-a4"}">
${body}
</body>
</html>`;
}
