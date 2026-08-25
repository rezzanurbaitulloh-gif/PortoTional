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
  (Nara/Mistral → China/Qwen → Gemini sebagai fallback berantai)
- PDF: HTML/CSS → Chromium (Puppeteer) — bukan screenshot
- Midtrans Snap (IDR) dengan verifikasi webhook server-side

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

Env yang dibutuhkan ada di `.env.local` (Supabase URL/keys, kunci AI router,
Midtrans). `NEXT_PUBLIC_ROOT_DOMAIN=portotional.com` dipakai middleware untuk
routing subdomain `username.portotional.com → /sites/[username]`. Untuk
pengujian subdomain lokal gunakan `*.lvh.me`.

## Struktur

```
src/
├── app/            # routes (marketing, auth, app/, u/, sites/, api/)
├── components/     # ui primitives + layout
├── features/       # identity, cv, ai, website, profile, onboarding, payments
├── lib/            # supabase clients, ai gateway, pdf engine, payments, ats
├── services/       # data access layer
├── actions/        # server actions (identity, cv, website, uploads)
└── types/
supabase/migrations/ # skema lengkap + RLS + seed (profesi & template)
```

## Prinsip produk

1. **Identity First** — Master Identity adalah sumber kebenaran tunggal.
2. **AI assists, never invents** — Truth Guard melarang AI mengarang fakta;
   semua saran wajib melewati Accept / Reject / Edit.
3. **Universal by design** — Profession Schema (24 profesi terseed), bukan
   asumsi developer-only.
4. **Privacy by default** — profil privat; publikasi eksplisit per-bagian.
5. **RLS di semua tabel user-owned** — otorisasi tidak pernah hanya di client.

## Skrip

| Perintah           | Fungsi                      |
| ------------------ | --------------------------- |
| `npm run dev`      | Development server          |
| `npm run build`    | Production build            |
| `npm run start`    | Menjalankan hasil build     |
| `npm run lint`     | ESLint                      |
| `npm run typecheck`| TypeScript strict check     |
