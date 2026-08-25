

# PortoTional — Complete Master Product Document

> **Master Concept + PRD + Technical Architecture + Database Schema + UX Blueprint + Build Prompt**

**Version:** 1.0
**Project:** PortoTional
**Product Type:** AI-Powered Professional Identity & Digital Showcase Platform
**Core Philosophy:** **Setup Once, Showcase Everywhere**

---

# 1. EXECUTIVE SUMMARY

## 1.1 Apa itu PortoTional?

**PortoTional** adalah aplikasi yang membantu seseorang membangun **Professional Digital Identity** dari satu sumber data utama.

User cukup memasukkan data dirinya sekali:

* identitas
* profesi
* pengalaman
* pendidikan
* skill
* project/karya
* sertifikasi
* pencapaian
* bahasa
* kelebihan
* tujuan karier
* foto
* link profesional

Kemudian PortoTional menggunakan data tersebut untuk menghasilkan berbagai bentuk representasi profesional.

### Output utama

1. **ATS Resume / CV**
2. **Public Professional Profile**
3. **Portfolio / Work Showcase**
4. **Personal Website**
5. **AI-assisted professional content**

---

## 1.2 Filosofi Produk

PortoTional bukan sekadar:

> "AI CV Generator."

Dan bukan pula sekadar:

> "Portfolio Builder."

Konsep utamanya adalah:

> **Professional Identity Operating System**

User memiliki satu **Master Professional Identity**, lalu sistem menghasilkan berbagai output berdasarkan kebutuhan.

```text
                  MASTER PROFESSIONAL IDENTITY
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
           CV              PROFILE           WEBSITE
            │                 │                 │
            ▼                 ▼                 ▼
          PDF              Public URL      Personal Brand
            │
            ▼
      Job-tailored CV
```

---

# 2. PROBLEM STATEMENT

CV tradisional memiliki beberapa masalah:

* statis
* sulit diperbarui
* informasi sering tidak konsisten
* user harus mengulang data
* portfolio terpisah
* personal website sulit dibuat
* banyak orang tidak tahu cara menulis CV profesional
* AI CV generator biasa dapat menghasilkan informasi yang tidak benar
* CV PDF tidak dapat menggambarkan seluruh kemampuan seseorang

PortoTional menyelesaikan masalah tersebut dengan memisahkan:

### Source Data

> **Master Professional Identity**

dari:

### Output

> CV / Profile / Portfolio / Website.

---

# 3. TARGET USER

PortoTional **bukan platform khusus developer**.

Targetnya adalah seluruh pekerja/profesional.

Contoh:

* Developer
* UI/UX Designer
* Graphic Designer
* Teacher
* Lecturer
* Accountant
* Marketing
* Sales
* HR
* Engineer
* Architect
* Photographer
* Videographer
* Writer
* Journalist
* Researcher
* Student
* Freelancer
* Entrepreneur
* Administrative Staff
* Healthcare Worker
* Chef
* Content Creator
* Technician
* Consultant
* dan profesi lainnya.

---

# 4. PRODUCT PRINCIPLES

## 4.1 Identity First

Master Identity adalah sumber kebenaran utama.

---

## 4.2 AI Assists, Never Invents

AI boleh:

* memperbaiki grammar
* membuat tulisan lebih profesional
* menyusun kalimat
* meringkas
* mengubah tone
* menerjemahkan
* mengoptimalkan relevansi

AI tidak boleh mengarang:

* pengalaman
* perusahaan
* jabatan
* angka
* achievement
* sertifikat
* skill
* project
* pendidikan

---

## 4.3 Universal by Design

Sistem tidak boleh dibangun dengan asumsi bahwa semua user adalah developer.

Jangan membuat sistem seperti:

```ts
if (profession === "developer") {
   ...
}
```

Gunakan **Profession Schema** yang dapat dikonfigurasi.

---

## 4.4 Professional Before Decorative

Visual harus membantu profesionalisme.

Bukan:

> semakin banyak animasi = semakin bagus.

---

## 4.5 3D Is Optional

3D adalah fitur enhancement.

Bukan dependency.

Jika perangkat tidak mendukung 3D:

```text
3D unavailable
       ↓
Static fallback
```

---

## 4.6 Privacy by Default

Informasi pribadi tidak boleh otomatis menjadi publik.

---

# 5. BRAND IDENTITY

## 5.1 Name

**PortoTional**

---

## 5.2 Name Meaning

**Porto**

→ Portfolio

**Tional**

→ Professional + International

Makna keseluruhan:

> Platform profesional untuk membangun identitas digital yang dapat digunakan secara global.

---

## 5.3 Primary Tagline

> **Setup Once, Showcase Everywhere.**

---

## 5.4 Positioning

> **AI-powered Professional Identity Platform**

---

## 5.5 Visual Direction

### Obsidian Charcoal

`#0B0C10`

### Titanium Ivory

`#F8F9FA`

### Champagne Gold

`#D4AF37`

