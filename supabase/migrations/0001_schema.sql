-- PortoTional initial schema (PRD §50-52)
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================
-- PROFESSIONS
-- ============================================================
create table public.professions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.professions enable row level security;
create policy "professions_public_read" on public.professions for select using (true);

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  headline text not null default '',
  summary text not null default '',
  profession_id uuid references public.professions(id) on delete set null,
  photo_url text,
  location text not null default '',
  availability text not null default 'open_to_work'
    check (availability in ('open_to_work','open_to_opportunities','not_available')),
  availability_message text,
  visibility jsonb not null default '{"profile": false, "search_indexing": true, "talent_discovery": false, "location": false}'::jsonb,
  onboarding_completed boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9][a-z0-9_-]{1,38}$')
);
create unique index profiles_username_lower_idx on public.profiles (lower(username));
create index profiles_profession_idx on public.profiles (profession_id);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- CONTENT LIBRARY
-- ============================================================
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization text not null default '',
  title text not null default '',
  description text not null default '',
  start_date date,
  end_date date,
  is_current boolean not null default false,
  location text not null default '',
  sort_order integer not null default 0,
  visibility boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index experiences_profile_idx on public.experiences (profile_id);

create table public.educations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null default '',
  degree text not null default '',
  field text not null default '',
  description text not null default '',
  start_date date,
  end_date date,
  sort_order integer not null default 0,
  visibility boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index educations_profile_idx on public.educations (profile_id);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default '',
  proficiency_label text not null default '',
  sort_order integer not null default 0,
  visibility boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index skills_profile_idx on public.skills (profile_id);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  role text not null default '',
  url text,
  image_url text,
  start_date date,
  end_date date,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  visibility boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index works_profile_idx on public.works (profile_id);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  issuer text not null default '',
  date date,
  description text not null default '',
  evidence_id uuid,
  sort_order integer not null default 0,
  visibility boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index achievements_profile_idx on public.achievements (profile_id);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  issuer text not null default '',
  credential_id text not null default '',
  credential_url text,
  issue_date date,
  expiry_date date,
  evidence_id uuid,
  sort_order integer not null default 0,
  visibility boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index certifications_profile_idx on public.certifications (profile_id);

create table public.languages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  language text not null,
  proficiency text not null default 'professional_working'
    check (proficiency in ('native','fluent','professional_working','limited_working','basic')),
  sort_order integer not null default 0,
  visibility boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index languages_profile_idx on public.languages (profile_id);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  visibility boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index social_links_profile_idx on public.social_links (profile_id);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null default '',
  size bigint not null default 0,
  purpose text not null default 'general',
  created_at timestamptz not null default now()
);
create index files_profile_idx on public.files (profile_id);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'url' check (type in ('certificate','image','document','url','project')),
  file_id uuid references public.files(id) on delete set null,
  url text,
  verification_status text not null default 'self_reported'
    check (verification_status in ('self_reported','evidence_attached','verified')),
  created_at timestamptz not null default now()
);
create index evidence_profile_idx on public.evidence (profile_id);

-- ============================================================
-- TEMPLATES / CV SYSTEM
-- ============================================================
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('cv','website')),
  name text not null,
  slug text not null unique,
  description text not null default '',
  configuration jsonb not null default '{}'::jsonb,
  is_premium boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.templates enable row level security;
create policy "templates_active_read" on public.templates for select using (is_active = true);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Untitled CV',
  target_role text not null default '',
  target_company text not null default '',
  target_job_description text not null default '',
  language text not null default 'en',
  page_size text not null default 'A4' check (page_size in ('A4','F4')),
  template_id uuid references public.templates(id) on delete set null,
  status text not null default 'draft',
  settings jsonb not null default '{"accentColor":"#D4AF37","showPhoto":true,"fontScale":1}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resumes_profile_idx on public.resumes (profile_id);
create trigger resumes_updated_at before update on public.resumes
  for each row execute function public.set_updated_at();

create table public.resume_sections (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  section_type text not null,
  source_reference jsonb not null default '[]'::jsonb,
  custom_content jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true
);
create index resume_sections_resume_idx on public.resume_sections (resume_id);

