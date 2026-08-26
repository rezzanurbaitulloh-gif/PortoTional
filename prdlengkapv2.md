
---

# PortoTional — FINAL UPDATE PRD

### Product Requirements Document — Update & Refinement

**Date:** 26 August 2026
**Status:** FINAL UPDATE SPECIFICATION
**Baseline:** Existing PortoTional Master PRD previously provided to OpenCode
**Current Deployment:** `portotional.vercel.app`
**Future Production Domain:** `portotional.com`
**Primary Web Stack:** Next.js
**Mobile Stack:** Flutter
**Backend:** Supabase
**Primary AI Purpose:** Universal AI-assisted CV / Professional Identity generation

---

# 1. DOCUMENT PURPOSE

Dokumen ini merupakan **update/final refinement** terhadap PRD PortoTional yang telah dibuat sebelumnya.

Dokumen ini **tidak menggantikan konsep dasar PortoTional**, melainkan menambahkan dan memperbaiki aspek yang ditemukan setelah evaluasi lanjutan.

### Prinsip utama

> **Setup Once, Showcase Everywhere.**

User memasukkan informasi profesional satu kali ke dalam **Master Identity**, kemudian data tersebut menjadi sumber untuk:

* CV
* Digital Professional Profile
* Portfolio
* Personal Website
* Discoverability
* AI-assisted professional content
* Mobile application

---

# 2. PRODUCT DIRECTION UPDATE

PortoTional bukan platform khusus developer.

PortoTional harus dapat digunakan oleh **semua jenis profesi**.

Contoh:

* Software Developer
* Graphic Designer
* UI/UX Designer
* Accountant
* Teacher
* Student
* Marketing
* Sales
* Photographer
* Content Creator
* Entrepreneur
* Engineer
* Administrative Staff
* Healthcare Worker
* Researcher
* Freelancer
* dan profesi lainnya.

Sistem tidak boleh menggunakan struktur data yang terlalu developer-centric.

---

# 3. PRIMARY PRODUCT PURPOSE

Tujuan utama PortoTional tetap:

> **Membantu pengguna membuat CV digital/profesional dengan cepat melalui AI tanpa mengorbankan keakuratan informasi pengguna.**

Fitur 3D, portfolio, discovery, analytics, personal website, dan fitur lainnya merupakan **value-added features**, bukan tujuan utama produk.

Prioritas produk:

```text
1. Professional Identity
2. CV Creation
3. AI Assistance
4. Public Profile
5. Talent Discovery
6. Personal Website
7. Mobile Experience
8. Additional Professional Tools
```

---

# 4. MASTER IDENTITY

## 4.1 Single Source of Truth

Seluruh produk harus menggunakan **Master Identity** sebagai sumber data utama.

```text
                    MASTER IDENTITY
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
         CV            PROFILE          WEBSITE
          │               │               │
          ▼               ▼               ▼
         PDF          DISCOVERY          SEO
```

User tidak seharusnya menginput ulang data yang sama berkali-kali.

---

## 4.2 Master Identity Contents

Master Identity dapat mencakup:

* Full Name
* Preferred Name
* Profile Photo
* Professional Headline
* Profession
* About / Summary
* Skills
* Work Experience
* Education
* Certifications
* Projects
* Achievements
* Awards
* Organizations
* Languages
* Interests
* Location
* Contact Information
* Social Links
* Portfolio Links
* Additional Information

Field dapat berbeda berdasarkan profesi, tetapi struktur dasar harus fleksibel.

---

# 5. AI SYSTEM UPDATE

## 5.1 AI tersedia untuk seluruh user

AI bukan fitur eksklusif Pro.

Seluruh user dapat menggunakan AI sesuai quota/usage policy yang ditentukan sistem.

Tier berbayar dapat memberikan:

* quota lebih tinggi
* generation lebih banyak
* advanced features
* priority processing

tetapi **AI basic tidak boleh dikunci sepenuhnya untuk Free User**.

---

# 6. AI CV REFINEMENT

AI harus mampu mengubah informasi mentah user menjadi bahasa profesional.

Contoh:

```text
Input:
"ngurus akun instagram perusahaan"

Output:
"Managed the company's Instagram account and developed social media content."
```

AI boleh:

