-- ============================================================
-- PortoTional migration 0003 — PRD v2 update
-- Notifications v2, reports/moderation, discover search RPC,
-- notification preferences, universal profession fallback.
-- ============================================================

-- §34 notification architecture fields
alter table public.notifications
  add column if not exists action_url text,
  add column if not exists entity_id uuid;

-- §35 notification preferences (in-app channel per category)
alter table public.profiles
  add column if not exists notification_prefs jsonb
  not null default '{"payments": true, "profile": true, "cv": true, "system": true}'::jsonb;

-- §48 report & moderation
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('profile','website')),
  target_username text not null,
  reason text not null check (reason in ('inappropriate_content','impersonation','spam','fake_information','other')),
  details text not null default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  resolution_note text not null default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);

-- §4.2 universal profession fallback
insert into public.professions (slug, name, description)
values ('other-professional', 'Other Professional',
        'Any profession not listed — fully supported across CV and website.')
on conflict (slug) do nothing;

-- ============================================================
-- Search RPC moved to 0004_fix_search_fn.sql