create table public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  snapshot jsonb not null,
  version_number integer not null,
  label text not null default '',
  created_at timestamptz not null default now()
);
create index resume_versions_resume_idx on public.resume_versions (resume_id, version_number desc);

-- ============================================================
-- WEBSITE ENGINE
-- ============================================================
create table public.websites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  subdomain text not null unique,
  custom_domain text unique,
  template_id uuid references public.templates(id) on delete set null,
  published boolean not null default false,
  configuration jsonb not null default '{"theme":"editorial-minimal","typography":"modern","color":"#D4AF37","layout":"stacked","animations":true,"threeD":false}'::jsonb,
  seo_configuration jsonb not null default '{"title":"","description":"","ogImage":"","index":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index websites_subdomain_idx on public.websites (subdomain);
create trigger websites_updated_at before update on public.websites
  for each row execute function public.set_updated_at();

create table public.website_sections (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  section_type text not null,
  content_reference jsonb not null default '{}'::jsonb,
  custom_content jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true
);
create index website_sections_website_idx on public.website_sections (website_id);

-- ============================================================
-- AI
-- ============================================================
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  input_reference jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  provider text not null default '',
  model text not null default '',
  token_usage jsonb not null default '{}'::jsonb,
  accepted boolean,
  created_at timestamptz not null default now()
);
create index ai_generations_user_idx on public.ai_generations (user_id, created_at desc);

-- ============================================================
-- BUSINESS
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  provider text not null default 'none',
  provider_subscription_id text,
  plan text not null default 'free' check (plan in ('free','pro')),
  status text not null default 'active' check (status in ('active','past_due','canceled','expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'midtrans',
  provider_payment_id text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'IDR',
  status text not null default 'pending'
    check (status in ('pending','settlement','capture','deny','cancel','expire','failure','refund')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index payments_user_idx on public.payments (user_id);
create unique index payments_provider_id_idx on public.payments (provider, provider_payment_id);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  value jsonb not null default 'true'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, feature)
);
create index entitlements_user_idx on public.entitlements (user_id);

-- ============================================================
-- PLATFORM
-- ============================================================
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  website_id uuid references public.websites(id) on delete cascade,
  event_type text not null,
  path text not null default '/',
  referrer text not null default '',
  device text not null default '',
  anonymous_session_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index analytics_events_website_idx on public.analytics_events (website_id, created_at desc);
create index analytics_events_type_idx on public.analytics_events (event_type, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null default '',
  entity_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at desc);

-- ============================================================
-- HELPERS
-- ============================================================
create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.is_username_available(candidate text)
returns boolean language sql stable security definer set search_path = public as $$
  select candidate ~ '^[a-z0-9][a-z0-9_-]{1,38}$'
    and not exists (select 1 from public.profiles p where lower(p.username) = lower(candidate))
$$;

create or replace function public.effective_plan(uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select s.plan from public.subscriptions s
     where s.user_id = uid and s.status = 'active'
       and (s.current_period_end is null or s.current_period_end > now())
     order by case s.plan when 'pro' then 0 else 1 end limit 1),
    'free')
$$;

-- updated_at triggers for content tables
do $$ declare t text;
begin
  foreach t in array array['experiences','educations','skills','works','achievements','certifications','languages','social_links'] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ============================================================
-- RLS: user-owned tables (owner-only access)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.educations enable row level security;
alter table public.skills enable row level security;
alter table public.works enable row level security;
alter table public.achievements enable row level security;
alter table public.certifications enable row level security;
alter table public.languages enable row level security;
alter table public.social_links enable row level security;
alter table public.files enable row level security;
alter table public.evidence enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_sections enable row level security;
alter table public.resume_versions enable row level security;
alter table public.websites enable row level security;
alter table public.website_sections enable row level security;
alter table public.ai_generations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.entitlements enable row level security;
alter table public.notifications enable row level security;
alter table public.analytics_events enable row level security;

-- profiles: owner only (public data served via get_public_profile)
create policy "profiles_owner_all" on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- direct profile_id content tables
do $$ declare t text;
begin
  foreach t in array array['experiences','educations','skills','works','achievements','certifications','languages','social_links','files','evidence'] loop
    execute format($f$
      create policy "%1$s_owner_all" on public.%1$I
        for all using (profile_id = public.current_profile_id())
        with check (profile_id = public.current_profile_id());
    $f$, t);
  end loop;
