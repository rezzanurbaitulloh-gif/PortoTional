-- ============================================================
-- PortoTional migration 0009 — PRD v3 Phase 5:
-- Saved Professionals (+collections) & Contact Requests
-- ============================================================

create table if not exists public.saved_collections (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now(),
  unique (owner_profile_id, name)
);
alter table public.saved_collections enable row level security;
create policy saved_collections_owner
  on public.saved_collections for all
  using (owner_profile_id = public.current_profile_id())
  with check (owner_profile_id = public.current_profile_id());

create table if not exists public.saved_professionals (
  id uuid primary key default gen_random_uuid(),
  saver_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_profile_id uuid not null references public.profiles(id) on delete cascade,
  collection_id uuid references public.saved_collections(id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (saver_profile_id, target_profile_id)
);
alter table public.saved_professionals enable row level security;
create policy saved_professionals_owner
  on public.saved_professionals for all
  using (saver_profile_id = public.current_profile_id())
  with check (saver_profile_id = public.current_profile_id());

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  to_profile_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '' check (char_length(message) <= 1000),
  intent text not null default 'contact' check (intent in ('contact','collaboration')),
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (from_profile_id <> to_profile_id)
);
create index if not exists contact_requests_to_idx on public.contact_requests (to_profile_id, status);
alter table public.contact_requests enable row level security;
create policy contact_requests_participant_read
  on public.contact_requests for select
  using (
    from_profile_id = public.current_profile_id()
    or to_profile_id = public.current_profile_id()
  );
create policy contact_requests_sender_insert
  on public.contact_requests for insert
  with check (from_profile_id = public.current_profile_id());
create policy contact_requests_recipient_update
  on public.contact_requests for update
  using (to_profile_id = public.current_profile_id())
  with check (to_profile_id = public.current_profile_id());

-- Public RPC: does a viewer already save this professional?
create or replace function public.is_saved_professional(target_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1
    from public.saved_professionals sp
    join public.profiles me on me.id = sp.saver_profile_id
    join public.profiles tgt on tgt.id = sp.target_profile_id
    where me.user_id = auth.uid()
      and lower(tgt.username) = lower(target_username)
  );
$fn$;
grant execute on function public.is_saved_professional(text) to authenticated;