* memperbaiki grammar
* memperbaiki struktur
* meningkatkan profesionalitas bahasa
* mengubah format menjadi bullet point
* membuat professional summary
* menyesuaikan tone
* membantu struktur STAR ketika relevan

---

# 7. AI FACT-PRESERVATION

AI **dilarang mengarang fakta profesional**.

Tidak boleh menciptakan:

* pengalaman kerja
* jabatan
* sertifikasi
* angka pencapaian
* perusahaan
* proyek
* skill
* pendidikan

yang tidak diberikan user.

Contoh:

```text
User:
"mengurus Instagram perusahaan"

Allowed:
"Managed the company's Instagram account."

Forbidden:
"Managed Instagram and increased engagement by 230%."
```

jika angka tersebut tidak diberikan user.

---

# 8. AI USER APPROVAL

Output AI penting harus dapat:

```text
Accept
Edit
Regenerate
Reject
```

AI-generated content tidak otomatis menggantikan data user tanpa mekanisme approval yang sesuai.

---

# 9. AI USAGE CONTROL

Karena AI tersedia untuk semua user, backend wajib memiliki:

* AI usage tracking
* Rate limiting
* Quota
* Daily/monthly limits
* Abuse protection
* Request timeout
* Retry mechanism
* Provider fallback
* Error handling
* AI cost monitoring

API key AI **tidak boleh dikirim ke frontend**.

---

# 10. PROFILE PHOTO

CV generation harus menyediakan upload **profile/pass photo**.

Photo akan digunakan pada posisi yang sesuai dalam template CV.

Contoh layout:

```text
┌─────────────────────────────────────┐
│ Name / Professional Information  📷 │
│                                  📷 │
│                                  📷 │
│ Summary                              │
│ Experience                           │
│ Education                            │
└─────────────────────────────────────┘
```

Template harus menentukan posisi foto secara konsisten.

User harus dapat:

* Upload
* Replace
* Crop
* Remove
* Preview

Sistem harus melakukan image validation dan optimization.

---

# 11. MULTIPLE CV

User dapat memiliki beberapa CV dari satu Master Identity.

Contoh:

```text
My CVs

Software Engineer CV
Marketing CV
General CV
Internship CV
Academic CV
```

Setiap CV dapat memiliki:

* template
* ordering
* selected sections
* customized summary
* customized skills
* target role

Tetapi data dasarnya tetap berasal dari Master Identity.

---

# 12. CV TEMPLATE SYSTEM

Sistem tidak boleh hanya memiliki satu template hardcoded.

Minimal konsep:

```text
Classic
Modern
Minimal
Executive
Creative
Academic
ATS
```

Template harus mempertimbangkan profesi.

Namun template visual tidak boleh mengorbankan readability atau ATS compatibility ketika user memilih mode ATS.

---

# 13. PROFILE COMPLETENESS

Tambahkan **Profile Readiness / Identity Completeness**.

Contoh:

```text
Your Identity

████████████████░░░░ 82%

✓ Basic information
✓ Skills
✓ Experience
✓ Education
○ Profile photo
○ Achievement
```

Gunakan istilah seperti:

> Profile Completeness

atau:

> Identity Readiness

Hindari menyebutnya sebagai "professional quality score" yang seolah-olah menilai kualitas manusia.

---

# 14. PUBLIC PROFILE

Setiap user dapat memiliki public profile jika mengaktifkannya.

Contoh URL sementara:

```text
https://portotional.vercel.app/u/username
```

Jangan menggunakan `.com` sebelum domain tersebut benar-benar tersedia.

---

# 15. PUBLIC PROFILE CONTENT

Profile publik dapat menampilkan:

* Profile photo
* Name
* Professional headline
* Profession
* About
* Skills
* Experience
* Education
* Certifications
* Projects
* Achievements
* Languages
* Location
* Social links
* Portfolio
* Website
* Contact option
* Profile completeness/readiness

Field sensitif tidak boleh otomatis dipublikasikan.

---

# 16. PROFILE PRIVACY

User harus dapat menentukan:

```text
Public
Private
```

dan mengatur visibility untuk field tertentu.

Contoh:

```text
Email          Private
Phone          Private
Location       Public
Skills         Public
Experience     Public
```

---

# 17. DISCOVER — TALENT DISCOVERY

