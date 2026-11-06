# Brainbox Ninja

Free, timed puzzle game for Nigerian players aged 4 to 60+, built to give every age a short daily workout for memory and focus. Portfolio project for a senior product manager. Deployed as a static site on Vercel from GitHub (winifredfinance-sys/Brainbox-Repo, branch `main`).

## Stack and rules
- Plain HTML, CSS and JavaScript. No framework, no build step, no npm dependencies. Third-party code is vendored with an exact version (`js/vendor/supabase-2.118.0.js`).
- Free services only. Supabase (free tier) holds the global leaderboard and the anonymous gameplay stats. Everything else (progress, unlocks, stars, seen questions) is in `localStorage`.
- Every `localStorage` access goes through the `ls` helper in `js/content.js` (try/catch). The game must work with storage blocked.
- Must work on phones, tablets and desktops, and when `index.html` is opened directly as a file.
- If Supabase is down, slow, paused, blocked or not configured, the game must play exactly as normal. Network code never blocks gameplay; all calls from `app.js` into tracking are wrapped (`tr()` in app.js).
- Do not make health or medical claims in game copy. Say "exercise your mind", not "prevents dementia".
- Do not change game rules, scoring, levels, timers, adaptive difficulty, colours, animations or content unless asked.

## Privacy and security (children play this game)
- Collect no personal data: no emails, real names, locations or IP addresses. Players never sign in (the leaderboard uses anonymous Supabase sign-in; stats use no sign-in at all).
- Stats identify a browser only by a random UUID (`bn-device-v1`), never linked to the leaderboard's anonymous user id. Events include the nickname (ninja name), as agreed with the owner.
- Only the Supabase PUBLISHABLE key (`sb_publishable_…`) may appear in the repo (`js/config.js`). Never add a `service_role` or `sb_secret_` key anywhere.
- `public.events` (event types: session_start, round_complete, round_abandoned, daily_target_hit; points per round 0–400): anon/authenticated may INSERT (only the gameplay columns, with CHECK constraints). Only admins (`private.admins` email list, non-anonymous session) can SELECT or call `public.admin_stats()`. Nobody can UPDATE/DELETE via the API.
- All database text shown in HTML must go through `esc()`.

## Files
- Cache busting: every script and stylesheet tag in `index.html` and `admin.html` carries `?v=YYYYMMDD` (currently `?v=20261106b`). When a change to `js/` or `css/` is released, set a new value in both files (same value everywhere; add a letter for a second release on the same day, e.g. `20261106b`). `vercel.json` serves `js/` and `css/` with `Cache-Control: public, max-age=0, must-revalidate`, so browsers check for a new file on every load even if the version is not bumped. The vendor file is versioned by its name.
- `index.html` loads `css/style.css`, then `js/content.js`, `js/bank.js`, `js/config.js`, `js/online.js`, `js/track.js`, `js/app.js` (order matters).
- `js/content.js`: helpers (`ls`, `esc`, `rnd`…), question lists, generators `G`, `BANDS`, `CATS`, `TL`, `MULT`, `build()`; avoids repeats via `bn-seen-v1`.
- `js/bank.js`: extra content pushed into the lists above. Also defines Naira Maths (18–59 `money`) from Nov 2026: multi-step generators `nBasket`, `nChange`, `nUnit`, `nVat` (7.5%), `nInterest`, `nSplit`, `nPct`, `nProfitPct`, `nReverse`, `nSuccessive`, `nCompound`, `nInstal`, `nBreakEven`. 60+ Number Puzzles keep the gentle `change`/`discount`.
- `js/config.js`: Supabase project URL and publishable key (`window.BN_SUPABASE`).
- `js/online.js`: `NET`, the global leaderboard (anonymous sign-in, score upload, top 50).
- `js/track.js`: `TRACK`, the anonymous gameplay stats. Plain `fetch` to `/rest/v1/events`, batched, capped queue `bn-q-v1` (200), round-in-progress marker `bn-live-v1`, retries with backoff.
- `js/app.js`: screens, state `S`, scoring, unlocks, adaptive difficulty, leaderboard view. Tracking hooks: `startRound` (roundStart), `answer` (progress, timeout count `S.to`), `finish` (roundEnd), `go` (roundQuit when leaving a live round).
- `admin.html`, `js/admin.js`, `css/admin.css`: admin dashboard (noindex, not linked). Email + password sign-in (`signInWithPassword`) or email link (`signInWithOtp`, `shouldCreateUser:false`), one RPC `admin_stats(p_from, p_to, p_band)`, plain-SVG charts.
- `supabase/leaderboard.sql`, `supabase/schema.sql` (stats; section 2b upgrades an older events table, safe to re-run), `supabase/seed_test.sql` (test data, `is_test = true`), `supabase/season2.sql` (one-off leaderboard reset with backup).
- `tests/`: browser test pages, `ramp-sim.js` (Node difficulty simulation) and `rls-check.ps1`. Excluded from deploys by `.vercelignore`.

