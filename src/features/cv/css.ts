export function resumeCss(): string {
  return `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; color: #1a1c20; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

.page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 14mm 15mm; }
.page-f4 { width: 210mm; min-height: 330mm; }
.page-letter { width: 216mm; min-height: 279mm; }

.rt-doc { line-height: 1.45; }
.rt-header { display: flex; align-items: center; gap: 14pt; margin-bottom: 12pt; }
.rt-photo { width: 26mm; height: 26mm; object-fit: cover; border-radius: 50%; border: 2px solid var(--accent, #0b0c10); flex-shrink: 0; }
.rt-name { font-size: 2.05em; letter-spacing: -0.5px; color: #111318; font-weight: 700; }
.rt-tagline { margin-top: 3pt; color: #555b66; font-size: 0.95em; }
.rt-section { margin-top: 11pt; break-inside: auto; }
.rt-section h2 { font-size: 1.02em; text-transform: uppercase; letter-spacing: 1.6px; color: var(--accent, #0b0c10); border-bottom: 1.4px solid var(--accent, #0b0c10); padding-bottom: 3pt; margin-bottom: 7pt; break-after: avoid-page; }
.rt-item { margin-bottom: 8.5pt; break-inside: avoid; }
.rt-item-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8pt; }
.rt-item-title { font-weight: 700; font-size: 1em; color: #17191f; }
.rt-item-range { font-size: 0.82em; color: #6a7079; white-space: nowrap; }
.rt-item-sub { margin-top: 1pt; font-size: 0.88em; color: #4d525b; font-style: italic; }
.rt-bullets { margin-top: 3pt; padding-left: 13pt; }
.rt-bullets li { margin-bottom: 2.2pt; font-size: 0.92em; color: #2a2d33; }
.rt-summary { font-size: 0.95em; color: #2a2d33; }
.rt-skills { list-style: none; display: flex; flex-wrap: wrap; gap: 4pt; }
.rt-skills li { border: 1px solid #d8dbe0; border-radius: 999px; padding: 1.6pt 7pt; font-size: 0.85em; color: #2a2d33; break-inside: avoid; }
.rt-tags { margin-top: 2pt; font-size: 0.78em; color: #6a7079; }

.rt-modern-minimal .rt-header { flex-direction: column; align-items: flex-start; gap: 4pt; }
.rt-modern-minimal .rt-name { color: var(--accent, #2563eb); }
.rt-modern-minimal .rt-section h2 { color: #17191f; border-bottom-color: #e2e4e8; }

/* Executive Gold */
.rt-executive-gold .rt-name { font-family: Georgia, "Times New Roman", serif; letter-spacing: 0.5px; }
.rt-executive-gold { background: linear-gradient(180deg, rgba(212,175,55,.06), transparent 90px); }
.rt-executive-gold .rt-tagline { color: #7c6a33; }
.rt-executive-gold .rt-section h2 { border-bottom-width: 2.2px; }

/* Two-Column Modern: sidebar via float-free grid */
.rt-two-column-modern .rt-doc { display: grid; grid-template-columns: 32% 1fr; gap: 0 9mm; }
.rt-two-column-modern .rt-header { grid-column: 1 / -1; display:flex; align-items:center; gap:14pt; margin-bottom:12pt; }
.rt-two-column-modern .rt-section[data-side="main"] { }
.rt-two-column-modern .rt-section h2 { font-size: .92em; }
.rt-two-column-modern .rt-item-row { display:block; }
.rt-two-column-modern .rt-item-range { display:block; margin-top:1pt; }

/* Academic Serif */
.rt-academic-serif { font-family: Georgia, "Times New Roman", serif; }
.rt-academic-serif .rt-name { font-size: 1.7em; letter-spacing: 0; }
.rt-academic-serif .rt-section { margin-top: 8pt; }
.rt-academic-serif .rt-section h2 { text-transform: none; letter-spacing: .4px; border-bottom-style: double; border-bottom-width: 3px; }
.rt-academic-serif .rt-item { margin-bottom: 6.5pt; }

/* Creative Bold */
.rt-creative-bold .rt-header { display:block; padding: 18pt 0 12pt; border-top: 6px solid var(--accent); }
.rt-creative-bold .rt-name { font-size: 2.8em; line-height: 1; text-transform: uppercase; letter-spacing: 2px; color: var(--accent); }
.rt-creative-bold .rt-tagline { font-size: 1.05em; color:#17191f; margin-top:6pt; }
.rt-creative-bold .rt-section h2 { color:#17191f; border-bottom-color: var(--accent); border-bottom-width: 2px; }

/* Student Compact */
.rt-student-compact { font-size: .95em; }
.rt-student-compact .rt-name { font-size: 1.65em; }
.rt-student-compact .rt-section { margin-top: 7pt; }
.rt-student-compact .rt-section h2 { margin-bottom: 4pt; padding-bottom: 2pt; }
.rt-student-compact .rt-item { margin-bottom: 5.5pt; }
.rt-student-compact .rt-bullets li { margin-bottom: 1.6pt; }

/* Developer Tech */
.rt-developer-tech .rt-name, .rt-developer-tech .rt-section h2 { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
.rt-developer-tech .rt-section h2::before { content: "// "; color: var(--accent); }
.rt-developer-tech .rt-tags { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
.rt-developer-tech .rt-skills li { border-radius: 4px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
`;
}

export const RESUME_PAGE_SIZES = {
  A4: { width: "210mm", height: "297mm" },
  F4: { width: "210mm", height: "330mm" },
  LETTER: { width: "216mm", height: "279mm" },
} as const;
