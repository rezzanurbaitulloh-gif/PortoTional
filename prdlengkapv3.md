# PortoTional — Master Product Improvement Concept + Complete PRD + Technical Blueprint + OpenCode Build Prompt

**Version:** Master v3  
**Date:** 2026-08-26  
**Status:** Target specification / rebuild roadmap  
**Primary goal:** Transform PortoTional from a basic profile/CV/website product into a complete professional identity, portfolio, showcase, discovery, and personal website platform.

---

# PART I — KONSEP PERBAIKAN RINCI

## 1. Product Direction

### Current problem

PortoTional currently risks feeling like:
- CV/profile CRUD
- text-heavy personal website generator
- generic dashboard
- visually empty public profiles
- gimmick-first experience through 3D face
- limited proof of actual work

### New product definition

> **PortoTional is a professional identity and portfolio platform where people can build their identity, document real work, showcase projects and activities, generate professional CVs, publish personal websites, and be discovered by others.**

Core principle:

> **Show what you are, show what you have done, and make it easy to present it professionally.**

The user's real work becomes the center of the product.

---

## 2. Core Product Pillars

1. Identity
2. CV
3. Showcase / Projects
4. Media
5. Personal Website
6. Discovery
7. Professional Networking
8. AI Assistance
9. Analytics
10. Billing / Entitlements
11. Security
12. Admin Operations

---

## 3. 3D Face Repositioning

The existing 3D face feature is no longer a core identity requirement.

### New role

`3D Face = Optional Profile Enhancement`

It may remain as:
- optional avatar enhancement
- visual profile decoration
- future experimental feature

It must not dominate:
- public profile
- homepage
- portfolio
- CV
- website

A normal profile photo/avatar is the primary identity representation.

---

## 4. Showcase System

Showcase becomes one of the most important product entities.

### Showcase types

- Project
- Activity
- Achievement
- Certification
- Experience
- Event
- Design
- Publication
- Custom showcase

### Showcase content

Each showcase can contain:
- title
- type
- short description
- full description
- cover image
- image gallery
- video
- date / date range
- role
- organization
- collaborators
- technologies / skills
- category
- external links
- GitHub
- live demo
- downloadable files
- results / impact
- visibility
- featured status

### Case study mode

Projects can optionally become full case studies:

1. Overview
2. Problem
3. Goals
4. Process
5. Solution
6. Features
7. Screenshots
8. Technology
9. Role / contribution
10. Results
11. Lessons learned
12. Links

---

## 5. Media / Asset Library

Users need a reusable asset library.

### Asset types

- Images
- Videos
- Documents
- Certificates
- Project screenshots

### Asset capabilities

- upload
- preview
- rename
- delete
- reuse
- metadata
- folder/category
- storage quota
- visibility

One asset may be reused in:
- profile
- showcase
- website
- experience
- achievement
- gallery

---

## 6. Public Profile Redesign

Public profile becomes visual and evidence-based.

### Recommended order

1. Profile header
2. Headline / profession
3. About
4. Featured work
5. Projects / showcase
6. Experience
7. Skills with evidence
8. Education
9. Certifications
10. Achievements
11. Activity / gallery
12. Social links
13. Contact CTA

### Skill evidence

A skill should be connected to actual evidence.

Example:

`Next.js`
- used in 4 projects
- linked showcase cards
- optional experience evidence

Avoid self-rated stars as the primary proof.

---

## 7. Profile Visibility

Every major content entity supports:

- Public
- Unlisted
- Private

Additionally:

- Show on Profile
- Show on Website
- Featured

This prevents private or sensitive media from accidentally becoming public.

---

## 8. Personal Website Redesign

The website must stop feeling like a text-only CV page.

### Website sections

- Hero
- About
- Featured Projects
- Projects
- Case Studies
- Experience
- Education
- Skills
- Certificates
- Achievements
- Gallery
- Timeline / Journey
- Services
- Testimonials
- Blog / Articles
- Contact
- Social Links

Not every template must support every section.

### Data reuse

The website consumes the same canonical profile/showcase data.