Gold digunakan sebagai **accent/status**, bukan memenuhi seluruh interface.

---

# 6. PRODUCT STRUCTURE

```text
PORTOTIONAL
│
├── Marketing Website
│
├── Application
│
├── Public Profiles
│
├── Personal Websites
│
└── Future Talent Ecosystem
```

---

# 7. DOMAIN STRUCTURE

## Main

```text
portotional.com
```

Marketing + public platform.

## Application

```text
portotional.com/app
```

Authenticated workspace.

## Public Profile

```text
portotional.com/u/username
```

## Premium Website

```text
username.portotional.com
```

## Future Custom Domain

```text
userdomain.com
```

---

# 8. MASTER PROFESSIONAL IDENTITY

Ini adalah **jantung PortoTional**.

Data:

```text
Personal Information
Professional Information
Experience
Education
Skills
Projects
Achievements
Certifications
Languages
Social Links
Career Goals
Availability
Photo
Evidence
```

---

# 9. IDENTITY ≠ CV

Ini keputusan arsitektur penting.

User memiliki:

```text
MASTER IDENTITY
```

Kemudian membuat:

```text
CV #1
CV #2
CV #3
```

Contoh:

```text
Master Identity
│
├── Experience × 5
├── Skills × 12
├── Projects × 8
└── Certificates × 4
```

CV Marketing:

```text
Experience × 3
Skills × 7
Projects × 3
```

CV General:

```text
Experience × 5
Skills × 10
Projects × 5
```

Data tidak perlu diduplikasi.

---

# 10. CONTENT LIBRARY

Menu:

> **My Content**

Berisi:

```text
Experience
Education
Skills
Projects
Achievements
Certifications
Languages
Social Links
Evidence
```

Semua data dapat digunakan ulang.

---

# 11. PROFESSION SYSTEM

Setiap profesi memiliki konfigurasi.

Contoh:

```json
{
  "profession": "designer",
  "recommendedSections": [
    "about",
    "experience",
    "selectedWork",
    "skills",
    "education"
  ]
}
```

Developer:

```text
Projects
Tech Stack
Experience
```

Teacher:

```text
Teaching Experience
Subjects
Education
Certifications
```

Photographer:

```text
Featured Work
Gallery
Services
Experience
```

---

# 12. ONBOARDING

Jangan langsung memberikan form panjang.

Flow:

```text
Welcome
  ↓
Create Account
  ↓
Choose Profession
  ↓
Import Existing CV
       OR
Start From Scratch
  ↓
AI Structuring
  ↓
Review
  ↓
Complete Identity
  ↓
Generate First CV
```

---

# 13. IMPORT EXISTING CV

Ini salah satu fitur paling penting.

User upload:

* PDF
* DOCX

Sistem:

```text
Upload
 ↓
Extract Text
 ↓
AI Structure
 ↓
Detect Information
 ↓
User Review
 ↓
Save to Master Identity
```

Contoh:

```text
Detected:

✓ Personal Information
✓ 3 Experiences
✓ 2 Education
✓ 8 Skills
✓ 2 Certificates
```

Tidak ada data yang otomatis dianggap benar tanpa review user.

---

# 14. PHOTO SYSTEM

User dapat upload:

* JPG
* PNG
* WEBP

Fitur:

* crop
* zoom
* reposition
* aspect ratio
* preview

Foto akan digunakan dalam template CV sesuai layout.

Default:

> Foto tidak otomatis diproses atau dimanipulasi AI.

---

# 15. AI SYSTEM

## AI Gateway

```text
Client
  ↓
Next.js Server
  ↓
AI Gateway
  ↓
Provider
```

API key tidak pernah dikirim ke browser.

---

# 16. AI PROVIDER ARCHITECTURE

```text
AI Gateway
│
├── Primary Provider
│
├── Fallback Provider
│
└── Future Providers
```

Arsitektur provider abstraction harus memungkinkan penggantian model tanpa mengubah seluruh aplikasi.

---

# 17. AI FEATURES

## AI Refiner

Mengubah:

> "Saya membuat desain poster."

menjadi tulisan profesional tanpa menambahkan fakta.

---

## AI Summary Generator

Menghasilkan:

* professional summary
* about
* short bio
* website introduction

---

## AI CV Generator

Menghasilkan struktur CV dari Master Identity.

---

## AI Job Tailoring

Input:

> Job Description

Output:

> CV yang relevan dengan pekerjaan tersebut.

Tetap hanya menggunakan fakta dari Master Identity.

---

## AI CV Analyzer

Analisis:

* clarity
* completeness
* ATS
* relevance
* consistency
* evidence

---

## AI Career Assistant

Membantu:

* setup
* penulisan
* career preparation
* CV improvement

---

# 18. AI TRUTH GUARD

Aturan absolut:

> **Never fabricate professional facts.**

Jika data tidak cukup:

```text
Insufficient information.
Please provide more details.
```

Bukan mengarang.

---

# 19. AI EDIT UX

