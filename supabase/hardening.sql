-- Brainbox Ninja: leaderboard hardening (Nov 2026).
-- Run in Supabase: SQL Editor -> New query -> paste this whole file -> Run. Safe to run again.
--
-- Why: the publishable key in the game is public (it has to be), so anyone could insert any score straight
-- into public.leaderboard, for example 166,000,000. The real maximum is 234,000: 26 puzzle types x 10 rounds
-- x (200 + 300 + 400) points.
--
-- What it does
--   1. Moves impossible scores and bad names into private.leaderboard_removed (a backup, not reachable
--      through the API), then deletes them from the board.
--   2. Keeps one entry per player and nickname (the best one); older duplicates go to the same backup.
--   3. Adds checks: score 0-234,000; name 2-20 characters with no HTML or control characters.
--   4. Adds public.submit_score(name, score), the only way to write a score from now on. It
--        - uses the signed-in (anonymous) user's own id, never one sent by the browser,
--        - lets a total grow by at most 400 points per 20 seconds and 25,000 points per Lagos day,
--        - accepts one update every 3 seconds and up to 10 nicknames per account,
--        - refuses accounts on the ban list (private.banned_users).
--      It keeps the score when it is lower than the player's best, so a score can only go up.
--   5. Removes INSERT/UPDATE/DELETE on the table for anon and authenticated users. Reading stays public.
--
-- Ban a player (copy the user_id from the leaderboard table):
--   insert into private.banned_users (user_id, reason) values ('<uuid>', 'cheating') on conflict do nothing;
-- See what was removed:
--   select * from private.leaderboard_removed order by removed_at desc;
--
-- This makes cheating slow and limited, not impossible: scores are still worked out in the player's browser.

create schema if not exists private;
revoke all on schema private from public, anon;

-------------------------------------------------------------------------------
-- 0. Backup table for removed rows, and the ban list
-------------------------------------------------------------------------------
create table if not exists private.leaderboard_removed (
  id          bigint,
  user_id     uuid,
  player_name text,
  score       bigint,
  created_at  timestamptz,
  removed_at  timestamptz not null default now(),
  reason      text not null
);
create table if not exists private.banned_users (
  user_id  uuid primary key,
  reason   text,
  added_at timestamptz not null default now()
);
revoke all on private.leaderboard_removed, private.banned_users from public, anon, authenticated;

-------------------------------------------------------------------------------
-- 1. Remove impossible scores and bad names
-------------------------------------------------------------------------------
update public.leaderboard set player_name = btrim(player_name) where player_name <> btrim(player_name);  -- stray spaces (duplicates are merged in step 2)

with gone as (
  delete from public.leaderboard
  where score is null or score < 0 or score > 234000
     or player_name is null or char_length(btrim(player_name)) not between 2 and 20
     or player_name ~ '[<>&"''\\/[:cntrl:]]'
  returning id, user_id, player_name, score, created_at
)
insert into private.leaderboard_removed (id, user_id, player_name, score, created_at, reason)
select id, user_id, player_name, score, created_at, 'impossible score or bad name' from gone;

-------------------------------------------------------------------------------
-- 2. One entry per player and nickname: keep the best, back up the rest
-------------------------------------------------------------------------------
with ranked as (
  select id, row_number() over (partition by user_id, player_name order by score desc, created_at asc, id asc) as rn
  from public.leaderboard
), gone as (
  delete from public.leaderboard l using ranked r
  where l.id = r.id and r.rn > 1
  returning l.id, l.user_id, l.player_name, l.score, l.created_at
)
insert into private.leaderboard_removed (id, user_id, player_name, score, created_at, reason)
select id, user_id, player_name, score, created_at, 'older duplicate of the same player' from gone;

-------------------------------------------------------------------------------
-- 3. Columns, checks and the one-entry-per-player rule
-------------------------------------------------------------------------------
alter table public.leaderboard add column if not exists updated_at timestamptz not null default now();
alter table public.leaderboard add column if not exists day        date;        -- Lagos day of the last update
alter table public.leaderboard add column if not exists day_start  integer;     -- score at the start of that day

alter table public.leaderboard drop constraint if exists leaderboard_score_nonneg;
alter table public.leaderboard drop constraint if exists leaderboard_name_len;
alter table public.leaderboard drop constraint if exists leaderboard_score_range;
alter table public.leaderboard drop constraint if exists leaderboard_name_ok;
alter table public.leaderboard add constraint leaderboard_score_range check (score between 0 and 234000);
alter table public.leaderboard add constraint leaderboard_name_ok check (
      char_length(player_name) between 2 and 20
  and player_name = btrim(player_name)
  and player_name !~ '[<>&"''\\/[:cntrl:]]');

create unique index if not exists leaderboard_player_uniq on public.leaderboard (user_id, player_name);
create index if not exists leaderboard_score_idx on public.leaderboard (score desc, created_at asc);

-------------------------------------------------------------------------------
-- 4. The only way to write a score
-------------------------------------------------------------------------------
create or replace function public.submit_score(p_name text, p_score integer)
returns integer
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_name  text := btrim(coalesce(p_name, ''));
  v_want  integer := greatest(0, least(coalesce(p_score, 0), 234000));
  v_today date := (now() at time zone 'Africa/Lagos')::date;
  v_row   public.leaderboard%rowtype;
  v_base  integer;
  v_allow bigint;
  v_new   integer;
begin
  if v_uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  if exists (select 1 from private.banned_users b where b.user_id = v_uid) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if char_length(v_name) not between 2 and 20 or v_name ~ '[<>&"''\\/[:cntrl:]]' then
    raise exception 'invalid name' using errcode = '22023';
  end if;

  select * into v_row from public.leaderboard l
  where l.user_id = v_uid and l.player_name = v_name
  for update;

  if not found then
    if (select count(*) from public.leaderboard l where l.user_id = v_uid) >= 10 then
      raise exception 'too many names on this device' using errcode = '22023';
    end if;
    v_new := least(v_want, 4000);            -- a new entry starts at most 10 Hard rounds' worth
    insert into public.leaderboard (user_id, player_name, score, updated_at, day, day_start)
    values (v_uid, v_name, v_new, now(), v_today, 0);
    return v_new;
  end if;

  if v_want <= v_row.score or v_row.updated_at > now() - interval '3 seconds' then
    return v_row.score;                      -- nothing better, or too soon: keep the best
  end if;

  v_base  := case when v_row.day = v_today then coalesce(v_row.day_start, v_row.score) else v_row.score end;
  v_allow := 400 + 400 * floor(extract(epoch from (now() - v_row.updated_at)) / 20)::bigint;
  v_new   := least(v_want::bigint, v_row.score + v_allow, v_base + 25000)::integer;
  if v_new <= v_row.score then
    return v_row.score;
  end if;

  update public.leaderboard
  set score = v_new, updated_at = now(), day = v_today, day_start = v_base
  where id = v_row.id;
  return v_new;
end;
$$;
revoke all on function public.submit_score(text, integer) from public, anon;
grant execute on function public.submit_score(text, integer) to authenticated;

-------------------------------------------------------------------------------
-- 5. Browsers may read the board, never write it directly
-------------------------------------------------------------------------------
revoke insert, update, delete on public.leaderboard from public, anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

create or replace view public.leaderboard_best
with (security_invoker = true) as
select distinct on (user_id, player_name)
  user_id, player_name, score, created_at
from public.leaderboard
order by user_id, player_name, score desc, created_at asc;
grant select on public.leaderboard_best to anon, authenticated;