User should not need to re-enter:
- project title
- project description
- skills
- experience
- certificates
- achievements

twice.

---

## 9. Website Template System

Templates must have real structural differences, not merely different colors.

Initial categories:
- Minimal
- Modern
- Professional
- Creative
- Academic
- Executive
- Student
- Developer
- Designer
- Freelancer

Initial target:
- 15–20 high-quality templates
- expandable architecture for future templates

### Website customization

- template
- color palette
- typography
- section visibility
- section ordering
- spacing
- layout variants
- hero style
- card style
- button style
- image treatment
- social links
- SEO metadata

---

## 10. CV Builder Redesign

CV creation becomes:

`Create CV → Template Gallery → Editor → Preview → Save → Export/Share`

### Template system is CORE

The previous "additional CV templates" item is upgraded from NICE/FUTURE to a core requirement for the CV builder.

### CV template categories

- Professional
- Modern
- Minimal
- ATS-friendly
- Executive
- Creative
- Academic
- Student
- Developer / Tech
- Designer

### Initial target

15–20 strong templates, expandable through a template engine.

### Template requirements

Templates must:
- look professional
- have distinct layouts
- support real profile data
- support multi-page CVs
- support A4
- support Letter
- be printable
- be PDF-exportable
- preserve typography and spacing
- support section visibility/order

---

## 11. Fixed Document CV Rendering

This is a mandatory architectural requirement.

CV is a document, not a responsive webpage.

### Default

A4:
- 210 × 297 mm

Letter:
- 8.5 × 11 in

The document renderer must use physical units / deterministic layout.

### Device behavior

Desktop, tablet, and mobile only change:
- viewport
- zoom
- viewer controls

They must NOT change:
- typography
- spacing
- margins
- element positions
- section ordering
- page dimensions
- pagination

### Preview/PDF parity

The preview and exported PDF must derive from the same template/layout specification.

Requirement:

> Same data + same template + same configuration = same document structure and pagination across devices.

Changing font size, margins, or content may legitimately change page count. Device size must not.

### Viewer controls

- zoom
- page navigation
- fullscreen
- print
- download PDF

---

## 12. AI Layer

AI should be a productivity layer, not the product itself.

Features:
- profile writing assistant
- CV content improvement
- CV generation from profile
- project description generator
- case study generator
- website copy assistant
- SEO optimizer
- portfolio reviewer
- skill suggestions
- content restructuring

AI may use user-approved profile/showcase data.

---

## 13. Discovery

Public users can discover professionals.

Filters:
- profession
- skills
- category
- industry
- location
- experience
- verification status

Search results should prioritize:
- profile completeness
- relevant skills
- showcase quality
- verified status
- recency where appropriate

---

## 14. Saved Professionals

Official roadmap feature.

Users can:
- save professionals
- remove saves
- organize saves into collections

Example collections:
- Developers
- Designers
- Potential collaborators
- Inspiration

---

## 15. Contact Requests

Professional contact flow:

`View Profile → Contact / Collaborate → Request → Accept / Decline`

Do not require immediate unrestricted messaging.

Future connection layer can support:
- professional connection
- collaboration request
- contact request
- conversation

---

## 16. Identity Verification

Planned trust layer.

Possible statuses:
- Unverified
- Verified
- Professionally Verified

Verification should be privacy-conscious.

Sensitive identity documents must never be exposed publicly.

Admin verification actions must be audited.

---

## 17. Analytics

### Website analytics

- visitors
- page views
- unique visitors
- top pages
- top projects
- traffic sources
- devices
- approximate geography where legally/technically appropriate

### Profile analytics

- profile views
- project views
- CV views

Analytics visibility depends on plan.

---

## 18. Navigation Architecture

Dashboard is NOT a primary navbar item.

Authenticated user accesses workspace through Profile Menu.

### User profile menu

- My Profile
- Dashboard
- Settings
- Notifications
- Billing & Plan
- Logout

### Admin profile menu

- My Profile
- Dashboard
- Admin Console
- Settings
- Notifications
- Logout

The Admin Console must be role/permission aware.

---

## 19. Admin God Mode