AI tidak boleh langsung mengganti data.

Gunakan:

```text
Original
   ↓
AI Suggestion
   ↓
[Accept] [Reject] [Edit]
```

---

# 20. CV SYSTEM

User dapat membuat beberapa CV.

Contoh:

```text
My CVs

Software Engineer CV
Marketing CV
Internship CV
General CV
```

---

# 21. CV BUILDER

Layout:

```text
┌───────────────────────────────────────────────┐
│ PortoTional        CV Name       Saved ✓      │
├────────────────┬──────────────────────────────┤
│ Sections       │                              │
│                │          CV PREVIEW          │
│ Summary        │                              │
│ Experience     │          A4 / F4             │
│ Education      │                              │
│ Skills         │                              │
│ Projects       │                              │
│ Certificates   │                              │
│                │                              │
│ + Add Section  │                              │
└────────────────┴──────────────────────────────┘
```

---

# 22. CV FEATURES

* live preview
* section reorder
* section visibility
* template switching
* photo
* AI assistance
* page size
* language
* autosave
* version history
* ATS analysis
* PDF export

---

# 23. ATS ENGINE

ATS analysis:

```text
ATS Readiness
92/100
```

Breakdown:

```text
Structure       95
Readability     94
Keywords        87
Consistency     96
Parsing Safety  91
```

Tidak boleh memberikan skor seolah-olah merupakan jaminan diterima ATS.

---

# 24. PDF ENGINE

Pipeline:

```text
CV Data
 ↓
Template
 ↓
HTML/CSS
 ↓
Chromium
 ↓
PDF
```

Support:

* A4
* F4
* multi-page
* photo
* margins
* page breaks
* typography
* overflow handling

---

# 25. SMART LAYOUT ENGINE

Sistem harus mendeteksi:

* halaman kosong
* section terpotong
* heading sendirian di akhir halaman
* content overflow
* foto terlalu besar
* terlalu banyak whitespace

---

# 26. PUBLIC PROFESSIONAL PROFILE

URL:

```text
portotional.com/u/username
```

Isi:

```text
Profile Photo
Name
Professional Headline
Summary
Availability
Skills
Featured Work
Experience
Education
Certificates
Achievements
Links
Resume
Contact CTA
```

---

# 27. PROFILE VISIBILITY

User mengatur setiap bagian.

```text
Experience       ON
Education        ON
Skills           ON
Projects         ON
Email            OFF
Phone            OFF
Exact Location   OFF
Search Indexing  ON
Talent Discovery OFF
```

---

# 28. PROFILE VS WEBSITE

Ini harus jelas.

### Public Profile

Tujuan:

> **Professional information quickly.**

Lebih ringkas.

### Personal Website

Tujuan:

> **Personal branding + storytelling.**

Lebih bebas dan visual.

---

# 29. PREMIUM PERSONAL WEBSITE

URL:

```text
username.portotional.com
```

Contoh struktur:

```text
Hero
About
Experience
Selected Work
Skills
Achievements
Testimonials
Contact
```

Tidak semua section wajib ditampilkan.

---

# 30. WEBSITE BUILDER

User tidak perlu coding.

Customization:

* theme
* typography
* color
* layout
* sections
* animations
* SEO
* social preview
* 3D mode

---

# 31. AI WEBSITE GENERATOR

Input:

```text
Profession
Master Identity
Preferred Style
```

Output:

```text
Suggested Website Structure
```

Contoh:

> Minimal Editorial Portfolio

atau:

> Premium Corporate Profile

User tetap memiliki kontrol manual.

---

# 32. WEBSITE ENGINE

Jangan membuat satu deployment per user.

Gunakan:

```text
Next.js
 ↓
Hostname Resolver
 ↓
Website ID
 ↓
Website Configuration
 ↓
Render
```

Jadi:

```text
reja.portotional.com
andi.portotional.com
sarah.portotional.com
```

menggunakan engine yang sama.

---

# 33. 3D SYSTEM

3D merupakan **signature feature**, bukan core requirement.

Stack:

* Three.js
* React Three Fiber
* MediaPipe

Kemungkinan:

```text
3D Portrait
3D Avatar
Interactive Scene
```

---

# 34. 3D RULES

Jangan load Three.js pada:

* login
* dashboard
* CV builder
* public profile

3D hanya di-load ketika dibutuhkan.

Fallback:

```text
3D
 ↓
Unsupported?
 ↓
Static Image
```

---

# 35. TALENT DISCOVERY

Future feature.

Opt-in.

Filter:

```text
Profession
Skill
Language
Location
Experience
Availability
```

Jangan otomatis memasukkan semua user ke directory recruiter.

---

# 36. QR CODE

Public Profile:

```text
[QR CODE]
```

Bisa diarahkan ke:

* profile
* resume
* personal website

---

# 37. ANALYTICS

Premium website dapat melihat:

* visitors
* page views
* resume downloads
* CTA clicks
* top pages
* traffic source
* device
* approximate region

