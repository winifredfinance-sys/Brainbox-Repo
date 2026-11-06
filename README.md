# Brainbox Ninja

A free, timed puzzle game for ages 4 to 90 (kids, teens, adults, elders). Maths, proverbs, riddles, logic, memory, word puzzles and more. Plain HTML, CSS and JavaScript. No build step, no frameworks, no sign-up. The global leaderboard and the anonymous gameplay stats use Supabase (free tier).

## Project files

```
index.html        the page
css/style.css     all styling (responsive: phone, tablet, desktop)
js/content.js     puzzle content and question generators (edit proverbs, riddles, words here)
js/bank.js        extra proverbs, riddles, logic puzzles, words and generators
js/config.js      your Supabase Project URL and Publishable key (fill these in)
js/online.js      Supabase connection: anonymous sign-in, score upload, top 50
js/vendor/        the official Supabase JavaScript client (supabase-js 2.118.0), loaded on demand
js/track.js       anonymous gameplay stats: queues events and sends them to Supabase in the background
js/app.js         game logic, screens, scoring, leaderboard screen
admin.html        admin dashboard (not linked from the game; sign-in by email link, admins only)
js/admin.js       dashboard logic and SVG charts
css/admin.css     dashboard styles (reuses the Naija Green tokens from css/style.css)
supabase/leaderboard.sql   optional SQL: one-row-per-player view, data checks, indexes
supabase/schema.sql        SQL for gameplay stats: events table, Row Level Security, admin list, dashboard function
supabase/seed_test.sql     made-up test players for previewing the dashboard (easy to delete)
tests/            browser test pages and the database rules check (not deployed, see .vercelignore)
favicon.svg       site icon
vercel.json       optional Vercel settings (headers)
CLAUDE.md         working notes and rules for AI coding assistants
```

## Run it on your computer

Just double-click `index.html`. Or serve the folder:

```
npx serve .
```

## Deploy to Vercel (free, static)

**Releasing an update.** Before merging a change to anything in `js/` or `css/`, change the `?v=` value on every `<script>` and stylesheet tag in `index.html` and `admin.html` to today's date (for example `?v=20261106`; add a letter for a second release that day). Use the same value everywhere. Browsers then fetch the new files straight away. Even if you forget, `vercel.json` makes browsers check for newer `js/` and `css/` files on every visit (`Cache-Control: public, max-age=0, must-revalidate`), so nobody keeps an old version for long.


**Option A – Dashboard (easiest, no tools needed)**
1. Put this folder in a GitHub repository (upload the files, keep `index.html` at the top level).
2. Go to vercel.com, sign in, click **Add New → Project**, and import the repository.
3. Leave **Framework Preset** as **Other**. Leave Build Command and Output Directory empty.
4. Click **Deploy**. Your game is live at `https://your-project.vercel.app`.

**Option B – Vercel CLI**
```
npm i -g vercel
cd brainbox-ninja
vercel --prod
```
Accept the defaults when asked.

Optional: add your own domain in the project's **Settings → Domains**.

## Colours

Two palettes, set as CSS variables at the top of `css/style.css`: Naija Green (ages 11 and up, the default) and Candy Brain (ages 4-10, the `html[data-pal="candy"]` block). Change the hex values there to re-theme the game.

## How scoring works

- 10 questions per round, 10 rounds per level, 3 levels (Beginner, Medium, Hard) per puzzle type.
- **Speed scoring (Season 2, Nov 2026).** A correct answer is worth 20 points if you answer at once, falling evenly to 5 points at the buzzer, then × 1 (Beginner), × 1.5 (Medium) or × 2 (Hard), rounded per answer. A round is worth at most 200 / 300 / 400 points. The values are `SPEED` and `MULT` in `js/content.js`.
- The game shows the points still available next to the timer, "+N pts in Xs" after each answer, and a "Get ready" card before each round with the time per question.
- Players choose Beginner, Medium or Hard freely (all open from the start, every age range). Inside a level, score 6/10 or better to pass a round and open the next one. Passing all 10 rounds marks the level cleared.
- Stars: 1 star at 60%, 2 at 80%, 3 at 90%.
- **Season 2 reset.** Points earned under the old scoring (10 + up to 5 bonus) are cleared once on each device; stars, unlocks and best times stay. To clear the global board too, run `supabase/season2.sql` once (it keeps a backup in `private.leaderboard_season1`).

## Rounds get harder within a level

Rounds 1–3 use the easier half of a level's question types, rounds 4–7 mix all of them, and rounds 8–10 draw 70% from the harder half. On Hard, rounds 8–10 also use slightly bigger numbers (times tables, sums, counting, memory lists, word length, money). Each question type's difficulty score is in `DIFF` in `js/content.js`, and the bigger numbers in `BOOST`. Adaptive difficulty still works on top. Levels with only one question type (for example Odd One Out and Memory) only get the bigger numbers on Hard.