Admin Console is the centralized operational control center.

Modules:
- Overview
- Users
- User detail
- Plans & Entitlements
- Billing
- CMS
- Public Profiles
- Discovery
- AI Control
- Notifications
- Analytics
- Moderation
- System
- Audit Logs
- Admin Settings

### User management

Admin can:
- view user
- edit profile
- view CVs
- view showcases
- view website
- view AI usage
- view activity
- view notifications
- view transactions
- view entitlements
- verify/unverify
- suspend/restore
- reset password through approved recovery flow
- delete account where policy permits

### Entitlements

Admin can:
- grant Pro
- revoke Pro
- extend subscription/access
- create custom entitlement

Manual entitlement is NOT payment fabrication.

Payment records remain immutable/trusted.

### CMS

Admin can manage:
- homepage content
- landing page content
- announcements
- FAQ
- help content
- legal content
- featured content
- SEO metadata

### AI control

- provider status
- provider priority
- quotas
- rate limits
- feature toggles
- fallback configuration
- usage monitoring

API secrets must never be shown in plaintext.

---

## 20. Authentication & Security

### User

- email/password
- email verification
- Cloudflare Turnstile
- secure session
- password recovery
- password change
- session management
- logout all sessions
- optional 2FA

### Admin

- email verification
- password
- Cloudflare Turnstile
- mandatory 2FA
- stricter session policy
- step-up authentication for sensitive actions

### Security controls

- brute-force protection
- rate limiting
- suspicious-login detection
- session revocation
- security event logs
- RBAC
- server-side authorization
- audit logs

Frontend visibility is never the security boundary.

---

## 21. RBAC

Suggested roles:

- USER
- SUPPORT
- MODERATOR
- ADMIN
- SUPER_ADMIN

Permissions examples:
- users.read
- users.edit
- users.suspend
- users.delete
- billing.read
- billing.refund
- entitlement.grant
- entitlement.revoke
- content.read
- content.edit
- content.publish
- moderation.read
- moderation.action
- system.read
- system.configure
- admin.manage

Least privilege is mandatory.

---

## 22. Audit & Dangerous Actions

Critical operations require:
- confirmation
- reason
- server-side permission check
- audit record

Examples:
- delete user
- grant lifetime Pro
- revoke critical entitlement
- refund
- change admin permissions
- change critical system configuration
- maintenance mode

Optional step-up 2FA for high-risk operations.

Audit records should contain:
- actor
- target
- action
- before state where safe
- after state where safe
- timestamp
- reason
- request/security metadata where appropriate

---

## 23. Free vs Pro

### Free

- profile
- basic CV
- limited showcase
- basic website
- limited assets
- basic templates

### Pro

- unlimited / expanded showcase
- more storage
- advanced CV templates
- advanced website templates
- custom domain
- analytics
- advanced customization
- expanded AI usage
- more media
- remove PortoTional branding

Exact limits should be configurable by admin.

---

## 24. i18n

Full internationalization remains a roadmap item, but architecture must be ready from the beginning.

Minimum:
- translation keys
- locale-aware formatting
- language selector architecture
- no hard-coded UI strings in core components
- support at least Indonesian and English as first target locales

Full language coverage can ship later.

---

## 25. Mobile App Roadmap

Play Store / App Store is Future scope.

Web remains the primary product.

Architecture should avoid blocking future mobile clients by keeping:
- API contracts
- auth
- business logic
- data model
- permissions

cleanly separated from UI.

---

# PART II — COMPLETE PRD

## 1. Product Summary

**Product:** PortoTional  
**Category:** Professional identity / portfolio / CV / personal website / discovery platform  
**Primary platforms:** Web first  
**Future:** iOS and Android  
**Default locale:** Indonesian  
**Planned locale:** English + extensible i18n  
**Primary goal:** Make a user's professional identity visually credible, data-rich, shareable, and reusable across profile, CV, showcase, and website.

---

## 2. Product Goals

### Primary goals