Gunakan privacy-friendly analytics.

---

# 38. SEO

Public profile + website mendukung:

* title
* description
* Open Graph
* canonical
* sitemap
* robots
* structured metadata
* index/noindex

---

# 39. APP ARCHITECTURE

PortoTional **bukan sekadar PWA**.

Application:

```text
Next.js Application
```

Mobile distribution:

```text
Next.js
   ↓
Capacitor
   ↓
Android / iOS
```

Backend tetap:

```text
Supabase
```

Flutter **tidak diperlukan** untuk arsitektur utama.

---

# 40. MOBILE FEATURES

Potensial:

* camera
* photo picker
* file picker
* share
* push notification
* biometric authentication
* deep link

Arsitektur harus mobile-compatible sejak awal.

---

# 41. OFFLINE

Tidak perlu full offline.

Yang dibutuhkan:

```text
Offline
 ↓
Local Draft
 ↓
Connection Returns
 ↓
Sync
```

Prioritas:

* profile editing
* CV editing
* draft data

---

# 42. AUTOSAVE

Wajib.

Status:

```text
Saving...
Saved ✓
Offline — Saved Locally
Syncing...
```

User tidak boleh kehilangan data karena refresh/crash.

---

# 43. VERSION HISTORY

Minimal untuk:

* CV
* AI content
* Website

Aksi:

```text
Preview
Restore
Duplicate
```

---

# 44. CONTENT CONSISTENCY ENGINE

Mendeteksi:

* tanggal berbeda
* jabatan berbeda
* nama perusahaan berbeda
* duplicate experience
* timeline tidak masuk akal

Contoh:

> Experience A: 2024–2025
> Experience B: 2023–2025
> Possible timeline conflict.

---

# 45. EVIDENCE SYSTEM

User dapat melampirkan:

* certificate
* image
* document
* URL
* project

Status:

```text
Self Reported
Evidence Attached
Verified
```

Verification dapat dikembangkan di masa depan.

---

# 46. NOTIFICATION SYSTEM

Contoh:

```text
Your CV is ready.
Your profile is 85% complete.
Your website received 12 views.
Your subscription is expiring soon.
```

---

# 47. MONETIZATION

## FREE

* Master Identity
* basic AI
* basic CV
* basic templates
* public profile
* basic PDF
* sharing

---

## PRO

* advanced AI
* multiple CV
* premium templates
* personal website
* custom subdomain
* analytics
* 3D Identity
* advanced customization
* advanced export

---

## PAYMENT

Indonesia:

> Midtrans

Global:

> Stripe

Payment status harus diverifikasi melalui server/webhook.

---

# 48. ENTITLEMENT SYSTEM

Jangan:

```ts
if (user.isPremium)
```

Gunakan:

```text
User
 ↓
Plan
 ↓
Entitlements
```

Contoh:

```text
premium_website = true
advanced_ai = true
analytics = true
three_d_identity = true
```

---

# 49. ADMIN SYSTEM

Admin dapat mengelola:

* users
* templates
* professions
* AI usage
* subscriptions
* payments
* public content reports
* feature flags
* audit logs

Admin tidak boleh memiliki akses bebas terhadap data sensitif user.

---

# 50. DATABASE ARCHITECTURE

## Core Tables

```text
profiles
professions
experiences
educations
skills
works
achievements
certifications
languages
social_links
files
evidence
```

## CV

```text
resumes
resume_sections
resume_versions
templates
```

## Website

```text
websites
website_sections
```

## AI

```text
ai_generations
```

## Business

```text
subscriptions
payments
entitlements
```

## Platform

```text
analytics_events
notifications
audit_logs
```

---

# 51. DATABASE SCHEMA

```sql
profiles
---------
id
user_id
username
full_name
headline
summary
profession_id
photo_url
location
availability
visibility
created_at
updated_at
```

```sql
professions
-----------
id
slug
name
description
configuration
created_at
updated_at
```

```sql
experiences
-----------
id
profile_id
organization
title
description
start_date
end_date
is_current
location
visibility
created_at
updated_at
```

```sql
educations
----------
id
profile_id
institution
degree
field
description
start_date
end_date
visibility
created_at
updated_at
```

```sql
skills
------
id
profile_id
name
category
proficiency_label
visibility
created_at
updated_at
```

```sql
works
-----
id
profile_id
title
description
role
url
image_url
start_date
end_date
tags
visibility
created_at
updated_at
```

```sql
achievements
------------
id
profile_id
title
issuer
date
description
evidence_id
visibility
created_at
updated_at
```

```sql
certifications
--------------
id
profile_id
name
issuer
credential_id
credential_url
issue_date
expiry_date
evidence_id
visibility
created_at
updated_at
```

```sql
languages
---------
id
profile_id
language
proficiency
visibility
```

```sql
social_links
------------
id
profile_id
platform
url
visibility
```

```sql
files
-----
id
profile_id
storage_path
file_name
mime_type
size
purpose
created_at
```

