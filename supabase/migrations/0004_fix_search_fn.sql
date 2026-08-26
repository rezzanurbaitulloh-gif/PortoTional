drop function if exists public.search_public_profiles(text, text, text, text, integer, integer);

create function public.search_public_profiles(
  q text default null,
  p_location text default null,
  p_skill text default null,
  p_profession text default null,
  page_size integer default 12,
  page_offset integer default 0
)
returns table (
  username text,
  full_name text,
  headline text,
  photo_url text,
  location text,
  profession_name text,
  top_skills text[],
  availability text,
  relevance integer,
  total bigint
)
language sql
stable
security definer
set search_path = public
as $fn$
  select
    pr.username::text,
    pr.full_name::text,
    pr.headline::text,
    pr.photo_url::text,
    case when (pr.visibility->>'location') = 'true' then pr.location::text else null::text end as location,
    pf.name::text as profession_name,
    coalesce(sk.top_skills, ARRAY[]::text[]) as top_skills,
    pr.availability::text,
    (
      (case when pr.photo_url is not null then 2 else 0 end)
      + (case when length(pr.summary) > 40 then 1 else 0 end)
      + (case when length(pr.headline) > 10 then 1 else 0 end)
      + least((select count(*) from public.skills s2 where s2.profile_id = pr.id), 6)::int
      + least((select count(*) from public.experiences e2 where e2.profile_id = pr.id), 4)::int
    )::int as relevance,
    count(*) over ()::bigint as total
  from public.profiles pr
  left join public.professions pf on pf.id = pr.profession_id
  left join lateral (
    select array_agg(x.name order by x.sort_order) as top_skills
    from (
      select s.name, s.sort_order from public.skills s
      where s.profile_id = pr.id and s.visibility = true
      order by s.sort_order limit 3
    ) x
  ) sk on true
  where pr.visibility->>'profile' = 'true'
    and (q is null or q = ''
         or pr.full_name ilike '%' || q || '%'
         or pr.username ilike '%' || q || '%'
         or pr.headline ilike '%' || q || '%'
         or exists (select 1 from public.skills s3 where s3.profile_id = pr.id and s3.name ilike '%' || q || '%'))
    and (p_location is null or p_location = ''
         or ((pr.visibility->>'location') = 'true' and pr.location ilike '%' || p_location || '%'))
    and (p_skill is null or p_skill = ''
         or exists (select 1 from public.skills s4 where s4.profile_id = pr.id and s4.name ilike '%' || p_skill || '%'))
    and (p_profession is null or p_profession = ''
         or pf.slug = p_profession or pf.name ilike '%' || p_profession || '%')
  order by relevance desc, username asc
  limit least(coalesce(page_size, 12), 48)
  offset greatest(coalesce(page_offset, 0), 0);
$fn$;

grant execute on function public.search_public_profiles(text,text,text,text,integer,integer) to anon, authenticated;
