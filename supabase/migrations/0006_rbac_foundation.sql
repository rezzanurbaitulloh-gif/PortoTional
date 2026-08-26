-- ============================================================
-- PortoTional migration 0006 — PRD v3 Phase 1: RBAC foundation
-- Roles: USER < SUPPORT < MODERATOR < ADMIN < SUPER_ADMIN
-- is_admin retained for compatibility; role is authoritative.
-- ============================================================

alter table public.profiles
  add column if not exists role text not null default 'USER'
    check (role in ('USER','SUPPORT','MODERATOR','ADMIN','SUPER_ADMIN'));

-- Backfill: existing admins become SUPER_ADMIN
update public.profiles set role = 'SUPER_ADMIN' where is_admin = true;

-- Keep is_admin in sync with role for legacy checks
create or replace function public.sync_is_admin() returns trigger
language plpgsql as $fn$
begin
  new.is_admin := new.role in ('ADMIN','SUPER_ADMIN');
  return new;
end;
$fn$;

drop trigger if exists profiles_sync_is_admin on public.profiles;
create trigger profiles_sync_is_admin
  before insert or update of role on public.profiles
  for each row execute function public.sync_is_admin();

-- §22 audit: capture reason on critical ops
alter table public.audit_logs
  add column if not exists reason text not null default '',
  add column if not exists before_state jsonb,
  add column if not exists after_state jsonb;

-- §16 identity verification statuses (architecture hook, Phase 9 ships UX)
alter table public.profiles
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified','verified','professionally_verified'));

create table if not exists public.verification_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_status text not null check (requested_status in ('verified','professionally_verified')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.verification_records enable row level security;
