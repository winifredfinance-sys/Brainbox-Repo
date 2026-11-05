-- Brainbox Ninja: start Season 2 of the leaderboard (Nov 2026, new speed scoring).
-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
--
-- Why: answers now score 20 points (instant) down to 5 (at the buzzer) instead of 10-15, so totals from the
-- old scoring cannot be compared with new ones. The updated game clears old round points on each device
-- once (stars, unlocks and best times stay); this clears the matching rows on the global board.
--
-- What it does
--   1. Copies every current leaderboard row into private.leaderboard_season1 (not reachable through the API).
--   2. Empties public.leaderboard. The table, its policies and grants stay exactly as they are.
-- Undo (puts Season 1 back):
--   insert into public.leaderboard select * from private.leaderboard_season1;

create schema if not exists private;

do $$
begin
  if to_regclass('private.leaderboard_season1') is not null then
    raise notice 'Season 1 backup already exists: nothing changed. Check private.leaderboard_season1 before running again.';
    return;
  end if;
  create table private.leaderboard_season1 as table public.leaderboard;
  revoke all on private.leaderboard_season1 from public, anon, authenticated;
  delete from public.leaderboard;
  raise notice 'Season 1 saved (% rows) and the leaderboard is empty.', (select count(*) from private.leaderboard_season1);
end
$$;