```sql
evidence
--------
id
profile_id
type
file_id
url
verification_status
created_at
```

```sql
resumes
-------
id
profile_id
name
target_role
target_company
target_job_description
language
page_size
template_id
status
created_at
updated_at
```

```sql
resume_sections
---------------
id
resume_id
section_type
source_reference
custom_content
sort_order
is_visible
```

```sql
resume_versions
---------------
id
resume_id
snapshot
version_number
created_at
```

```sql
templates
---------
id
type
name
slug
configuration
is_premium
is_active
```

```sql
websites
--------
id
profile_id
subdomain
custom_domain
template_id
published
configuration
seo_configuration
created_at
updated_at
```

```sql
website_sections
----------------
id
website_id
section_type
content_reference
custom_content
sort_order
is_visible
```

```sql
ai_generations
--------------
id
user_id
type
input_reference
output
provider
model
token_usage
created_at
```

```sql
subscriptions
-------------
id
user_id
provider
provider_subscription_id
plan
status
current_period_start
current_period_end
```

```sql
payments
--------
id
user_id
provider
provider_payment_id
amount
currency
status
metadata
created_at
```

```sql
entitlements
------------
id
user_id
feature
value
expires_at
```

```sql
analytics_events
----------------
id
website_id
event_type
path
anonymous_session_id
metadata
created_at
```

```sql
notifications
-------------
id
user_id
type
title
body
read_at
created_at
```

```sql
audit_logs
----------
id
actor_user_id
action
entity_type
entity_id
metadata
created_at
```

---

# 52. DATABASE SECURITY

Semua tabel user-owned wajib menggunakan:

> **Row Level Security**

Rule dasar:

```text
User A
 ↓
only User A data
```

Tidak boleh:

```text
User A → User B data
```

Public profile menggunakan controlled public queries/views.

---

# 53. TECH STACK

## Frontend

```text
Next.js 15
React
TypeScript
Tailwind CSS v4
shadcn/ui
Framer Motion
```

## Form

```text
React Hook Form
Zod
```

## State

```text
Zustand
```

Gunakan hanya ketika memang dibutuhkan.

---

## Backend

```text
Next.js Server Actions
Next.js Route Handlers
Supabase
```

---

## Database

```text
PostgreSQL
```

---

## Authentication

```text
Supabase Auth
```

Provider:

* Email
* Google
* GitHub

---

## Storage

```text
Supabase Storage
```

---

## AI

```text
AI Gateway
Primary Provider
Fallback Provider
```

Provider implementation harus abstraction-based.

---

## PDF

```text
Playwright / Puppeteer
Chromium
```

---

## 3D

```text
Three.js
React Three Fiber
MediaPipe
```

---

## Payment

```text
Midtrans
Stripe
```

---

## Mobile

```text
Capacitor
```

---

## Deployment

```text
Vercel
Supabase
```

---

# 54. TECHNICAL ARCHITECTURE

```text
                        CLIENTS
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Browser          Android           iOS
                         Capacitor        Capacitor
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    NEXT.JS APPLICATION
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       App UI         Public Profile     Website Engine
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                     SERVICE LAYER
                           │
      ┌─────────┬──────────┼──────────┬─────────┐
      ▼         ▼          ▼          ▼         ▼
   Identity    AI         CV       Payment   Analytics
      │         │          │          │         │
      └─────────┴──────────┼──────────┴─────────┘
                           ▼
                        SUPABASE
                  ┌────────┼────────┐
                  ▼        ▼        ▼
             PostgreSQL   Auth    Storage
```

---

# 55. APPLICATION ROUTES

```text
/
├── login
├── signup
│
├── app
│   ├── dashboard
│   ├── identity
│   ├── identity/experience
│   ├── identity/education
│   ├── identity/skills
│   ├── identity/work
│   ├── identity/certifications
│   ├── cv
│   ├── cv/new
│   ├── cv/[id]
│   ├── ai
│   ├── showcase
│   ├── showcase/profile
│   ├── showcase/website
│   ├── analytics
│   └── settings
│
└── u/[username]
```

Hostname routing:

```text
username.portotional.com
```

---

# 56. SERVICE ARCHITECTURE

Recommended:

```text
src/
├── app/
├── components/
├── features/
│   ├── identity/
│   ├── cv/
│   ├── ai/
│   ├── website/
│   ├── profile/
│   ├── analytics/
│   └── payments/
├── lib/
│   ├── supabase/
│   ├── ai/
│   ├── payments/
│   ├── pdf/
│   └── security/
├── services/
│   ├── identity/
│   ├── cv/
│   ├── ai/
│   ├── website/
│   ├── payments/
│   └── analytics/
└── types/
```

---

# 57. UX BLUEPRINT

## Marketing Homepage

```text
Navbar

Hero
"Your professional identity.
Built once."

CTA:
Create My Professional Identity

Visual:
Identity → CV → Profile → Website

How It Works

1. Setup
2. Refine
3. Showcase

Features

AI CV
Public Profile
Personal Website
ATS
3D Identity

Profession Showcase

Testimonials / Social Proof

Pricing

FAQ

Footer
```