`node tests/ramp-sim.js` simulates players on every age band, puzzle type and level and prints the pass rate per round. It is a model, not player data: about 81% at Round 1 and 73% at Round 10 with the default player.

## Naira Maths (18–59)

Multi-step money questions with everyday Lagos amounts. Beginner: market baskets (2 items with quantities), change from ₦5,000–₦50,000 notes, best buy per unit, simple discounts. Medium: 3-item baskets, 7.5% VAT, simple interest, splitting a bill with a tip, percentage price change, profit and loss. Hard: profit as a % of cost, price before a discount, a rise then a fall, 2-year compound interest, instalments after a deposit, break-even sales. Wrong answers are the common slips (dividing by the selling price, adding the % back on, forgetting the deposit). The generators are at the end of `js/bank.js`; 60+ Number Puzzles keep the gentler change and discount questions.

## Daily challenge and streak

Each day (Lagos time) players have a points target for their age range: 4–10: 150, 11–17: 300, 18–59: 300, 60+: 200 (`DAILY` in `js/content.js`). Every finished round's points count, replays included. The target used is the one for the age range played most recently. Progress ("180 / 300 points today") shows on the home and results screens, with a celebration when it is reached. Reaching the target on consecutive days builds a streak; missing a day resets it. Progress and streaks are stored per ninja name on the device (`bn-daily-v1`). Reaching the target sends a `daily_target_hit` stats event, shown in section 9 of the dashboard.

## The leaderboard

Progress, stars and unlocks are saved in the browser (`localStorage`), one profile per nickname. A player's leaderboard score is their **total**: their best points in every round they have played, added up.

The leaderboard is global and stored in Supabase (`public.leaderboard`):

- Every visitor is signed in anonymously (no email or phone). The session is kept in the browser, so the same player keeps the same account on that browser.
- When a round of 10 questions finishes, the new total is sent once, only if it went up. Rounds left halfway are never sent. If the player is offline or Supabase is unreachable, the total is sent later (next round, next visit, or when the connection comes back).
- The board shows the top 50, plus the player's own best and position if they are outside it. Each nickname on an account is listed separately, so family members sharing a phone still appear under their own names.
- If `js/config.js` still has the placeholders, the game works normally and the board says it is not switched on.

**Set it up:** paste your Project URL and Publishable key into `js/config.js`, then run `supabase/leaderboard.sql` in the Supabase SQL Editor (recommended, not required).

**Scores are not cheat-proof.** Scores are worked out in the player's browser, so a determined person can send any number with their own anonymous session. The SQL checks block negative scores and long names only. A competitive leaderboard would need the server to set the questions and mark the answers (for example a Supabase Edge Function), so it never trusts a score from the browser.

## Gameplay stats and the admin dashboard

The game sends anonymous gameplay events to the same Supabase project as the leaderboard (`public.events`), and `admin.html` shows them to signed-in admins.

**Events** (sent by `js/track.js`):

| Event | When |
|---|---|
| `session_start` | the game is opened, or the player comes back after 30+ minutes away |
| `round_complete` | a round of 10 questions is finished (score, points, time, pass, timeouts, adaptive mix) |
| `round_abandoned` | a round is left part-way, or the tab is closed mid-round (reported on the next visit if needed) |

Tracking never blocks the game. Events wait in a queue in the browser (`bn-q-v1`, at most 200) and are sent in the background in batches. If Supabase is down, slow, paused, blocked or not configured, the game plays exactly as before and the queue is retried later (next event, when the connection returns, next visit).

**Privacy (children play this game):**
- No emails, real names, locations or IP addresses are stored. Players never sign in for stats.
- A browser is identified only by a random ID (`bn-device-v1`), not linked to the leaderboard account.
- Events include the player's ninja name (nickname), so stats can be matched to the leaderboard later. The How to play screen asks players to use a nickname, not their real name.
- Raw events are deleted after 13 months by a nightly job.
- Supabase's own request logs briefly record IP addresses (outside our tables; about a day on the free plan).
- The welcome screen says: "We collect anonymous gameplay stats and ninja names to improve the game, never real names or personal details."

**Security:** only the Publishable key is in the browser. Row Level Security lets anyone *insert* events (with checked values) but nobody can read, change or delete them through the API. Only emails in the `private.admins` list, signed in with their password or an email link, can read the stats. Never put a `service_role` or `sb_secret_` key in this repo.

### Set it up (once)