## Game rules (keep these unless asked to change them)
- 4 age bands × puzzle types (+ "Mix It Up") × 3 levels × 10 rounds × 10 questions.
- Points per correct answer (Season 2, Nov 2026): 20 if answered at once, falling evenly to 5 at the buzzer (`SPEED`, `ptsFor()` in content.js), × 1 / 1.5 / 2 by level (`MULT`), rounded per answer. Max per round 200 / 300 / 400. Pass a round with 6/10. Stars at 60/80/90%.
- Levels (Nov 2026): Beginner, Medium and Hard are all open from the start for every age band (`levelOpen()` is always true); rounds inside a level open in order (pass Round N to open Round N+1, `roundOpen()`). Clearing all 10 rounds marks the level "Cleared ✓" and suggests the next level.
- Each round starts with a "Get ready" card (`ready` screen; the clock starts on "Start round", `beginRound()`). The timer shows the points still available (`#tpts`).
- Difficulty ramp within a level (`rampPicker()` in content.js): rounds 1–3 easier half of the level's question types, 4–7 all, 8–10 70% harder half; Hard rounds 8–10 also use `BOOST` (bigger numbers). Difficulty scores are `DIFF`. Check with `node tests/ramp-sim.js`.
- Daily challenge: points target per age band per Lagos day (`DAILY` in content.js: kids 150, teens/adults 300, elders 200); target of the most recently played band; streak of consecutive days hit, per nickname, in `bn-daily-v1`. Sends `daily_target_hit` once per day.
- Season 2: on first load the game clears old-scoring round points once (`bn-season` = '2'; keeps stars, unlocks, times) and `bn-sent-v1`. `supabase/season2.sql` backs up and empties the global board.
- Adaptive difficulty: last 3 rounds per player and puzzle type averaging ≥90% swaps 3 questions for the next level up; ≤50% swaps 3 for the level below.
- Progress is per nickname on the device (`bn-profiles-v2`). Leaderboard score = total of best points per round.

## Product success metrics (shown on the dashboard)
3+ rounds in the first session · day-7 return of 20% · Beginner pass rate 60–75% · timeouts under 10% · no age group below 10%.

## Testing
Serve locally (`python -m http.server 8000` or `npx serve .`). Open `tests/track-test.html`, `tests/game-smoke.html?mode=ok|down|blocked`, `tests/admin-preview.html`; use `tests/phone.html?src=…` for a true 375 px width. Headless Chrome works too (`--headless=new --virtual-time-budget=120000 --dump-dom`; results are in the page title). Check the console for lines starting with "Brainbox Ninja:". After running `supabase/schema.sql`, run `tests/rls-check.ps1`.

## Known gaps / next steps
- Leaderboard audit fixes still pending: missing `leaderboard_best` view (run supabase/leaderboard.sql section 1), sign-in on every visit. The nickname-switch total bug is fixed (the leaderboard total now uses the typed nickname's own profile).
- Leaderboard and stats are not cheat-proof: values are computed in the browser.
- Beginner proverb levels still repeat some questions; proverbs and riddles need checking by a Nigerian reader.
- Nicknames are not filtered; children play, so a moderation step is needed before promoting the leaderboard widely.
