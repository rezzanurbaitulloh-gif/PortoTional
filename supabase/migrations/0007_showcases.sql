-- ============================================================
-- PortoTional migration 0007 — PRD v3 Phase 2:
-- Showcase (canonical work evidence) + Asset library extension
-- ============================================================

-- §4 Showcase types & content
create table if not exists public.showcases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'project'
    check (type in ('project','activity','achievement','certification','experience','event','design','publication','custom')),
  title text not null,
  short_description text not null default '',
  full_description text not null default '',
  cover_url text,
  gallery jsonb not null default '[]'::jsonb,      -- [{url, caption}]
  video_url text,
  start_date date,
  end_date date,
  role text not null default '',
  organization text not null default '',
  collaborators text[] not null default '{}',
  skills text[] not null default '{}',
  tags text[] not null default '{}',
  category text not null default '',
  github_url text,
  demo_url text,
  links jsonb not null default '[]'::jsonb,        -- [{label, url}]
  results_impact text not null default '',
  case_study jsonb,                                -- {problem, goals, process, solution, features, lessons}
  -- §9 visibility model
  visibility text not null default 'public'
    check (visibility in ('public','unlisted','private')),
  show_on_profile boolean not null default true,
  show_on_website boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists showcases_profile_idx on public.showcases (profile_id, sort_order);
create index if not exists showcases_public_idx on public.showcases (profile_id)
  where visibility = 'public';

create trigger showcases_updated_at before update on public.showcases
  for each row execute function public.set_updated_at();

alter table public.showcases enable row level security;

create policy showcases_owner_all
  on public.showcases for all
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

create policy showcases_public_read
  on public.showcases for select
  using (visibility = 'public');

-- §5 asset capabilities: folder/category + visibility on the library
alter table public.files
  add column if not exists category text not null default 'general',
  add column if not exists visibility text not null default 'private'
    check (visibility in ('public','unlisted','private'));

-- Public RPC: evidence-first profile payload (§6) — safe fields only
create or replace function public.list_public_showcases(target_username text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $fn$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id,
    'type', s.type,
    'title', s.title,
    'shortDescription', s.short_description,
    'coverUrl', s.cover_url,
    'gallery', s.gallery,
    'role', s.role,
    'organization', s.organization,
    'skills', s.skills,
    'tags', s.tags,
    'startDate', s.start_date,
    'endDate', s.end_date,
    'githubUrl', s.github_url,
    'demoUrl', s.demo_url,
    'resultsImpact', s.results_impact,
    'caseStudy', s.case_study,
    'featured', s.featured
  ) order by s.featured desc, s.sort_order), '[]'::jsonb)
  from public.showcases s
  join public.profiles p on p.id = s.profile_id
  where lower(p.username) = lower(target_username)
    and s.visibility = 'public'
    and s.show_on_profile;
$fn$;

grant execute on function public.list_public_showcases(text) to anon, authenticated;