PortoTional harus memiliki halaman untuk mencari pengguna/profesional lain.

Contoh:

```text
Discover Professionals

[ Search ]

Search by:
Name
Skill
Profession
Industry
Location
Experience
```

---

# 18. DISCOVER RESULT

Selain search result, halaman Discover harus menampilkan rekomendasi/profile cards.

Contoh card:

```text
┌────────────────────────────┐
│          PHOTO             │
│                            │
│ Reja Nur                   │
│ Software Engineer          │
│                            │
│ React · TypeScript · SQL   │
│                            │
│ Indonesia                  │
│                            │
│ [ View Profile ]           │
└────────────────────────────┘
```

Card harus singkat dan tidak membocorkan data privat.

---

# 19. SEARCH SYSTEM

Search harus mendukung:

* Name
* Profession
* Skills
* Industry
* Location
* Experience

Search harus scalable dan menggunakan indexing/pagination yang sesuai.

Jangan melakukan filtering seluruh database hanya di frontend.

---

# 20. SEARCH RANKING

Ranking dapat mempertimbangkan:

* Search relevance
* Skill match
* Profession match
* Profile completeness
* Activity
* Location relevance
* Public visibility

V1 tidak perlu menggunakan machine learning kompleks.

Rule-based ranking sudah cukup.

---

# 21. PERSONAL WEBSITE

User premium dapat memiliki personal website.

Untuk kondisi saat ini, domain utama PortoTional adalah:

```text
portotional.vercel.app
```

Konsep:

```text
username.portotional.com
```

merupakan **future capability setelah custom domain tersedia**.

Jangan hardcode `.com` di aplikasi saat ini.

---

# 22. WEBSITE CONTENT

Personal website dapat menggunakan Master Identity:

* Hero
* About
* Skills
* Experience
* Projects
* Education
* Certifications
* Contact
* Social Links

Website harus dapat dibuat melalui template/generator.

---

# 23. WEBSITE SEO

Personal website harus dapat memiliki:

* Dynamic title
* Description
* Open Graph
* Canonical URL
* Structured data
* Sitemap integration jika applicable

---

# 24. SEO SYSTEM

SEO menjadi bagian penting PortoTional.

Target bukan hanya:

> "PortoTional"

tetapi juga search intent yang relevan.

Contoh keyword coverage:

```text
PortoTional
PortoTional CV
PortoTional AI
AI CV Builder
AI Resume Builder
ATS Resume Builder
Digital CV
Digital Resume
Online Portfolio
Professional Portfolio
Portfolio Builder
Professional Profile
Digital Professional Identity
```

Keyword harus digunakan **secara natural**.

---

# 25. BRAND SEO

Homepage harus memiliki:

* Correct title
* Meta description
* Canonical
* Open Graph
* Structured data
* Favicon
* Manifest
* Sitemap
* robots.txt

Target pencarian:

> PortoTional

harus mengarah ke official PortoTional web presence.

---

# 26. MISSPELLING STRATEGY

Jangan melakukan keyword stuffing.

Sistem dapat memahami typo pada:

* internal search
* suggestion
* "Did you mean PortoTional?"

Jika suatu saat tersedia domain typo yang relevan dan layak diamankan, dapat diarahkan ke domain utama.

---

# 27. SEO INDEXING

Public profiles dapat memiliki setting:

```text
Allow search engines to index my profile
```

Jika OFF:

```text
noindex
```

Profile private tidak boleh masuk public sitemap.

Private routes tidak boleh di-index.

---

# 28. SEO ROUTES

Konsep route:

```text
/
 /discover
 /pricing
 /ai-cv-builder
 /ats-resume-builder
 /digital-cv
 /portfolio-builder
 /professional-profile
 /u/[username]
 /app
```

Landing SEO pages harus benar-benar memberikan informasi relevan, bukan halaman keyword spam.

---

# 29. SEO TECHNICAL REQUIREMENTS

Wajib:

* Sitemap
* Robots.txt
* Canonical URLs
* Dynamic metadata
* Open Graph
* Structured Data
* Semantic HTML
* Clean URLs
* Internal linking
* Optimized images
* Good Core Web Vitals
* No duplicate content
* Correct noindex handling

Current canonical base:

```text
https://portotional.vercel.app
```

Future canonical:

