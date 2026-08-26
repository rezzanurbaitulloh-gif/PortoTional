-- ============================================================
-- PortoTional migration 0005 — PRD v2 §78 Feature Flags
-- Flags control optional features; they NEVER replace authorization.
-- ============================================================

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default true,
  description text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.feature_flags (key, enabled, description) values
  ('feature_discover', true, 'Public talent discovery page (/discover)'),
  ('feature_ai_job_tailoring', true, 'AI job tailoring action'),
  ('feature_mobile_download', true, 'Show mobile download options on /download'),
  ('feature_new_cv_editor', true, 'Next-gen CV builder experience'),
  ('feature_3d_profile', false, '3D identity enhancements (V3)')
on conflict (key) do nothing;

alter table public.feature_flags enable row level security;

create policy feature_flags_public_read
  on public.feature_flags for select
  using (true);

-- Admin-only write access
create policy feature_flags_admin_write
  on public.feature_flags for update
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin
    )
  );
