-- Brainbox Ninja: anonymous gameplay stats + admin dashboard.
-- Run in Supabase: SQL Editor -> New query -> paste this whole file -> Run.
-- Safe to run again: it creates what is missing and replaces the functions and policies.
-- It does not touch public.leaderboard.
--
-- What it sets up
--   public.events          one row per gameplay event (sent by js/track.js)
--   private.admins         email allowlist for the dashboard (not reachable through the API)
--   private.is_admin()     true only for a signed-in, non-anonymous user whose email is on the list
--   public.admin_stats()   every dashboard number in one call, for admins only
--   a nightly job          deletes events older than 13 months (needs pg_cron, free on all plans)
--
-- Who can do what
--   anon / authenticated   INSERT only, and only the gameplay columns. Values are checked below.
--   admins                 SELECT events and call admin_stats()
--   nobody (via the API)   UPDATE, DELETE, read private.admins
--
-- Privacy: no emails, real names, IP addresses or locations are stored. device_id is a random
-- UUID made in the browser. nickname is the ninja name the player typed for the leaderboard.

-------------------------------------------------------------------------------
-- 1. Admin allowlist
-------------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;   -- needed to evaluate the SELECT policy; the API does not expose this schema

create table if not exists private.admins (
  email    text primary key check (email = lower(btrim(email))),
  added_at timestamptz not null default now()
);
revoke all on private.admins from public, anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
     and exists (
       select 1 from private.admins a
       where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
     );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-------------------------------------------------------------------------------
-- 2. Events table
-------------------------------------------------------------------------------
create table if not exists public.events (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),   -- when the server received it
  occurred_at     timestamptz not null,                 -- when it happened on the device (events can be queued offline)
  event_id        uuid not null,                        -- for removing duplicate sends
  device_id       uuid not null,                        -- random, stored in the browser
  session_id      uuid not null,
  event_type      text not null,
  nickname        text,                                 -- ninja name (2-20 characters), null if not chosen yet
  round_id        uuid,
  age_band        text,
  puzzle_type     text,
  level           smallint,                             -- 0 Beginner, 1 Medium, 2 Hard
  round_no        smallint,                             -- 0-9 (shown as 1-10)
  score           smallint,                             -- correct answers
  total_questions smallint,
  answered        smallint,                             -- questions answered (less than total for abandoned rounds)
  points          smallint,                             -- after the level multiplier
  round_ms        integer,                              -- answering time
  passed          boolean,                              -- null for abandoned rounds
  adaptive_adj    smallint,                             -- -1 warm-up mix, 0 normal, 1 challenge boost
  timeouts        smallint,
  app_version     text,
  is_test         boolean not null default false,       -- seed data only; the game cannot set it

  constraint events_type check (event_type in ('session_start', 'round_complete', 'round_abandoned')),
  constraint events_time check (occurred_at > created_at - interval '30 days'
                            and occurred_at < created_at + interval '10 minutes'),
  constraint events_nickname check (nickname is null or (
       char_length(nickname) between 2 and 20
   and nickname = btrim(nickname)
   and nickname !~ '[<>&"''\\/[:cntrl:]]')),
  constraint events_version check (app_version is null or char_length(app_version) <= 20),
  constraint events_band check (age_band is null or age_band in ('kids', 'teens', 'adults', 'elders')),
  constraint events_puzzle check (puzzle_type is null or puzzle_type in (
    'count', 'sums', 'patterns', 'odd', 'skip', 'maths', 'seq', 'words', 'proverbs',
    'riddles', 'money', 'memory', 'numbers', 'mix')),
  constraint events_ranges check (
        (level is null or level between 0 and 2)
    and (round_no is null or round_no between 0 and 9)
    and (total_questions is null or total_questions between 1 and 10)
    and (answered is null or answered between 0 and total_questions)
    and (score is null or score between 0 and answered)
    and (timeouts is null or timeouts between 0 and answered)
    and (points is null or points between 0 and 300)
    and (round_ms is null or round_ms between 0 and 3600000)
    and (adaptive_adj is null or adaptive_adj in (-1, 0, 1))),
  constraint events_shape check (
    (event_type = 'session_start'
      and round_id is null and age_band is null and puzzle_type is null and level is null
      and round_no is null and score is null and total_questions is null and answered is null
      and points is null and round_ms is null and passed is null and adaptive_adj is null
      and timeouts is null)
    or
    (event_type in ('round_complete', 'round_abandoned')
      and round_id is not null and age_band is not null and puzzle_type is not null
      and level is not null and round_no is not null and score is not null
      and total_questions is not null and answered is not null and points is not null
      and round_ms is not null and adaptive_adj is not null and timeouts is not null
      and ((event_type = 'round_complete' and passed is not null and answered = total_questions)
        or (event_type = 'round_abandoned' and passed is null)))
  )
);