```text
https://portotional.com
```

Base URL harus configurable melalui environment/configuration.

---

# 30. LIGHT & DARK MODE

PortoTional wajib memiliki:

```text
Light
Dark
System
```

Tema harus menggunakan **satu design token system**.

Jangan membuat Light dan Dark sebagai dua UI berbeda.

---

# 31. DESIGN SYSTEM

Centralized design tokens:

```text
Colors
Typography
Spacing
Radius
Shadows
Borders
Buttons
Cards
Forms
Tables
Dialogs
Toast
Notifications
Loading
Empty States
Error States
```

---

# 32. BRAND COLORS

Base identity tetap:

```text
Obsidian Charcoal
#0B0C10

Titanium Ivory
#F8F9FA

Champagne Gold
#D4AF37
```

Namun warna tidak boleh digunakan secara berlebihan.

Champagne Gold terutama menjadi accent/status/brand highlight.

Light mode harus tetap readable.

---

# 33. NOTIFICATION SYSTEM

Notification **tidak boleh hardcoded**.

Notification harus berasal dari real application events.

Contoh:

```text
CV generation completed
Payment successful
Payment failed
Subscription expiring
Profile viewed
Contact request received
Profile published
Profile verification completed
New device login
AI generation completed
System announcement
```

---

# 34. NOTIFICATION ARCHITECTURE

```text
Application Event
       ↓
Notification Service
       ↓
Database
       ↓
In-App Notification
       +
Push Notification
       +
Email (jika diperlukan)
```

Notification harus memiliki:

* ID
* user ID
* type
* title
* body
* read state
* created_at
* optional related entity
* optional action URL

---

# 35. NOTIFICATION PREFERENCES

User dapat mengatur:

```text
Push
Email
In-App
```

berdasarkan kategori tertentu.

---

# 36. REALTIME

Notification tertentu dapat muncul secara realtime menggunakan mekanisme realtime backend.

Contoh:

```text
Payment completed
↓
Notification appears
```

tanpa hardcoded polling UI semata.

---

# 37. BILLING & TRANSACTIONS

Riwayat transaksi wajib tersedia untuk **User dan Admin**.

User:

```text
Settings
└── Billing & Transactions
    ├── Current Plan
    ├── Transaction History
    └── Invoices
```

---

# 38. TRANSACTION HISTORY

Minimal field:

```text
Transaction ID
Date
Product
Type
Amount
Payment Method
Status
```

Status:

```text
Pending
Paid
Failed
Expired
Cancelled
Refunded
Partially Refunded
```

---

# 39. TRANSACTION DETAIL — USER

User dapat membuka:

```text
Transaction ID
Status
Product
Amount
Payment Method
Transaction Date
Payment Gateway
Gateway Reference
Invoice
Refund information
```

User dapat:

```text
View Invoice
Download Invoice
```

jika tersedia.

---

# 40. ADMIN TRANSACTION MANAGEMENT

Admin harus memiliki:

```text
Transactions
├── Overview
├── All
├── Pending
├── Successful
├── Failed
├── Refunded
└── Disputed
```

Search:

* Transaction ID
* User
* Email
* Invoice ID
* Gateway Reference
* Product
* Status
* Date range

---

# 41. PAYMENT SECURITY

Payment status harus berasal dari:

```text
Payment Gateway
       ↓
Webhook
       ↓
Backend Verification
       ↓
Transaction
       ↓
Entitlement
       ↓
Notification
```

Frontend tidak boleh menjadi sumber kebenaran pembayaran.

---

# 42. BILLING DATA MODEL

Pisahkan konsep:

```text
Product
Order
Transaction
Payment
Subscription
Entitlement
Invoice
Refund
```

Jangan menjadikan satu tabel sebagai representasi semua hal.

---

# 43. ENTITLEMENT SYSTEM

Hak akses user harus berdasarkan entitlement.

Contoh:

```text
FREE
├── Basic AI
├── CV
├── Public Profile
└── Discover

PRO
├── Advanced AI
├── Premium Templates
├── Personal Website
├── Advanced Analytics
└── Additional Features
```

Implementasi tidak boleh tersebar menggunakan hardcoded:

```text
if plan === "pro"
```

di banyak tempat.

---

# 44. INVOICE

Invoice harus memiliki:

