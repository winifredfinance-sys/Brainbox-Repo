-- Brainbox Ninja: optional SQL for the global leaderboard.
-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Your existing table and RLS policies stay as they are. Nothing here grants new write access.

-- 1) One row per player for the top 50 (recommended).
--    Each finished round that raises a player's total adds a new row, so the table holds
--    several rows per player. This view keeps only each player's best row.
--    "Player" = one anonymous account + one nickname, so family members sharing a phone
--    under different nicknames are listed separately (same as the old device board).
--    security_invoker = true makes the view obey the RLS policies of public.leaderboard.
--    If you skip this, the game still works: it reads the newest 1,000 top rows and
--    removes duplicates in the browser, which is less accurate once the table grows.
create or replace view public.leaderboard_best
with (security_invoker = true) as
select distinct on (user_id, player_name)
  user_id, player_name, score, created_at
from public.leaderboard
order by user_id, player_name, score desc, created_at asc;

grant select on public.leaderboard_best to anon, authenticated;

-- 2) Basic data checks (recommended). These are enforced by the database, so they apply
--    even to requests that do not come from the game. They do NOT stop invented scores.
--    If this fails, some existing rows break a rule: fix or delete them, then run it again.
alter table public.leaderboard
  add constraint leaderboard_score_nonneg check (score >= 0),
  add constraint leaderboard_name_len check (char_length(btrim(player_name)) between 1 and 20);

-- 3) Faster sorting once the table grows (optional).
create index if not exists leaderboard_score_idx
  on public.leaderboard (score desc, created_at asc);
create index if not exists leaderboard_player_idx
  on public.leaderboard (user_id, player_name, score desc);
