# PortoTional

**Setup Once, Showcase Everywhere.**
AI-powered Professional Identity & Digital Showcase Platform — satu Master
Professional Identity untuk menghasilkan CV ATS-ready, profil publik, dan
website personal.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · komponen UI gaya shadcn (Radix)
- Supabase — PostgreSQL + RLS, Auth (Email / Google / GitHub), Storage
- AI Gateway dengan provider abstraction + key rotation
  (Mistral → Qwen → Gemini sebagai fallback berantai)
- PDF: HTML/CSS → Chromium (Puppeteer) — bukan screenshot
- Midtrans Snap (IDR) dengan verifikasi webhook server-side

## Link
- https://portotional.vercel.app/


## Prinsip produk

1. **Identity First** — Master Identity adalah sumber kebenaran tunggal.
2. **AI assists, never invents** — Truth Guard melarang AI mengarang fakta;
   semua saran wajib melewati Accept / Reject / Edit.
3. **Universal by design** — Profession Schema (24 profesi terseed), bukan
   asumsi developer-only.
4. **Privacy by default** — profil privat; publikasi eksplisit per-bagian.
5. **RLS di semua tabel user-owned** — otorisasi tidak pernah hanya di client.