* Invoice number
* Customer
* Product
* Date
* Amount
* Discount jika ada
* Tax jika applicable
* Total
* Payment method
* Payment status

---

# 45. ADMIN SYSTEM

PortoTional harus memiliki Admin interface.

Minimal:

```text
Admin Dashboard
Users
Profiles
Moderation
Transactions
Subscriptions
Reports
Notifications
Analytics
System Health
Audit Logs
Feature Flags
```

---

# 46. ADMIN USER MANAGEMENT

Admin dapat:

* Search users
* View account status
* View public profile status
* Suspend account
* Restore account
* Manage reports
* Review moderation status

Admin tidak boleh mendapatkan akses terhadap data sensitif yang tidak diperlukan.

---

# 47. AUDIT LOG

Action penting harus dicatat.

Contoh:

```text
Admin suspended user
Admin refunded transaction
User changed email
User changed password
Subscription changed
Profile visibility changed
```

Audit log minimal:

```text
actor
action
target
timestamp
metadata
```

---

# 48. REPORT & MODERATION

Public profile membutuhkan:

```text
Report Profile
Report Content
Block User
```

Admin dapat:

```text
Review
Dismiss
Take Action
```

---

# 49. SECURITY

Karena PortoTional menyimpan data profesional dan personal, wajib memiliki:

* Server-side authorization
* Supabase RLS
* Input validation
* Input sanitization
* Rate limiting
* Brute-force protection
* Secure file upload
* MIME validation
* File size limits
* XSS protection
* Secure sessions
* OAuth security
* API protection
* Secret management

---

# 50. FILE MANAGEMENT

Asset yang dapat disimpan:

```text
Profile Photo
CV
PDF
Project Images
Certificates
Portfolio Assets
```

Asset model minimal:

```text
Asset
├── owner
├── type
├── visibility
├── mime_type
├── size
├── storage_path
├── created_at
└── deleted_at
```

Private files harus menggunakan protected storage/signed URL.

---

# 51. MOBILE APP

PortoTional bukan sekadar website yang di-download.

Mobile app harus dianggap sebagai **first-class application**.

Technology:

> **Flutter**

---

# 52. WEB VS MOBILE

```text
                    PORTOTIONAL
                         │
            ┌────────────┴────────────┐
            │                         │
          WEB                       MOBILE
        Next.js                    Flutter
            │                         │
            └────────────┬────────────┘
                         │
                      Supabase
```

Keduanya menggunakan:

* Authentication
* Database
* Storage
* AI backend
* Payment backend
* Notification backend
* Master Identity

yang sama.

---

# 53. WEB EXPERIENCE

Web digunakan untuk:

* Landing
* SEO
* Public Profile
* Discover
* CV Builder
* Dashboard
* Personal Website
* Pricing
* Public resources

---

# 54. MOBILE EXPERIENCE

Mobile digunakan untuk:

* Identity management
* CV management
* AI
* Profile
* Discover
* Notifications
* Account
* Camera/photo
* File management
* Billing
* Mobile-first interactions

---

# 55. ADMIN

Admin terutama:

> **Web-first**

Tidak wajib memiliki seluruh Admin Dashboard di Flutter.

---

# 56. APP DISTRIBUTION

Current state:

```text
No official Play Store
No official App Store
```

Maka Android dapat menggunakan:

> **Direct APK distribution**

---

# 57. DOWNLOAD PAGE

Current URL:

```text
https://portotional.vercel.app/download
```

Halaman harus adaptif.

Android:

```text
Download PortoTional APK
[ Download APK ]
```

iOS:

```text
Install PortoTional
[ Installation Guide ]
```

Desktop:

```text
Use PortoTional Web
```

---

# 58. ANDROID DISTRIBUTION

Sebelum Play Store:

```text
Website
 ↓
Download APK
 ↓
Install manually
```

Download page harus menyediakan:

* Version
* Release date
* File size
* Changelog
* Minimum Android version
* Installation instructions
* Checksum jika tersedia

---

# 59. IOS DISTRIBUTION

Tidak boleh menganggap `.ipa` dapat didownload bebas seperti APK.

Pre-App Store:

* TestFlight
* atau mekanisme Apple distribution yang sesuai

PWA boleh menjadi fallback web experience, tetapi **bukan pengganti Flutter app**.