---

# 58. APP HOME

Jangan membuat dashboard yang penuh kartu.

Prioritas:

```text
Greeting

Professional Identity
████████░░ 82%

Continue Setup

Quick Actions

Recent CV

Public Profile

Website

AI Suggestions
```

---

# 59. IDENTITY SCREEN

```text
My Identity

Profile
Experience
Education
Skills
Work
Achievements
Certificates
Languages
Links
```

Setiap bagian:

* list
* add
* edit
* delete
* visibility
* reorder

---

# 60. CV SCREEN

```text
My CVs

[Create New CV]

Software Engineer
Last updated...
[Edit]

Marketing
Last updated...
[Edit]
```

---

# 61. AI STUDIO

```text
AI Studio

What do you want to improve?

[Improve my summary]
[Improve experience]
[Analyze CV]
[Tailor to job]
[Generate bio]
[Translate]
```

---

# 62. WEBSITE SCREEN

```text
My Website

Status:
Published ✓

reja.portotional.com

[Open Website]
[Edit]
[Customize]
[Analytics]
```

---

# 63. PUBLIC PROFILE UX

Public profile harus langsung menjawab:

> Siapa orang ini?

> Apa keahliannya?

> Apa buktinya?

> Bagaimana cara menghubunginya?

Visual:

```text
        PHOTO

        NAME
     PROFESSIONAL TITLE

      Short Summary

[Contact] [Download CV]

Skills

Featured Work

Experience

Education

Certificates

Links
```

---

# 64. PERSONAL WEBSITE UX

Lebih storytelling:

```text
Hero
 ↓
About
 ↓
Selected Work
 ↓
Experience
 ↓
Skills
 ↓
Achievements
 ↓
Contact
```

---

# 65. DESIGN SYSTEM RULES

PortoTional application:

* premium
* minimal
* modern
* readable
* restrained motion
* strong hierarchy

Hindari:

* AI-slop gradients
* terlalu banyak glassmorphism
* terlalu banyak floating cards
* animasi everywhere
* 3D hanya untuk terlihat keren

---

# 66. ACCESSIBILITY

Wajib memperhatikan:

* keyboard navigation
* semantic HTML
* screen readers
* focus states
* contrast
* reduced motion
* proper form labels
* accessible errors

---

# 67. PERFORMANCE

Public profile harus ringan.

Jangan mengirim:

```text
Three.js
AI editor
CV editor
```

ke halaman yang tidak membutuhkan.

Gunakan:

* dynamic imports
* lazy loading
* server rendering
* image optimization
* code splitting

---

# 68. ERROR HANDLING

Semua feature harus memiliki:

```text
Loading
Empty
Success
Error
Offline
```

Jangan:

> Something went wrong.

Lebih baik:

> Your CV was saved, but PDF generation failed. You can retry without losing your changes.

---

# 69. SECURITY

Implement:

* RLS
* authorization
* validation
* secure cookies
* rate limiting
* file validation
* payment webhook verification
* AI rate limiting
* sanitized content
* audit logging

Jangan percaya:

* frontend role
* frontend payment status
* frontend premium status
* file extension
* user HTML

---

# 70. FILE SECURITY

Supported:

```text
PDF
DOCX
JPG
PNG
WEBP
```

Validate:

* MIME
* extension
* size
* actual content

Private files:

> private by default.

---

# 71. MONETIZATION ARCHITECTURE

```text
User
 ↓
Subscription / Purchase
 ↓
Payment Provider
 ↓
Webhook
 ↓
Verified Payment
 ↓
Entitlement
 ↓
Feature Access
```

---

# 72. MVP

V1 **tidak perlu semuanya**.

MVP wajib:

### Authentication

* signup
* login
* OAuth

### Master Identity

* profile
* experience
* education
* skills
* work
* certificate
* photo

### AI

* refiner
* summary
* basic CV generation

### CV

* builder
* template
* preview
* A4
* PDF

### Public Profile

* username
* profile
* visibility
* sharing

### Core UX

* autosave
* responsive
* privacy

---

# 73. V1.5

Tambahkan:

* CV import
* AI extraction
* Job Tailoring
* ATS Analyzer
* consistency checker
* version history
* QR

---

# 74. V2

Tambahkan:

* premium personal website
* AI website generation
* subdomain
* customization
* analytics
* advanced templates

---

# 75. V3

Tambahkan:

* 3D Identity
* advanced portfolio
* richer AI
* custom domains

---

# 76. V4

Tambahkan:

* talent discovery
* verification
* recruiter system
* job matching
* application tracker

---

# 77. MOBILE ROADMAP

Mobile tidak harus menunggu semua fitur.

Architecture:

```text
Next.js
 ↓
Responsive App
 ↓
Capacitor
 ↓
Android
 ↓
iOS
```

Rilis setelah core application stabil.