1. Create professional profiles.
2. Build CVs from structured profile data.
3. Offer multiple professional CV templates.
4. Showcase real projects and activities using rich media.
5. Generate rich personal websites from the same data.
6. Enable public discovery.
7. Provide AI-assisted professional content creation.
8. Provide analytics and monetization.
9. Provide secure user/admin authentication.
10. Provide a full operational Admin Console.

### Non-goals for initial release

- Native mobile apps
- Full global i18n
- unrestricted social network
- arbitrary user-to-user chat
- advanced marketplace

---

## 3. Personas

### User / Student
Needs:
- CV
- portfolio
- project evidence
- activity documentation
- internship applications
- personal website

### Professional
Needs:
- polished CV
- case studies
- experience
- professional website
- discovery
- contact

### Recruiter / Visitor
Needs:
- quickly understand person
- see evidence
- inspect projects
- download/share CV
- contact candidate

### Admin
Needs:
- manage platform
- manage users
- manage entitlements
- moderate
- manage content
- monitor billing
- operate AI
- inspect audit/security events

---

## 4. Functional Requirements

### FR-AUTH

- Registration
- Login
- Logout
- Email verification
- Password reset
- Password change
- Session management
- Turnstile
- 2FA for admin
- suspicious login protection
- account status handling

### FR-PROFILE

- create/edit profile
- avatar
- profession
- headline
- about
- skills
- experience
- education
- certifications
- achievements
- social links
- visibility
- featured content

### FR-SHOWCASE

- CRUD showcase
- media gallery
- tags
- skills
- role
- dates
- collaborators
- external links
- visibility
- featured
- case study mode

### FR-ASSETS

- upload
- preview
- metadata
- reusable references
- deletion
- quota
- safe file validation

### FR-CV

- create CV
- template gallery
- template categories
- template selection
- profile data import
- section management
- content editing
- appearance controls
- live fixed-layout preview
- A4
- Letter
- multi-page
- deterministic rendering
- PDF export
- print
- share

### FR-WEBSITE

- create website
- choose template
- sections
- section ordering
- theme
- typography
- content binding
- custom content
- preview
- publish/unpublish
- subdomain
- custom domain for eligible plans
- SEO
- social metadata
- responsive public website

### FR-DISCOVERY

- search
- filters
- profile cards
- project cards
- profile detail
- public profile URLs

### FR-SAVED

- save professional
- remove
- collections

### FR-CONTACT

- send contact request
- accept
- decline
- block/report where required

### FR-AI

- generate/improve content
- project descriptions
- case studies
- CV content
- website content
- SEO
- portfolio review

### FR-ANALYTICS

- profile views
- project views
- website metrics
- plan-gated analytics

### FR-BILLING

- plan
- subscription
- entitlement
- transaction history
- payment status
- upgrade/downgrade
- admin manual entitlement

### FR-NOTIFICATION

- in-app notifications
- email-ready architecture
- system announcements
- user-specific notifications
- templates
- admin campaign system

### FR-ADMIN

- admin overview
- users
- user detail
- plans
- entitlements
- billing
- CMS
- AI
- notifications
- moderation
- analytics
- system
- audit
- admin accounts
- permissions

---

## 5. Non-Functional Requirements

### Performance

- fast initial load
- lazy-load heavy media
- optimized images
- pagination for large datasets
- virtualized tables where necessary

### Reliability

- server-side validation
- transaction-safe mutations
- graceful API failures
- retry strategy for non-idempotent external calls only where safe

### Security

- secure cookies
- CSRF strategy where applicable
- server-side authorization
- RBAC
- rate limiting
- Turnstile
- password hashing
- admin 2FA
- audit logs
- secure upload validation

### Accessibility

- keyboard navigation
- semantic HTML
- sufficient contrast
- accessible forms
- focus states
- alt text
- reduced-motion consideration

### Responsive behavior

Public website/profile/admin UI is responsive.

CV document is NOT responsive/reflowing.

---

## 6. CV Rendering Acceptance Criteria

