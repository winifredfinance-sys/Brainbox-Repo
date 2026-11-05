# Brainbox Ninja

A free, timed puzzle game for ages 4 to 90 (kids, teens, adults, elders). Maths, proverbs, riddles, logic, memory, word puzzles and more. Plain HTML, CSS and JavaScript. No build step, no frameworks, no APIs, no database, no sign-up.

## Project files

```
index.html        the page
css/style.css     all styling (responsive: phone, tablet, desktop)
js/content.js     puzzle content and question generators (edit proverbs, riddles, words here)
js/app.js         game logic, screens, scoring, local leaderboard
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

Progress and scores are saved in the browser (`localStorage`). The leaderboard lists every player name used **on that device**, so friends and family can take turns on one phone or laptop. There is no shared online leaderboard, because that needs a server and a database. If you want one later, the simplest free route is a hosted service such as Supabase or Firebase; the only code to change is the leaderboard section near the top of `js/app.js`.

## Adaptive difficulty

The game tracks each player's last 3 rounds per puzzle type. Averaging 90% or better swaps 3 of the next round's 10 questions for ones from the next level up ("Challenge boost"). Averaging 50% or less swaps in 3 easier ones ("Warm-up mix"). Pass marks, points and level unlocks are unchanged. The thresholds are in `adaptAdj()` in `js/app.js`.

## Avoiding repeated questions

The game remembers which questions each player device has already seen (stored as short codes in the browser) and avoids them until a level's pool runs out. To make repeats rarer, add more entries to `js/bank.js`. The Beginner proverb levels have the smallest pool.

## Notes

- Clearing browser data erases saved progress.
- Please have a Nigerian reader check the proverbs and riddles in `js/content.js` before a wide launch.