---

# 78. SUCCESS METRICS

Primary:

```text
Registration → First CV
Registration → Published Profile
CV Export Success
Profile Completion
Repeat Usage
```

Secondary:

```text
AI Acceptance Rate
Website Activation
Premium Conversion
Resume Downloads
Website Visits
```

Quality:

```text
PDF Failure Rate
AI Hallucination Reports
Crash Rate
Performance
Mobile Usability
```

---

# 79. DEFINITION OF DONE

Feature dianggap selesai jika:

* UI selesai
* responsive
* loading state
* empty state
* error state
* validation
* authorization
* database security
* mobile behavior
* accessibility diperhatikan
* build berhasil
* lint berhasil
* tidak ada console error kritis

---

# 80. OPENCODE MASTER BUILD PROMPT

Berikut prompt yang bisa dipakai sebagai **master instruction** untuk OpenCode.

```text
You are the lead senior full-stack engineer responsible for building PortoTional.

PROJECT:
PortoTional — AI-powered Professional Identity & Digital Showcase Platform.

CORE PHILOSOPHY:
"Setup Once, Showcase Everywhere."

The application must allow users from ANY profession to create one Master Professional Identity and reuse that identity across:

1. ATS CV / Resume
2. Public Professional Profile
3. Portfolio
4. Personal Website
5. AI-generated professional content

IMPORTANT:
PortoTional is NOT a developer-only platform.

It must support all professional categories through a configurable Profession Schema.

==================================================
CORE ARCHITECTURE
==================================================

Master Identity is the source of truth.

Never create separate duplicated datasets for CV, profile, and website.

Architecture:

Master Identity
    ↓
CV
Public Profile
Portfolio
Personal Website
AI Outputs

==================================================
TECH STACK
==================================================

Use:

Next.js 15
React
TypeScript
Tailwind CSS v4
shadcn/ui
Framer Motion
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
React Hook Form
Zod
Zustand where necessary
Playwright or Puppeteer
Three.js
React Three Fiber
MediaPipe
Capacitor
Vercel

Payments:

Midtrans
Stripe

AI:

AI provider abstraction
Primary provider
Fallback provider

Never expose AI API keys client-side.

==================================================
AUTH
==================================================

Implement:

Email/password
Google OAuth
GitHub OAuth

Use secure session handling.

==================================================
DATABASE
==================================================

Implement the database schema described in the master project document.

Every user-owned table must have appropriate Supabase RLS policies.

Never rely only on frontend authorization.

==================================================
MASTER IDENTITY
==================================================

Users can manage:

Profile
Experience
Education
Skills
Projects/Works
Achievements
Certifications
Languages
Social Links
Photo
Evidence

All content supports visibility control.

==================================================
CV SYSTEM
==================================================

Users can create multiple CVs from one Master Identity.

CV must support:

Templates
Section selection
Section ordering
Live preview
Photo
A4
F4
AI assistance
ATS analysis
Autosave
Version history
PDF export

Generate PDF through HTML/CSS and Chromium.

Do NOT use screenshots for PDF generation.

==================================================
AI
==================================================

Create an AI Gateway.

Architecture:

Client
→ Next.js server
→ AI Gateway
→ Provider

Implement provider abstraction.

AI must follow strict anti-fabrication rules.

AI may improve wording but must never invent:

companies
roles
metrics
skills
certificates
achievements
education
projects
dates

AI suggestions must be reviewable.

Use:

Accept
Reject
Edit
Regenerate

==================================================
CV IMPORT
==================================================

Support PDF/DOCX import.

Flow:

Upload
→ Extract
→ AI Structure
→ User Review
→ Save

Never silently import information without confirmation.

==================================================
PUBLIC PROFILE
==================================================

Implement:

/u/[username]

Profile should include:

Photo
Name
Professional Headline
Summary
Skills
Featured Work
Experience
Education
Certifications
Achievements
Links
Resume
Contact CTA

Respect visibility settings.

Optimize for SEO and mobile.

==================================================
PERSONAL WEBSITE
==================================================

Implement a reusable website engine.

Do NOT deploy one application per user.

Resolve website configuration using hostname.

Support:

username.portotional.com

Prepare for future custom domains.

Website sections:

Hero
About
Work
Experience
Skills
Achievements
Contact

Allow customization.

==================================================
3D
==================================================

3D is optional.

Use:

Three.js
React Three Fiber
MediaPipe

Lazy-load all 3D features.

Never load Three.js globally.

Provide static fallback.

3D is primarily for premium personal websites.

==================================================
PAYMENTS
==================================================

Use provider abstraction.

Indonesia:
Midtrans

Global:
Stripe

Payment status must be verified server-side using webhooks.

Never trust client payment status.

==================================================
ENTITLEMENTS
==================================================

Do not implement:

isPremium === true

Use:

User
→ Plan
→ Entitlements

Features should be controlled through entitlements.

==================================================
SECURITY
==================================================

Implement:

RLS
Authorization
Validation
Secure file handling
Rate limiting strategy
Webhook verification
Audit logging
Sanitized public content
Safe AI input/output handling

Never trust client-side:

permissions
payment status
subscription status
file extension
HTML

==================================================
UX
==================================================

The product must NOT look like generic AI SaaS.

Avoid:

excessive cards
excessive gradients
excessive glassmorphism
unnecessary animation
overuse of 3D

Prioritize:

clarity
hierarchy
professionalism
speed
accessibility
responsive behavior

==================================================
AUTOSAVE
==================================================

Required for:

Master Identity
CV
Website

Display:

Saving...
Saved
Offline
Syncing

==================================================
MOBILE
==================================================

Build responsive from day one.

Maintain compatibility with Capacitor.

Do not build a separate Flutter application.

Prepare architecture for:

camera
photo picker
file picker
share
push notification
deep links
biometric authentication

==================================================
PERFORMANCE
==================================================

Use:

Server rendering where appropriate
Dynamic imports
Lazy loading
Image optimization
Code splitting

Do not ship unnecessary heavy features to lightweight pages.

==================================================
DEVELOPMENT ORDER
==================================================

Build incrementally:

1. Foundation
2. Supabase
3. Authentication
4. Database
5. RLS
6. Master Identity
7. Content Library
8. CV Builder
9. PDF Engine
10. AI Gateway
11. Public Profile
12. Website Engine
13. Payment
14. Analytics
15. 3D
16. Capacitor

Do not attempt the entire product in one uncontrolled implementation.

==================================================
QUALITY GATE
==================================================

Before declaring any feature complete:

- TypeScript passes
- lint passes
- build passes
- authorization verified
- RLS verified
- responsive behavior checked
- loading state exists
- empty state exists
- error state exists
- mobile state exists
- accessibility considered
- no critical console errors

==================================================
PRODUCT RULE
==================================================

Do not invent unnecessary requirements.

Do not over-engineer V1.

If a feature is not necessary for the current phase, keep the architecture extensible but do not implement unnecessary complexity.

The goal is a real, stable, production-quality PortoTional application.

==================================================
FINAL PRODUCT FEEL
==================================================

PortoTional should feel like:

"A professional identity operating system."

Not:

"another AI CV generator."

The user should feel:

"I enter my professional information once, and PortoTional handles the rest."

Build with this principle throughout the entire application.
```