create index if not exists events_occurred_idx on public.events (occurred_at);
create index if not exists events_type_occurred_idx on public.events (event_type, occurred_at);
create index if not exists events_device_idx on public.events (device_id, occurred_at);
create index if not exists events_test_idx on public.events (is_test) where is_test;

-------------------------------------------------------------------------------
-- 3. Row Level Security and grants
-------------------------------------------------------------------------------
alter table public.events enable row level security;

revoke all on public.events from public, anon, authenticated;
grant insert (occurred_at, event_id, device_id, session_id, event_type, nickname, round_id,
              age_band, puzzle_type, level, round_no, score, total_questions, answered, points,
              round_ms, passed, adaptive_adj, timeouts, app_version)
  on public.events to anon, authenticated;
grant select on public.events to authenticated;          -- the policy below limits it to admins
grant usage on sequence public.events_id_seq to anon, authenticated;

drop policy if exists events_insert on public.events;
create policy events_insert on public.events
  for insert to anon, authenticated
  with check (is_test = false);

drop policy if exists events_admin_select on public.events;
create policy events_admin_select on public.events
  for select to authenticated
  using ((select private.is_admin()));
-- No UPDATE or DELETE policy: nobody can change or remove rows through the API.

-------------------------------------------------------------------------------
-- 4. Dashboard numbers (admins only). Days are counted in Lagos time (UTC+1).
--    p_from / p_to: time range (null = all time). p_band: 'kids' | 'teens' | 'adults' | 'elders' | null.
-------------------------------------------------------------------------------
create or replace function public.admin_stats(
  p_from timestamptz default null,
  p_to   timestamptz default null,
  p_band text default null
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_from  timestamptz := coalesce(p_from, '-infinity'::timestamptz);
  v_to    timestamptz := coalesce(p_to, 'infinity'::timestamptz);
  v_today date := (now() at time zone 'Africa/Lagos')::date;
  v_out   jsonb;
begin
  if not private.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_band is not null and p_band not in ('kids', 'teens', 'adults', 'elders') then
    raise exception 'unknown age band' using errcode = '22023';
  end if;

  with
  ev as (          -- every event once (a retried send can arrive twice)
    select distinct on (e.event_id) e.*, (e.occurred_at at time zone 'Africa/Lagos')::date as day
    from public.events e
    order by e.event_id, e.id
  ),
  rnd_all as (     -- one row per round: a finished round wins over an "abandoned" report of the same round
    select distinct on (round_id) *
    from ev where event_type <> 'session_start'
    order by round_id, (event_type = 'round_complete') desc, occurred_at desc
  ),
  rnd as (         -- rounds in the chosen range and age band
    select * from rnd_all
    where occurred_at >= v_from and occurred_at < v_to
      and (p_band is null or age_band = p_band)
  ),
  done as (select * from rnd where event_type = 'round_complete'),
  band_devs as (   -- players (devices with at least one round) in the chosen age band
    select distinct device_id from rnd_all where p_band is null or age_band = p_band
  ),
  dev_first as (   -- first time each device was seen (any event)
    select device_id, min(occurred_at) as first_at, min(day) as first_day
    from ev group by device_id
  ),
  dev_days as (select distinct device_id, day from ev),
  sess_rounds as (
    select session_id,
           count(*) filter (where event_type = 'round_complete') as done_n,
           bool_or(p_band is null or age_band = p_band) as in_band
    from rnd_all group by session_id
  ),
  sess as (
    select s.session_id, s.device_id, s.s_at, s.e_at,
           coalesce(r.done_n, 0) as done_n, coalesce(r.in_band, false) as in_band
    from (select session_id, device_id, min(occurred_at) as s_at, max(occurred_at) as e_at
          from ev group by session_id, device_id) s
    left join sess_rounds r using (session_id)
  ),
  first_sess as (
    select distinct on (device_id) device_id, session_id, s_at, done_n
    from sess order by device_id, s_at
  ),
  range_all_bands as (   -- for the age-band section, which always shows every band
    select * from rnd_all where occurred_at >= v_from and occurred_at < v_to
  ),
  day_span as (
    select case when p_from is null
                then coalesce((select min(day) from rnd), v_today)
                else (p_from at time zone 'Africa/Lagos')::date end as d0,
           least(v_today, coalesce((p_to at time zone 'Africa/Lagos')::date, v_today)) as d1
  )
  select jsonb_build_object(
    'overview', (
      select jsonb_build_object(
        'players',          count(distinct r.device_id),
        'new_players',      count(distinct r.device_id) filter (where f.first_at >= v_from),
        'rounds_completed', count(*) filter (where r.event_type = 'round_complete'),
        'rounds_abandoned', count(*) filter (where r.event_type = 'round_abandoned'))
      from rnd r left join dev_first f using (device_id)),
    'sessions', (
      select jsonb_build_object(
        'sessions',    count(*),
        'avg_seconds', round(avg(extract(epoch from (e_at - s_at))))::int)
      from sess
      where in_band and done_n > 0 and s_at >= v_from and s_at < v_to),
    'first_session', (
      select jsonb_build_object(
        'players',     count(*),
        'three_plus',  count(*) filter (where done_n >= 3),
        'median',      percentile_cont(0.5) within group (order by done_n))
      from first_sess fs
      where fs.s_at >= v_from and fs.s_at < v_to
        and fs.device_id in (select device_id from band_devs)),
    'retention', (
      select jsonb_build_object(
        'd1_cohort',   count(*) filter (where f.first_day <= v_today - 1),
        'd1_returned', count(*) filter (where f.first_day <= v_today - 1
                         and exists (select 1 from dev_days d where d.device_id = f.device_id and d.day = f.first_day + 1)),
        'd7_cohort',   count(*) filter (where f.first_day <= v_today - 7),
        'd7_returned', count(*) filter (where f.first_day <= v_today - 7
                         and exists (select 1 from dev_days d where d.device_id = f.device_id and d.day = f.first_day + 7)))
      from dev_first f
      where f.first_at >= v_from and f.first_at < v_to
        and f.device_id in (select device_id from band_devs)),
    'bands', (
      select coalesce(jsonb_agg(jsonb_build_object('band', age_band, 'players', p, 'rounds', n)), '[]'::jsonb)
      from (select age_band, count(distinct device_id) as p,
                   count(*) filter (where event_type = 'round_complete') as n
            from range_all_bands group by age_band) t),
    'bands_total', (
      select jsonb_build_object('players', count(distinct device_id),
                                'rounds', count(*) filter (where event_type = 'round_complete'))
      from range_all_bands),
    'pass', (
      select coalesce(jsonb_agg(jsonb_build_object('band', age_band, 'type', puzzle_type, 'level', level,
                                                   'n', n, 'passed', p)), '[]'::jsonb)
      from (select age_band, puzzle_type, level, count(*) as n, count(*) filter (where passed) as p
            from done group by age_band, puzzle_type, level) t),
    'adaptive', (
      select coalesce(jsonb_agg(jsonb_build_object('adj', adaptive_adj, 'started', s, 'completed', c, 'passed', p)), '[]'::jsonb)
      from (select adaptive_adj, count(*) as s,
                   count(*) filter (where event_type = 'round_complete') as c,
                   count(*) filter (where passed) as p
            from rnd group by adaptive_adj) t),
    'timeouts', (
      select coalesce(jsonb_agg(jsonb_build_object('band', age_band, 'level', level, 'timeouts', t, 'answered', a)), '[]'::jsonb)
      from (select age_band, level, sum(timeouts)::int as t, sum(answered)::int as a
            from rnd group by age_band, level) x),
    'types', (
      select coalesce(jsonb_agg(jsonb_build_object('band', age_band, 'type', puzzle_type, 'rounds', n, 'players', p)), '[]'::jsonb)
      from (select age_band, puzzle_type, count(*) as n, count(distinct device_id) as p
            from rnd group by age_band, puzzle_type) x),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', g.d, 'players', coalesce(a.p, 0), 'rounds', coalesce(a.n, 0))
                                order by g.d), '[]'::jsonb)
      from (select gs::date as d from day_span, generate_series(day_span.d0::timestamp, day_span.d1::timestamp, interval '1 day') gs) g
      left join (select day, count(distinct device_id) as p,
                        count(*) filter (where event_type = 'round_complete') as n
                 from rnd group by day) a on a.day = g.d),
    'meta', jsonb_build_object(
      'events',       (select count(*) from public.events),
      'test_events',  (select count(*) from public.events where is_test),
      'first_event',  (select min(occurred_at) from public.events),
      'db_bytes',     pg_database_size(current_database()),
      'today',        v_today,
      'generated_at', now())
  ) into v_out;

  return v_out;
end;
$$;
revoke all on function public.admin_stats(timestamptz, timestamptz, text) from public, anon;
grant execute on function public.admin_stats(timestamptz, timestamptz, text) to authenticated;

-------------------------------------------------------------------------------
-- 5. Keep the free 500 MB database tidy: delete raw events older than 13 months, nightly.
--    If pg_cron cannot be enabled here, turn it on under Database -> Extensions and run this file again.
-------------------------------------------------------------------------------
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('bn-events-retention', '17 2 * * *',
    $job$delete from public.events where occurred_at < now() - interval '13 months'$job$);
exception when others then
  raise notice 'Nightly clean-up not scheduled (pg_cron unavailable): %', sqlerrm;
end
$$;

-------------------------------------------------------------------------------
-- 6. Add yourself as an admin (edit the email, then run just this line):
--    insert into private.admins (email) values ('you@example.com') on conflict do nothing;
-------------------------------------------------------------------------------