---

# 60. APP UPDATE SYSTEM

App harus mengetahui:

```text
Current Version
Latest Version
Minimum Supported Version
```

Jika update tersedia:

```text
New PortoTional version available.

[ Update Now ]
[ Later ]
```

Jika versi terlalu lama:

```text
Update required.
```

---

# 61. PWA

PWA boleh disediakan sebagai **optional web installation experience**.

Namun PortoTional tidak boleh diposisikan sebagai:

> "PWA = Mobile App utama."

Flutter adalah mobile application utama.

---

# 62. DEEP LINKING

Harus dipersiapkan untuk future custom domain.

Contoh:

```text
portotional.vercel.app/u/reja
```

Jika app terinstall:

```text
Open in PortoTional
```

Jika belum:

```text
Open Web Profile
```

Future:

```text
portotional.com/u/reja
```

dengan Android App Links / iOS Universal Links.

---

# 63. ANALYTICS

User analytics:

```text
Profile Views
CV Downloads
Website Visits
Search Appearances
Contact Clicks
```

Admin analytics:

```text
Users
Active Users
CV Generation
AI Usage
Profiles
Transactions
Revenue
Conversion
App Downloads
```

Analytics harus menghormati privacy.

---

# 64. PROFILE VIEW PRIVACY

Jangan secara otomatis menampilkan identitas viewer jika sistem memang tidak mengumpulkan/mengizinkan informasi tersebut.

Lebih aman:

> Your profile received 12 views this week.

---

# 65. ONBOARDING

User baru harus diarahkan melalui onboarding.

```text
Sign Up
 ↓
Profession
 ↓
Basic Information
 ↓
Skills
 ↓
Experience
 ↓
Education
 ↓
Photo
 ↓
CV Preferences
 ↓
AI Processing
 ↓
Identity Ready
```

Onboarding harus dapat di-skip dan dilanjutkan nanti.

---

# 66. AUTOSAVE

Data penting harus autosave.

Contoh:

> Saved 5 seconds ago

Jika terjadi browser crash, user dapat melanjutkan draft.

---

# 67. VERSION HISTORY

Master Identity dan CV harus memiliki version history jika applicable.

```text
v4 — Aug 26
v3 — Aug 20
v2 — Aug 10
v1 — Initial
```

User dapat:

* View
* Restore

---

# 68. OFFLINE / NETWORK HANDLING

Aplikasi harus menangani koneksi buruk.

Contoh:

```text
You're offline.
Your recent changes are saved locally.
```

Ketika online:

```text
Syncing...
✓ Synced
```

Tidak semua fitur harus offline-capable.

---

# 69. EMPTY STATES

Semua halaman harus memiliki meaningful empty state.

Contoh:

> You don't have a CV yet.

```text
[ Create with AI ]
```

Bukan hanya:

> No data.

---

# 70. ERROR STATES

Minimal:

```text
401
403
404
429
500
503
```

Semua harus menggunakan UI PortoTional yang konsisten.

---

# 71. PERFORMANCE

Public-facing pages harus ringan.

Wajib:

* Image optimization
* Lazy loading
* Pagination
* Efficient queries
* Caching bila relevan
* Optimized fonts
* Minimal client-side JavaScript jika tidak diperlukan
* Avoid unnecessary 3D loading
* Async AI processing

3D tidak boleh membuat CV/public profile lambat.

---

# 72. ACCESSIBILITY

Target:

* Keyboard navigation
* Semantic HTML
* Screen reader support
* Focus state
* Contrast
* Reduced motion
* Touch target
* Readable typography
* Accessible forms
* Accessible notifications

Light dan Dark mode harus sama-sama accessible.

---

# 73. LOCALIZATION

Minimal:

```text
Indonesian
English
```

Architecture harus siap untuk bahasa lain.

Localization mencakup:

* UI
* Date
* Currency
* CV terminology
* PDF
* Metadata
* Notifications

---

# 74. LEGAL & TRUST

Public product harus menyediakan:

* Terms of Service
* Privacy Policy
* Refund Policy
* AI usage/disclaimer
* Community Guidelines
* Report policy

---

# 75. DATA MANAGEMENT

User harus memiliki:

```text
Export My Data
Download My Information
Deactivate Account
Delete Account
Delete Public Profile
```

Account deletion harus mengikuti lifecycle data yang jelas.

---

# 76. BACKUP & RECOVERY

Sistem harus memiliki strategi backup untuk:

* Database
* Important storage
* Transactions
* Subscriptions
* User identity

serta recovery procedure.

---

# 77. OBSERVABILITY

Admin/system monitoring minimal:

```text
API
Database
AI
Storage
Payment
Notification
Email
```

Status:

```text
Operational
Degraded
Down
```

Error monitoring harus tersedia.

---

# 78. FEATURE FLAGS

Fitur tertentu dapat dikontrol melalui feature flags.

Contoh:

```text
feature_discover
feature_ai_job_tailoring
feature_mobile_download
feature_new_cv_editor
feature_3d_profile
```

Feature flags tidak boleh menggantikan authorization.

---

# 79. MAINTENANCE MODE

Admin dapat mengaktifkan maintenance mode.

User akan mendapatkan halaman:

> PortoTional is temporarily under maintenance.

bukan generic server error.

---

# 80. DOMAIN STRATEGY

### Current

```text
https://portotional.vercel.app
```

### Future

```text
https://portotional.com
```

`.com` **belum dianggap aktif**.

Semua URL generation harus menggunakan configurable base URL.

Jangan hardcode:

```text
portotional.com
```

di source code.

---

# 81. CURRENT PUBLIC URL STRUCTURE

Recommended:

```text
/
 /discover
 /pricing
 /download
 /app
 /u/[username]
 /ai-cv-builder
 /ats-resume-builder
 /digital-cv
 /portfolio-builder
 /professional-profile
```

Private:

```text
/dashboard
/settings
/billing
/notifications
/admin
```

---

# 82. DEFINITION OF DONE — UPDATE

Update dianggap berhasil jika:

### Product

* [ ] Semua profesi didukung
* [ ] AI tersedia untuk seluruh user
* [ ] Master Identity menjadi source of truth
* [ ] Multiple CV didukung
* [ ] Profile photo tersedia
* [ ] AI tidak mengarang fakta

### Discovery

* [ ] Search user
* [ ] Skill search
* [ ] Profession search
* [ ] Location filtering
* [ ] Profile cards
* [ ] Public profile
* [ ] Privacy control

### UI

* [ ] Light mode
* [ ] Dark mode
* [ ] System mode
* [ ] Unified design system
* [ ] Accessibility

### Notification

* [ ] Real database notifications
* [ ] Event-driven
* [ ] Realtime where appropriate
* [ ] Push architecture
* [ ] Preferences

### Billing

* [ ] User transaction history
* [ ] Transaction detail
* [ ] Invoice
* [ ] Admin transaction management
* [ ] Webhook verification
* [ ] Entitlements

### Admin