---

# 81. FINAL PRODUCT MODEL

Kalau seluruh konsep ini diringkas menjadi satu diagram:

```text
                         PORTOTIONAL
                              │
                              ▼
                  MASTER PROFESSIONAL IDENTITY
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
            CV             PROFILE          WEBSITE
             │                │                │
             ▼                ▼                ▼
            PDF             Public          Personal
                            Identity          Brand
             │
             ▼
       JOB TAILORING
             │
             ▼
       ATS ANALYSIS
             
                              ▲
                              │
                         AI ENGINE
                              │
               ┌──────────────┼──────────────┐
               │              │              │
             Refine         Analyze        Generate
               │              │              │
               └──────────────┼──────────────┘
                              │
                              ▼
                       PROFESSIONAL DATA
```

---

# 82. FINAL DECISION

### Core

**Next.js + Supabase**

### AI

**Server-side AI Gateway + provider abstraction**

### CV

**HTML/CSS + Playwright/Puppeteer → PDF**

### Database

**PostgreSQL + Supabase RLS**

### Public Profile

**Next.js SSR/optimized public routes**

### Personal Website

**Dynamic Next.js website engine**

### 3D

**Three.js + React Three Fiber + MediaPipe**

### Payment

**Midtrans + Stripe**

### Mobile

**Capacitor**

### Deployment

**Vercel + Supabase**

### PWA

**Optional capability, bukan identitas utama produk**

### Flutter

**Tidak digunakan untuk core application.**

---

# 83. KESIMPULAN

PortoTional seharusnya **tidak dibangun sebagai "website CV yang dikasih AI dan 3D."**

Itu bakal terlalu biasa.

Produk yang kita bangun adalah:

> **satu tempat untuk menyimpan dan mengelola seluruh identitas profesional seseorang, kemudian mengubahnya menjadi berbagai bentuk representasi profesional.**

Jadi urutan mental model-nya:

```text
                 DATA
                  ↓
          PROFESSIONAL IDENTITY
                  ↓
                 AI
                  ↓
       ┌──────────┼──────────┐
       ↓          ↓          ↓
      CV       PROFILE    WEBSITE
       ↓          ↓          ↓
      PDF       SHARE      BRAND
```

Dan **3D, AI website generator, analytics, talent discovery, recruiter, mobile, dan fitur-fitur keren lainnya adalah lapisan di atas core tersebut**, bukan fondasi yang membuat produk menjadi rumit sejak hari pertama.

**Kalau fondasi ini dipegang, PortoTional punya arah yang jauh lebih jelas dan scalable daripada sekadar project portfolio generator.**