1. **Supabase project.** Use the existing leaderboard project; `js/config.js` already has its URL and Publishable key. (For a new project, pick the **West EU (London)** region, the closest to Nigeria, then paste its Project URL and Publishable key into `js/config.js`.)
2. **Run the SQL.** Supabase dashboard → **SQL Editor** → **New query** → paste all of `supabase/schema.sql` → **Run**. It should finish with "Success. No rows returned". Already ran an older version? Run the whole file again: section 2b upgrades the table for the daily challenge and the new scoring, and nothing is lost.
3. **Add yourself as an admin.** In a new query, run (with your email):
   `insert into private.admins (email) values ('you@example.com') on conflict do nothing;`
4. **Create your admin login.** **Authentication** → **Users** → **Add user** → **Create new user** → enter the same email, type the **password you will sign in with** (use a long one), tick **Auto Confirm User** → **Create user**. If you already created the user and do not know its password, delete that user and add it again; your admin access is tied to the email, so it is kept.
5. **Allow the sign-in link to return to the dashboard.** **Authentication** → **URL Configuration** → **Redirect URLs** → **Add URL**: `https://YOUR-SITE.vercel.app/admin` (and `http://localhost:8000/admin.html` for local testing) → **Save**.
6. **Open the dashboard** at `https://YOUR-SITE.vercel.app/admin` and sign in either way:
   - **Email + password:** type both and click **Sign in**. This also works when `admin.html` is opened as a file.
   - **Email link:** type your email and click **Email me a sign-in link instead**, then open the link on the same device. Supabase's built-in email sends only a few emails per hour, and only to members of your Supabase team, which includes you.

   Either way, only emails in `private.admins` see any numbers. Supabase limits repeated wrong-password attempts.
7. **Optional preview data.** Run `supabase/seed_test.sql` to add about 300 made-up players (nicknames `Test001`…). The dashboard shows a yellow banner while they exist. Delete them with:
   `delete from public.events where is_test;`
8. **Optional check.** `powershell -ExecutionPolicy Bypass -File tests\rls-check.ps1` confirms with the public key that reading is refused and bad values are rejected. It adds one row; remove it with `delete from public.events where app_version = 'rls-check';`

**Free projects pause** after about 7 days with no activity. Players keep it awake, but a quiet week can pause it. While paused, the game still works and events wait in each player's queue. To resume: open supabase.com/dashboard → your project → **Restore project** (takes a few minutes). The dashboard shows a "could not load" message while the project is paused.

### What the dashboard shows

Filters: last 7 days, last 30 days or all time (up to 13 months), and age band. Days are counted in Lagos time.

| Section | Target (from the product doc) |
|---|---|
| 1. Overview: players (unique devices), new players, rounds, rounds per player, average session, first-session rounds | 3+ rounds in the first session |
| 2. Retention: day-1 and day-7 return (played again exactly 1 or 7 days after their first day) | 20% on day 7 |
| 3. Players by age band (share of players and of rounds) | no age group below 10% |
| 4. Pass rate by age band × puzzle type × level, flagged too hard (<50%) or too easy (>90%) | Beginner 60–75% |
| 5. Adaptive difficulty: how often boosts and warm-ups trigger, and their pass rates | none set |
| 6. Timeouts: share of questions where the timer ran out | under 10% |
| 7. Most and least played puzzle types | none set |
| 8. Daily active players and rounds (line charts) | none set |
| 9. Daily challenge: players who hit the daily target, times hit, average and longest streak, players hitting it per day | none set |

### Tests

Serve the folder (`python -m http.server 8000`) and open:
- `tests/track-test.html`: tracking with a fake network: offline, slow, rejected, blocked storage, queue cap, closed tab (about a minute).
- `tests/game-smoke.html?mode=ok|down|blocked`: plays real rounds with the network unreachable or storage blocked. The title shows PASS or FAIL. It clears this site's saved progress (`bn-*` keys) on localhost.
- `tests/admin-preview.html`: the dashboard with made-up numbers (`?data=empty|quiet|login|denied` for the other states; on `login`, the password `correct-horse` signs in).
- `tests/admin-login-test.html`: the sign-in form (password and email link) against a fake Supabase, plus one wrong-password attempt against the real project.
- `tests/phone.html?src=…`: any of these at a true 375 px phone width.

## Adaptive difficulty

The game tracks each player's last 3 rounds per puzzle type. Averaging 90% or better swaps 3 of the next round's 10 questions for ones from the next level up ("Challenge boost"). Averaging 50% or less swaps in 3 easier ones ("Warm-up mix"). Pass marks, points and level unlocks are unchanged. The thresholds are in `adaptAdj()` in `js/app.js`.

## Avoiding repeated questions

The game remembers which questions each player device has already seen (stored as short codes in the browser) and avoids them until a level's pool runs out. To make repeats rarer, add more entries to `js/bank.js`. The Beginner proverb levels have the smallest pool.

## Notes

- Clearing browser data erases saved progress.
- Please have a Nigerian reader check the proverbs and riddles in `js/content.js` before a wide launch.
