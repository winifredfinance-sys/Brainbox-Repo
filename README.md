# Brainbox Ninja

A free, timed puzzle game for ages 4 to 90 (kids, teens, adults, elders). Maths, proverbs, riddles, logic, memory, word puzzles and more. Plain HTML, CSS and JavaScript. No build step, no frameworks, no sign-up. The global leaderboard uses Supabase (free tier) with anonymous sign-in.

## Project files

```
index.html        the page
css/style.css     all styling (responsive: phone, tablet, desktop)
js/content.js     puzzle content and question generators (edit proverbs, riddles, words here)
js/bank.js        extra proverbs, riddles, logic puzzles, words and generators
js/config.js      your Supabase Project URL and Publishable key (fill these in)
js/online.js      Supabase connection: anonymous sign-in, score upload, top 50
js/vendor/        the official Supabase JavaScript client (supabase-js 2.118.0), loaded on demand
js/app.js         game logic, screens, scoring, leaderboard screen
supabase/leaderboard.sql   optional SQL: one-row-per-player view, data checks, indexes
favicon.svg       site icon
vercel.json       optional Vercel settings (headers)
```

## Run it on your computer

Just double-click `index.html`. Or serve the folder:

```
npx serve .
```

## Deploy to Vercel (free, static)

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
- Each correct answer earns 10 points plus up to 5 speed bonus points. Medium levels score ×1.5, Hard ×2.
- Score 6/10 or better to pass a round and open the next. Pass all 10 rounds to unlock the next level.
- Stars: 1 star at 60%, 2 at 80%, 3 at 90%.

## The leaderboard

Progress, stars and unlocks are saved in the browser (`localStorage`), one profile per nickname. A player's leaderboard score is their **total**: their best points in every round they have played, added up.

The leaderboard is global and stored in Supabase (`public.leaderboard`):

- Every visitor is signed in anonymously (no email or phone). The session is kept in the browser, so the same player keeps the same account on that browser.
- When a round of 10 questions finishes, the new total is sent once, only if it went up. Rounds left halfway are never sent. If the player is offline or Supabase is unreachable, the total is sent later (next round, next visit, or when the connection comes back).
- The board shows the top 50, plus the player's own best and position if they are outside it. Each nickname on an account is listed separately, so family members sharing a phone still appear under their own names.
- If `js/config.js` still has the placeholders, the game works normally and the board says it is not switched on.

**Set it up:** paste your Project URL and Publishable key into `js/config.js`, then run `supabase/leaderboard.sql` in the Supabase SQL Editor (recommended, not required).

**Scores are not cheat-proof.** Scores are worked out in the player's browser, so a determined person can send any number with their own anonymous session. The SQL checks block negative scores and long names only. A competitive leaderboard would need the server to set the questions and mark the answers (for example a Supabase Edge Function), so it never trusts a score from the browser.

## Adaptive difficulty

The game tracks each player's last 3 rounds per puzzle type. Averaging 90% or better swaps 3 of the next round's 10 questions for ones from the next level up ("Challenge boost"). Averaging 50% or less swaps in 3 easier ones ("Warm-up mix"). Pass marks, points and level unlocks are unchanged. The thresholds are in `adaptAdj()` in `js/app.js`.

## Avoiding repeated questions

The game remembers which questions each player device has already seen (stored as short codes in the browser) and avoids them until a level's pool runs out. To make repeats rarer, add more entries to `js/bank.js`. The Beginner proverb levels have the smallest pool.

## Notes

- Clearing browser data erases saved progress.
- Please have a Nigerian reader check the proverbs and riddles in `js/content.js` before a wide launch.