end $$;

-- resumes + nested sections/versions
create policy "resumes_owner_all" on public.resumes
  for all using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
create policy "resume_sections_owner_all" on public.resume_sections
  for all using (exists (
    select 1 from public.resumes r
    where r.id = resume_id and r.profile_id = public.current_profile_id()))
  with check (exists (
    select 1 from public.resumes r
    where r.id = resume_id and r.profile_id = public.current_profile_id()));
create policy "resume_versions_owner_all" on public.resume_versions
  for all using (exists (
    select 1 from public.resumes r
    where r.id = resume_id and r.profile_id = public.current_profile_id()))
  with check (exists (
    select 1 from public.resumes r
    where r.id = resume_id and r.profile_id = public.current_profile_id()));

-- websites + nested sections
create policy "websites_owner_all" on public.websites
  for all using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
create policy "website_sections_owner_all" on public.website_sections
  for all using (exists (
    select 1 from public.websites w
    where w.id = website_id and w.profile_id = public.current_profile_id()))
  with check (exists (
    select 1 from public.websites w
    where w.id = website_id and w.profile_id = public.current_profile_id()));

-- user-scoped tables
create policy "ai_generations_owner_all" on public.ai_generations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "subscriptions_owner_read" on public.subscriptions
  for select using (user_id = auth.uid());
create policy "payments_owner_read" on public.payments
  for select using (user_id = auth.uid());
create policy "entitlements_owner_all" on public.entitlements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_owner_all" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- analytics: anyone may insert events; owners read their website's events
create policy "analytics_public_insert" on public.analytics_events
  for insert to anon, authenticated with check (true);
create policy "analytics_owner_read" on public.analytics_events
  for select using (exists (
    select 1 from public.websites w join public.profiles p on p.id = w.profile_id
    where w.id = website_id and p.user_id = auth.uid()));
create policy "analytics_owner_delete" on public.analytics_events
  for delete using (exists (
    select 1 from public.websites w join public.profiles p on p.id = w.profile_id
    where w.id = website_id and p.user_id = auth.uid()));

-- audit_logs: service role only (no policies = denied for clients)

