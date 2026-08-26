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

.rt-modern .rt-header { flex-direction: column; align-items: flex-start; gap: 4pt; }
.rt-modern .rt-name { color: var(--accent, #2563eb); }
.rt-modern .rt-section h2 { color: #17191f; border-bottom-color: #e2e4e8; }
.rt-gold .rt-name { font-family: Georgia, "Times New Roman", serif; }
.rt-gold .rt-tagline { color: #7c6a33; }
`;
}

export const RESUME_PAGE_SIZES = {
  A4: { width: "210mm", height: "297mm" },
  F4: { width: "210mm", height: "330mm" },
  LETTER: { width: "216mm", height: "279mm" },
} as const;