1. Default page size is A4.
2. CV layout is based on physical page dimensions.
3. Device width cannot change document structure.
4. Same data/template/config produces same pagination.
5. Preview and PDF visually match.
6. Multi-page layout is deterministic.
7. Images have constrained dimensions.
8. Fonts are explicitly managed/embedded where PDF renderer permits.
9. Page breaks are intentional and testable.
10. Export must not depend on the current device viewport.

---

## 7. Data Model — High Level

Core entities:

- User
- UserProfile
- UserSkill
- Experience
- Education
- Certification
- Achievement
- Showcase
- ShowcaseMedia
- Asset
- CV
- CVTemplate
- CVSection
- CVConfiguration
- Website
- WebsiteTemplate
- WebsiteSection
- Domain
- SavedProfessional
- SavedCollection
- ContactRequest
- Notification
- NotificationTemplate
- Subscription
- Entitlement
- Transaction
- AIUsage
- AIProvider
- Report
- ModerationAction
- AnalyticsEvent
- AuditLog
- AdminRole
- Permission
- RolePermission
- UserRole
- VerificationRecord
- Session
- SecurityEvent
- FeatureFlag
- CMSContent

---

## 8. Data Relationship Principles

### Canonical data

Profile data is canonical.

CV and website consume canonical data but may store presentation configuration.

Showcase is canonical work evidence.

Assets are reusable references.

### Avoid duplication

Do not copy the entire project into every website/CV record.

Use references and presentation settings.

---

## 9. Visibility Model

Every public-capable entity should support:

- PUBLIC
- UNLISTED
- PRIVATE

Presentation flags:
- showOnProfile
- showOnWebsite
- featured

Backend must enforce visibility.

---

## 10. Entitlement Model

Separate:
- plan
- subscription
- entitlement
- manual grant

Example:

`Plan = PRO`

`Entitlement = custom_domain`

`Grant = admin promotional access`

Payment transaction remains separate and immutable.

---

## 11. Admin Dashboard UX

### Admin overview

Cards:
- total users
- active users
- Pro users
- CVs
- showcases
- websites
- revenue
- AI usage

Panels:
- user growth
- revenue
- recent activity
- alerts
- system health

### User detail

Tabs:
- Overview
- Identity
- CVs
- Showcase
- Website
- Billing
- AI
- Notifications
- Activity
- Security

Actions:
- edit
- grant Pro
- revoke
- suspend
- restore
- verify
- inspect
- dangerous actions

---

## 12. Roadmap

### Phase 1 — Core Platform

- Auth/security foundation
- Profile
- CV template gallery
- CV builder
- fixed CV renderer
- Showcase
- Media library
- public profile
- basic website builder
- basic discovery
- user dashboard
- billing foundation
- admin foundation
- audit foundation
- i18n architecture

### Phase 2 — Platform Expansion

- advanced website templates
- 15–20 CV templates
- advanced AI
- analytics
- Saved Professionals
- Contact Requests
- identity verification
- advanced discovery
- richer case studies
- advanced admin tools

### Phase 3 — Network / Trust

- connections
- collections
- collaboration
- trust/verification
- richer notifications
- advanced moderation

### Phase 4 — Scale

- full i18n
- mobile apps
- Play Store
- App Store
- additional integrations

---

## 13. Success Metrics

- profile completion rate
- CV creation rate
- CV export rate
- showcase creation rate
- average showcase media count
- website publish rate
- website visits
- profile discovery engagement
- saved professional rate
- contact request rate
- Pro conversion
- AI feature adoption
- retention

---

# PART III — TECHNICAL BLUEPRINT

## 1. Recommended Architecture

Use a modular full-stack web architecture.

Suggested:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase / PostgreSQL
- Supabase Auth or equivalent secure auth layer
- Supabase Storage
- Vercel
- server-side API/actions
- PDF/document rendering service/library
- Cloudflare Turnstile

Use the existing project stack where already established, but preserve the architectural boundaries below.

---

## 2. Application Layers

```text
UI
 ↓
Feature Modules
 ↓
Server Actions / API
 ↓
Authorization / Validation
 ↓
Domain Services
 ↓
Database / Storage / External Providers
```

Never allow UI components to become the security boundary.

---

