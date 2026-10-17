-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- Adds analytics, template edits, home page text and rate limiting. Safe to run again.

create table if not exists public.events (
  id bigint generated always as identity primary key,
  kind text not null,
  path text,
  template_id text,
  visitor text,
  ok boolean,
  created_at timestamptz not null default now()
);
create index if not exists events_created_idx on public.events (created_at desc);
create index if not exists events_kind_idx on public.events (kind, created_at desc);

create table if not exists public.template_overrides (
  template_id text primary key,
  name text,
  description text,
  category text,
  hidden boolean not null default false,
  deleted boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count int not null
);

alter table public.events enable row level security;
alter table public.template_overrides enable row level security;
alter table public.site_settings enable row level security;
alter table public.rate_limits enable row level security;
revoke all on public.events, public.template_overrides, public.site_settings, public.rate_limits from anon, authenticated;
grant select, insert, update, delete on public.events, public.template_overrides, public.site_settings, public.rate_limits to service_role;
grant select, insert, update, delete on public.websites to service_role;

create or replace function public.rate_limit(p_key text, p_max int, p_window int)
returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into rate_limits (key, window_start, count) values (p_key, now(), 1)
  on conflict (key) do update set
    count = case when rate_limits.window_start < now() - make_interval(secs => p_window) then 1 else rate_limits.count + 1 end,
    window_start = case when rate_limits.window_start < now() - make_interval(secs => p_window) then now() else rate_limits.window_start end
  returning count into c;
  if random() < 0.01 then delete from rate_limits where window_start < now() - interval '1 day'; end if;
  return c <= p_max;
end $$;

create or replace function public.analytics_summary(p_days int)
returns jsonb language sql stable security definer set search_path = public as $$
  with r as (select * from events where created_at >= now() - make_interval(days => p_days))
  select jsonb_build_object(
    'views', (select count(*) from r where kind = 'page_view'),
    'visitors', (select count(distinct visitor) from r where kind = 'page_view' and visitor is not null),
    'today_views', (select count(*) from events where kind = 'page_view' and created_at >= date_trunc('day', now())),
    'customize_started', (select count(*) from r where kind = 'customize_start'),
    'generations_ok', (select count(*) from r where kind = 'generate' and ok),
    'generations_failed', (select count(*) from r where kind = 'generate' and not ok),
    'per_day', coalesce((select jsonb_agg(jsonb_build_object('day', d, 'views', v) order by d)
        from (select created_at::date d, count(*) v from r where kind = 'page_view' group by 1) x), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'views', v))
        from (select path, count(*) v from r where kind = 'page_view' group by path order by v desc limit 10) x), '[]'::jsonb),
    'top_templates', coalesce((select jsonb_agg(jsonb_build_object('template', template_id, 'views', v))
        from (select template_id, count(*) v from r where kind = 'template_view' group by template_id order by v desc limit 10) x), '[]'::jsonb),
    'generated_by_template', coalesce((select jsonb_agg(jsonb_build_object('template', template_id, 'count', v))
        from (select template_id, count(*) v from r where kind = 'generate' and ok group by template_id order by v desc limit 10) x), '[]'::jsonb)
  );
$$;

revoke all on function public.rate_limit(text, int, int) from public, anon, authenticated;
revoke all on function public.analytics_summary(int) from public, anon, authenticated;
grant execute on function public.rate_limit(text, int, int) to service_role;
grant execute on function public.analytics_summary(int) to service_role;

create or replace function public.usage_summary()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'storage_bytes', coalesce((select sum((metadata->>'size')::bigint) from storage.objects where bucket_id = 'media'), 0),
    'storage_files', (select count(*) from storage.objects where bucket_id = 'media'),
    'db_bytes', pg_database_size(current_database())
  );
$$;
revoke all on function public.usage_summary() from public, anon, authenticated;
grant execute on function public.usage_summary() to service_role;

-- Make the API see the new tables right away.
notify pgrst, 'reload schema';