* [ ] User management
* [ ] Moderation
* [ ] Reports
* [ ] Transactions
* [Analytics
* [ ] Audit logs
* [ ] Feature flags
* [ ] System health

### SEO

* [ ] Brand SEO
* [ ] Search intent pages
* [ ] Public profile SEO
* [ ] Personal website SEO
* [ ] Sitemap
* [ ] Robots
* [ ] Canonical
* [ ] Structured data
* [ ] Open Graph
* [ ] Dynamic metadata
* [ ] No keyword stuffing

### Mobile

* [ ] Flutter application architecture
* [ ] Shared backend
* [ ] Android APK distribution
* [ ] Download page
* [ ] App version checking
* [ ] iOS distribution strategy
* [ ] Deep-link architecture

### Reliability

* [ ] Autosave
* [ ] Error states
* [ ] Empty states
* [ ] Offline handling
* [ ] Backup strategy
* [ ] Observability
* [ ] Rate limiting

---

# 83. IMPLEMENTATION PRIORITY

Supaya OpenCode tidak melebar, update ini harus dibagi menjadi prioritas.

## 🔴 MUST HAVE — Implement Now

```text
Master Identity refinement
Universal profession support
AI for all users
AI fact preservation
Profile photo
Multiple CV foundation
Light/Dark/System theme
Discover/Search
Public profile
Privacy controls
Real notifications
Billing/transaction history
Transaction detail
Admin
SEO foundation
Security
File security
Flutter architecture
Android APK distribution
Download page
Responsive UX
Accessibility basics
```

## 🟠 SHOULD HAVE — Implement if architecture is ready

```text
Profile analytics
Version history
Autosave
App update checking
Deep linking foundation
Invoice improvements
Advanced search ranking
Feature flags
System health
Offline draft recovery
```

## 🟡 NICE TO HAVE

```text
Profile recommendations
Saved professionals
Contact requests
Additional CV templates
Advanced analytics
Advanced AI tailoring
3D profile enhancements
```

## 🔵 FUTURE

```text
Play Store
App Store
Native deep-link production
Identity verification
Education verification
Certificate verification
Full messaging
Advanced recommendation engine
Advanced recruiter ecosystem
Custom domain infrastructure
```

---

# 84. CRITICAL ARCHITECTURAL RULES

OpenCode **WAJIB mengikuti aturan berikut**:

### Rule 1

> Jangan membuat PortoTional hanya untuk developer.

### Rule 2

> Jangan membuat AI hanya untuk Pro.

### Rule 3

> Jangan membuat notification hardcoded.

### Rule 4

> Jangan mempercayai frontend sebagai sumber kebenaran payment.

### Rule 5

> Jangan hardcode `portotional.com`.

Current domain:

```text
portotional.vercel.app
```

### Rule 6

> Jangan menganggap PWA sebagai mobile application utama.

Mobile application:

> Flutter.

### Rule 7

> Jangan membuat database CV, Profile, dan Website sebagai sumber data terpisah.

Gunakan:

> Master Identity.

### Rule 8

> Jangan menggunakan keyword stuffing untuk SEO.

### Rule 9

> Jangan membiarkan AI menciptakan fakta profesional.

### Rule 10

> Jangan mengimplementasikan Future Features sebagai fitur aktif hanya karena arsitekturnya dipersiapkan.

---

# 85. FINAL PRODUCT VISION

PortoTional pada akhirnya memiliki struktur:

```text
                         PORTOTIONAL
                              │
                 ┌────────────┴────────────┐
                 │                         │
             WEB PLATFORM             MOBILE APP
              Next.js                  Flutter
                 │                         │
                 └────────────┬────────────┘
                              │
                         SUPABASE CORE
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        MASTER IDENTITY      AI           BILLING
              │               │               │
       ┌──────┼──────┐        │        ┌──────┴──────┐
       │      │      │        │        │             │
      CV   PROFILE WEBSITE    │   TRANSACTION   ENTITLEMENT
       │      │      │        │
       └──────┼──────┘        │
              │               │
          DISCOVERY       AI ASSISTANCE
              │
             SEO
```

Dengan filosofi:

> **One Identity. One Setup. Every Professional Surface.**

---

# 86. IMPORTANT NOTE FOR OPENCODE

Dokumen ini **bukan instruksi untuk mengulang pembangunan PortoTional dari nol**.

OpenCode harus:

1. Membaca existing PortoTional project.
2. Membaca PRD utama sebelumnya.
3. Membaca dokumen update ini.
4. Audit implementasi saat ini.
5. Membandingkan existing implementation dengan requirements update.
6. Menentukan bagian yang sudah terpenuhi.
7. Menentukan gap.
8. Memperbaiki architecture jika diperlukan.
9. Implementasikan hanya perubahan yang belum terpenuhi.
10. Jangan merusak fitur yang sudah sesuai dengan PRD sebelumnya.

### Prioritas utama:

> **Correctness → Architecture → Security → UX → Performance → Visual polish.**

Jangan mengejar visual sebelum fondasi data, authentication, authorization, notification, billing, SEO, dan architecture benar.

---

## STATUS DOKUMEN

**PortoTional Final Update PRD — READY**

Dokumen ini menjadi **source of truth untuk seluruh perubahan PortoTional yang dibahas pada 26 Agustus 2026**, sedangkan fitur dasar yang tidak disebutkan di sini tetap mengikuti **Master PRD PortoTional sebelumnya**.

**Current URL:** `portotional.vercel.app`
**Future domain:** `portotional.com`
**Web:** Next.js
**Mobile:** Flutter
**Backend:** Supabase
**AI:** Universal AI assistance with usage controls
**Primary Product:** AI-powered professional digital identity & CV platform.