## 3. Suggested Project Structure

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── app/
│   │   ├── profile/
│   │   ├── dashboard/
│   │   ├── cvs/
│   │   ├── showcases/
│   │   ├── assets/
│   │   ├── websites/
│   │   ├── discovery/
│   │   ├── saved/
│   │   ├── notifications/
│   │   └── billing/
│   │
│   └── admin/
│       ├── overview/
│       ├── users/
│       ├── entitlements/
│       ├── billing/
│       ├── cms/
│       ├── ai/
│       ├── notifications/
│       ├── analytics/
│       ├── moderation/
│       ├── system/
│       ├── audit/
│       └── settings/
│
├── components/
├── features/
│   ├── auth/
│   ├── profile/
│   ├── showcase/
│   ├── assets/
│   ├── cv/
│   ├── website/
│   ├── discovery/
│   ├── billing/
│   ├── ai/
│   ├── analytics/
│   └── admin/
│
├── server/
│   ├── auth/
│   ├── permissions/
│   ├── services/
│   ├── repositories/
│   └── integrations/
│
├── lib/
│   ├── validation/
│   ├── i18n/
│   ├── storage/
│   └── utils/
│
└── types/
```

---

## 4. Authorization Architecture

Centralize permissions.

Example conceptual API:

```text
requireAuth()
requireRole()
requirePermission()
requireEntitlement()
```

Example:

```text
requirePermission("users.edit")
requirePermission("entitlement.grant")
requirePermission("content.publish")
```

All admin mutations must pass server-side authorization.

---

## 5. CV Template Engine

Do not hard-code each CV as a separate page.

Use a declarative template definition.

Concept:

```text
CV
├── document settings
│   ├── page size
│   ├── margins
│   ├── typography
│   └── spacing
│
├── layout
│   ├── header
│   ├── columns
│   └── sections
│
└── data bindings
    ├── profile
    ├── experience
    ├── education
    ├── skills
    └── showcases
```

Template renderer consumes:
- CV data
- template definition
- user configuration

and produces:
- preview
- PDF

---

## 6. Fixed Document Renderer

The renderer must operate independently of browser viewport.

Preferred strategy:
- physical dimensions
- explicit page containers
- deterministic CSS/layout rules
- controlled fonts
- controlled image dimensions
- print-specific rendering
- automated PDF visual regression tests

Avoid relying on:
- viewport-dependent widths
- `vw`/`vh` for document content
- responsive breakpoint changes inside CV pages
- browser-dependent auto-flow for critical layout

---

## 7. Website Renderer

Website is different from CV.

Website:
- responsive
- fluid
- adaptive
- mobile-first

CV:
- fixed document
- physical page
- deterministic

Do not share responsive layout assumptions between them.

---

## 8. Showcase Media Pipeline

```text
Upload
 ↓
Validate MIME/type/size
 ↓
Store
 ↓
Generate metadata
 ↓
Optional image optimization/thumbnails
 ↓
Asset record
 ↓
Reference from Showcase/Profile/Website
```

Never trust client-provided MIME type alone.

---

## 9. AI Architecture

```text
AI Feature
 ↓
Prompt/Context Builder
 ↓
Permission / Privacy Check
 ↓
Provider Router
 ↓
Primary Provider
 ↓
Fallback Provider
 ↓
Usage Metering
 ↓
Response
 ↓