-- ============================================================
-- PUBLIC PROFILE FUNCTION (controlled public queries)
-- ============================================================
create or replace function public.get_public_profile(target_username text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  p public.profiles%rowtype;
  prof public.professions%rowtype;
  result jsonb;
  is_public boolean;
begin
  select * into p from public.profiles where lower(username) = lower(target_username);
  if not found then return null; end if;
  is_public := coalesce(p.visibility->>'profile', 'false')::boolean;
  if not is_public then return jsonb_build_object('exists', true, 'public', false); end if;

  select * into prof from public.professions where id = p.profession_id;

  result := jsonb_build_object(
    'exists', true,
    'public', true,
    'username', p.username,
    'full_name', p.full_name,
    'headline', p.headline,
    'summary', p.summary,
    'photo_url', p.photo_url,
    'availability', case when p.availability <> 'not_available' then p.availability else null end,
    'availability_message', case when p.availability <> 'not_available' then p.availability_message else null end,
    'profession', prof.name,
    'location', case when coalesce(p.visibility->>'location','false')::boolean then p.location else null end,
    'skills', (
      select coalesce(jsonb_agg(jsonb_build_object('name',s.name,'category',s.category,'proficiency_label',s.proficiency_label) order by s.sort_order), '[]'::jsonb)
      from public.skills s where s.profile_id = p.id and s.visibility),
    'works', (
      select coalesce(jsonb_agg(jsonb_build_object('id',w.id,'title',w.title,'description',w.description,'role',w.role,'url',w.url,'image_url',w.image_url,'tags',w.tags) order by w.sort_order), '[]'::jsonb)
      from public.works w where w.profile_id = p.id and w.visibility),
    'experiences', (
      select coalesce(jsonb_agg(jsonb_build_object('organization',e.organization,'title',e.title,'description',e.description,'start_date',e.start_date,'end_date',e.end_date,'is_current',e.is_current,'location',e.location) order by e.sort_order), '[]'::jsonb)
      from public.experiences e where e.profile_id = p.id and e.visibility),
    'educations', (
      select coalesce(jsonb_agg(jsonb_build_object('institution',ed.institution,'degree',ed.degree,'field',ed.field,'start_date',ed.start_date,'end_date',ed.end_date) order by ed.sort_order), '[]'::jsonb)
      from public.educations ed where ed.profile_id = p.id and ed.visibility),
    'certifications', (
      select coalesce(jsonb_agg(jsonb_build_object('name',c.name,'issuer',c.issuer,'credential_url',c.credential_url,'issue_date',c.issue_date) order by c.sort_order), '[]'::jsonb)
      from public.certifications c where c.profile_id = p.id and c.visibility),
    'achievements', (
      select coalesce(jsonb_agg(jsonb_build_object('title',a.title,'issuer',a.issuer,'date',a.date,'description',a.description) order by a.sort_order), '[]'::jsonb)
      from public.achievements a where a.profile_id = p.id and a.visibility),
    'languages', (
      select coalesce(jsonb_agg(jsonb_build_object('language',l.language,'proficiency',l.proficiency) order by l.sort_order), '[]'::jsonb)
      from public.languages l where l.profile_id = p.id and l.visibility),
    'social_links', (
      select coalesce(jsonb_agg(jsonb_build_object('platform',sl.platform,'url',sl.url) order by sl.sort_order), '[]'::jsonb)
      from public.social_links sl where sl.profile_id = p.id and sl.visibility)
  );
  return result;
end $$;

revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

-- published websites lookup for hostname engine
create or replace function public.get_published_website(host_subdomain text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select nullif(
    jsonb_strip_nulls(jsonb_build_object(
      'published', w.published,
      'configuration', case when w.published then w.configuration else null end,
      'seo', case when w.published then w.seo_configuration else null end,
      'username', p.username
    )), 'null'::jsonb)
  from public.websites w
  join public.profiles p on p.id = w.profile_id
  where lower(w.subdomain) = lower(host_subdomain);
$$;

revoke all on function public.get_published_website(text) from public;
grant execute on function public.get_published_website(text) to anon, authenticated;

-- ============================================================
-- TRIGGERS: new user -> skeleton profile + free subscription + welcome notification
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text;
  uname text;
  n integer := 0;
begin
  base := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1), 'user'), '[^a-z0-9_-]', '', 'g'));
  if base is null or length(base) < 3 then
    base := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  elsif length(base) > 30 then
    base := substr(base, 1, 30);
  end if;
  uname := base;
  while exists (select 1 from public.profiles p where lower(p.username) = lower(uname)) loop
    n := n + 1;
    uname := base || n::text;
    exit when n >= 50;
  end loop;

  insert into public.profiles (user_id, username, full_name)
  values (new.id, uname, coalesce(new.raw_user_meta_data->>'full_name', ''));

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  insert into public.notifications (user_id, type, title, body)
  values (new.id, 'welcome', 'Welcome to PortoTional',
          'Complete your Master Professional Identity once, then showcase it everywhere.');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- auto-create website shell after onboarding sets username
create or replace function public.ensure_website_shell()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  tpl uuid;
  sec text;
begin
  if new.onboarding_completed and not old.onboarding_completed then
    insert into public.websites (profile_id, subdomain)
    values (new.id, new.username)
    on conflict (profile_id) do update set subdomain = excluded.subdomain;

    update public.websites w set template_id = tpl.id
    from templates tpl
    where w.profile_id = new.id and tpl.type = 'website' and tpl.slug = 'editorial-minimal';

    foreach sec in array array['hero','about','work','experience','skills','contact'] loop
      insert into public.website_sections (website_id, section_type, sort_order)
      select w.id, sec, array_position(array['hero','about','work','experience','skills','contact'], sec) - 1
      from public.websites w
      where w.profile_id = new.id
        and not exists (
          select 1 from public.website_sections ws
          where ws.website_id = w.id and ws.section_type = sec);
    end loop;

    insert into public.notifications (user_id, type, title, body)
    values ((select user_id from profiles where id = new.id), 'identity',
            'Identity ready', 'Your identity is set up. Generate your first CV or publish your profile.');
  end if;
  return new;
end $$;

create trigger ensure_website_shell_trigger
  after update on public.profiles
  for each row execute function public.ensure_website_shell();