Audit / telemetry where appropriate
```

Admin can configure provider state without seeing secrets.

---

## 10. Analytics Architecture

Use event-based tracking.

Examples:
- profile_view
- showcase_view
- cv_view
- cv_export
- website_view
- website_project_click
- contact_request_sent
- save_professional

Avoid storing unnecessary sensitive data.

---

## 11. Notification Architecture

Separate:
- event
- notification
- template
- channel

Channels:
- in-app
- email-ready
- future push

---

## 12. Admin Audit Architecture

Audit logs should be append-oriented.

Do not allow ordinary admin UI to silently overwrite audit history.

Record:
- actor
- action
- entity
- entity ID
- timestamp
- reason
- before/after snapshots where appropriate
- request context where appropriate

---

## 13. Testing Strategy

### Unit
- validation
- permission checks
- entitlement rules
- template calculations
- visibility rules

### Integration
- auth
- profile CRUD
- showcase CRUD
- CV generation
- PDF export
- website publishing
- billing
- admin mutations

### Security
- unauthorized admin API access
- privilege escalation
- session revocation
- brute force
- upload abuse
- visibility bypass
- IDOR tests

### Visual regression
Especially for CV:
- A4 page
- Letter page
- 1-page
- 2-page
- long content
- missing optional sections
- image-heavy content
- different fonts/configurations

Preview vs PDF comparison is mandatory.

---

# PART IV — OPENCODE MASTER BUILD PROMPT

You are the primary implementation agent for PortoTional.

Your job is to evolve/rebuild PortoTional according to this specification. Do not implement a simplified mockup when a production architecture is required.

## Non-negotiable product direction

PortoTional is a professional identity + portfolio + showcase + CV + personal website + discovery platform.

Do NOT reduce it to:
- a CRUD profile
- a text-only CV generator
- a text-only portfolio
- a generic dashboard
- a gimmick centered around a 3D face

The user's real work must be visually central.

---

## Mandatory UX rules

1. Dashboard is NOT a primary navbar item.
2. Authenticated users access Dashboard through Profile Menu.
3. Admin Console appears in Profile Menu only for authorized admin roles.
4. User and admin authentication must be secured.
5. Cloudflare Turnstile must protect appropriate authentication/abuse-sensitive flows.
6. Admin accounts require stronger security, including mandatory 2FA.
7. Admin authorization must be server-side.
8. 3D face is optional enhancement, not core identity.
9. Users must be able to upload project/activity media.
10. Showcase content can appear on public profile and website.
11. Website content must reuse canonical profile/showcase data.
12. CV builder MUST start with a professional template gallery.
13. CV must support multiple high-quality templates.
14. CV must be fixed-layout, not responsive/reflowing.
15. CV preview and PDF must use the same deterministic layout specification.
16. Device viewport must never change CV document structure.
17. Public websites/profiles remain responsive.
18. Privacy/visibility must be enforced server-side.

---

## Required CV flow

Implement:

```text
Create CV
→ Choose Template
→ Import/Use Profile Data
→ Edit Content
→ Customize
→ Fixed A4/Letter Preview
→ Save
→ Export PDF / Print / Share
```

Provide template categories and a scalable template engine.

Do not create only one CV layout.

Initial target is 15–20 professional templates, or the maximum realistic set supported by the existing codebase without lowering quality. Templates must be structurally different.

---

## Required CV rendering rules

CV pages use physical document dimensions.

Default A4:
210mm × 297mm.

Support Letter.

Do not use responsive breakpoints to reflow CV content.

Do not use viewport units for critical document layout.

The following must remain stable across devices:
- page dimensions
- margins
- font sizing
- line height
- section placement
- columns
- page breaks
- image dimensions
- pagination

Zooming is allowed.

Preview/PDF parity is mandatory.

If the current architecture cannot guarantee this, refactor it instead of accepting inconsistent output.

---

## Required Showcase flow

User:

```text
Create Showcase
→ choose type
→ upload media
→ add content
→ connect skills
→ set visibility
→ optionally feature
→ publish
```

Types:
- Project
- Activity
- Achievement
- Certification
- Experience
- Event
- Design
- Publication
- Custom

Projects should support case studies.

---

## Required Profile flow

Public profile should prioritize evidence:

```text
Identity
About
Featured Work
Showcase
Experience
Skills + Evidence
Education
Certificates
Achievements
Gallery
Social
Contact
```

Do not make the profile a wall of text.

---

## Required Website builder

Provide:
- template gallery
- section manager
- section ordering
- theme controls
- typography
- color
- project/showcase integration
- gallery
- timeline
- contact
- SEO
- responsive preview
- publish/unpublish
- subdomain
- custom domain for eligible plans

The website must visually contain enough content to avoid empty-looking pages.

---

## Required Admin Console

Implement the admin console as a first-class secured area.

Modules:

```text
Overview
Users
User Detail
Plans & Entitlements
Billing
CMS
Public Profiles
Discovery
AI Control
Notifications
Analytics
Moderation
System
Audit Logs
Admin Settings
```

User detail must provide:

```text
Overview
Identity
CVs
Showcase
Website
Billing
AI
Notifications
Activity
Security
```

Admin must be able to manually grant/revoke Pro through entitlement records.

Never falsify or mutate verified payment records to simulate a payment.

---

## Required RBAC

Implement at minimum:

```text
USER
SUPPORT
MODERATOR
ADMIN
SUPER_ADMIN
```

Use granular permissions.

Never rely on hidden buttons as authorization.

---

## Required security

Implement:
- email verification
- password recovery
- secure session handling
- Turnstile
- rate limiting
- suspicious login controls where supported
- session revocation
- admin 2FA
- RBAC
- audit logs
- server-side authorization
- secure upload validation
- step-up authentication for critical admin actions

Critical admin actions must require confirmation and a reason.

---

## Required roadmap preservation

Do not remove these items simply because they are not in the first implementation phase:

- additional CV templates
- Saved Professionals
- Contact Requests
- Play Store
- App Store
- Identity Verification
- full i18n

Treat them as roadmap features with architecture hooks.

Full i18n may be future, but the codebase must avoid hard-coded UI text in a way that blocks localization.

---

## Implementation methodology

Before changing code:

1. Inspect the current repository.
2. Identify existing features and what is already implemented.
3. Reuse stable working functionality.
4. Do not duplicate existing systems.
5. Identify conflicts with this master specification.
6. Produce a short implementation plan.
7. Implement in phases.
8. Run typecheck/lint/tests after each meaningful phase.
9. Fix regressions before proceeding.
10. Verify actual UI routes, not only source code.

Do not claim completion based only on compilation.

---

## Definition of Done

A phase is complete only when:

- UI exists
- backend logic exists
- authorization exists
- validation exists
- persistence works
- error states exist
- loading states exist
- empty states exist
- mobile behavior is tested where applicable
- accessibility basics are handled
- no obvious placeholder content remains
- existing functionality has not regressed

For CV specifically:
- A4 preview verified
- Letter preview verified
- PDF export verified
- multi-page verified
- preview/PDF parity verified
- mobile viewer verified
- device viewport does not alter document layout

For Admin:
- unauthorized users cannot access admin routes
- unauthorized API calls return proper denial
- role/permission checks are server-side
- critical actions are audited

---

## Recommended implementation phases

### Phase 0 — Audit
Inspect existing app, schema, auth, UI, routes, storage, billing, and current PRD implementation.

### Phase 1 — Foundation
Auth hardening, Turnstile, sessions, RBAC, i18n architecture, core data model.

### Phase 2 — Identity & Showcase
Profile redesign, asset library, showcase/project system, media, visibility.

### Phase 3 — CV
Template engine, template gallery, editor, fixed renderer, A4/Letter, PDF parity.

### Phase 4 — Website
Template system, sections, showcase integration, themes, SEO, publishing.

### Phase 5 — Discovery & Network
Discovery, saved professionals, contact requests.

### Phase 6 — AI & Analytics
AI workflows, usage metering, profile/site analytics.

### Phase 7 — Billing
Free/Pro entitlements, subscription handling, admin manual grants.

### Phase 8 — Admin God Mode
Full admin console, CMS, moderation, AI controls, system controls, audit.

### Phase 9 — Trust & Scale
Identity verification, advanced moderation, full i18n, mobile readiness.

---

## Final instruction

Build PortoTional as a cohesive product, not as a collection of disconnected CRUD screens.

Prioritize:
1. real work evidence
2. visual quality
3. professional credibility
4. reusable canonical data
5. deterministic CV rendering
6. secure authentication
7. scalable permissions
8. polished public websites
9. powerful but auditable administration

When choosing between a quick shortcut and an architecture that preserves these principles, choose the architecture.

Do not introduce unnecessary complexity without a product reason, but do not simplify away requirements that are explicitly marked mandatory.
