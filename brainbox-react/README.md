# Brainbox Ninja (React version)

A free, timed puzzle game for Nigerian players of every age, designed to give a short daily workout for memory and focus. No sign-up, no ads, no downloads.

This folder is the same game rebuilt with **React** and **Vite**, so new features are easier to add. Everything that works in the current game still works here (see `docs/PARITY.md`).

---

## What is in the ZIP

| Folder / file | What it is |
|---|---|
| `dist/` | **The finished website, ready to publish.** Upload this folder. You do not need to install anything. |
| `dist/index.html` | The whole game in one file. It also works if you double-click it on your computer. |
| `dist/config.js` | Your Supabase settings (leaderboard and stats). You can edit this in Notepad without rebuilding. |
| `dist/admin.html` | Your private stats dashboard (not linked from the game). |
| `src/` | The source code. You only need this to change the game. |
| `src/config/gameConfig.js` | **All the game rules**: timers, rounds, pass mark, points, daily targets. |
| `src/data/` | **All the questions and word lists**. |
| `docs/` | The parity checklist, the question-pool report and the adaptive difficulty proposal. |

---

## a) Publish the game

### Option 1: Netlify Drop (drag and drop, no tools)
1. Unzip the ZIP file.
2. Go to **app.netlify.com/drop** in your browser.
3. Drag the **`dist`** folder (not the whole project) onto the page.
4. Netlify gives you a web address such as `something-random.netlify.app`. Sign up or log in (free) when Netlify asks, so the site stays online.
5. To choose a nicer name: **Site configuration → Change site name**. To use your own domain: **Domain management**.
6. **To publish an update later:** open your site in Netlify, go to **Deploys**, and drag the new `dist` folder onto the box that says "Drag and drop your site output folder here".

### Option 2: Vercel (where the game is today)
Vercel does not take drag-and-drop uploads, so there are two ways:

**From GitHub (recommended; Vercel then rebuilds by itself every time you merge):**
1. Merge the branch with this folder into `main` on GitHub.
2. In Vercel, open your project → **Settings → Build and Deployment**.
3. Set **Root Directory** to `brainbox-react`. Vercel reads the rest from `brainbox-react/vercel.json` (build command `npm run build`, output folder `dist`).
4. Click **Save**, then **Deployments → Redeploy**.

Changing the Root Directory switches your live site to this React version. To try it safely first, make a second Vercel project from the same GitHub repository with Root Directory `brainbox-react`, check it, then change the main project.

**From your computer** (needs Node, see section b): open a terminal in this folder and run `npx vercel deploy dist --prod`.

### Your Supabase settings
`dist/config.js` holds your Supabase Project URL and **publishable** key (it is safe for this key to be public). Never put the secret or `service_role` key in it. If the file still has the `YOUR-...` placeholders, the game works normally and the leaderboard shows the nicknames on that device only.

---

## b) Run it on your computer (optional)

1. Install **Node.js** (the "LTS" version) from **nodejs.org**. Accept the defaults.
2. Unzip the project. Open the `brainbox-react` folder.
3. Open a terminal in that folder:
   - **Windows:** in File Explorer, click the address bar, type `powershell` and press Enter.
   - **Mac:** right-click the folder → **New Terminal at Folder**.
4. Type these commands one at a time and press Enter after each:

```
npm install
```
(downloads the tools, about 1 minute, only needed once)

```
npm run dev
```
Then open **http://localhost:5173** in your browser. The game reloads by itself when you save a change. Press **Ctrl+C** in the terminal to stop.

```
npm run build
```
Makes a fresh `dist` folder to publish.

```
npm test
```
Checks the questions and rules (no browser needed).

---

## c) Add or edit questions

All questions and word lists are in **`src/data/`**. Open a file in any text editor (Notepad, TextEdit, or VS Code). Every entry has an **id**; give new entries the next unused number.

| File | What is in it | Example entry |
|---|---|---|
| `proverbs.js` | African proverbs | `{"id":"pv055","e":1,"t":"A tree is known by its ___.","a":"fruit","w":["leaves","roots","shade"],"m":"People are judged by what they do."}` |
| `riddles.js` | Riddles | `{"id":"rd067","lv":1,"q":"What has a face but no eyes?","a":"A clock","w":["A coin","A ball","A cup"],"why":"A clock has a face."}` |
| `logic.js` | Logic puzzles | same shape as riddles |
| `words.js` | Nigerian words for Word Games | `["KADUNA","city"]` (capital letters, one word) |
| `lists.js` | Fruit emoji, shopping items, names, prices used by other questions | |
| `names.js` | Words for the Shuffle ninja names | |
| `copy.js` | Shout-outs ("You are brilliant!"), tips and level descriptions | |
| `puzzles.js` | Which kinds of question each puzzle type and level uses | |

Field meanings:
- **Proverbs:** `t` is the proverb with `___` where the missing word goes, `a` is the answer, `w` holds 3 wrong options, and `m` is the meaning. Add `"e":1` if it is easy enough for Beginner.
- **Riddles and logic:** `lv` is the difficulty (1 easy, 2 medium, 3 hard), `q` the question, `a` the answer, `w` 3 wrong options and `why` a short explanation.

Rules of thumb:
- **Wrong options:** make them believable but clearly wrong.
- **Answers:** check the answer is not also in the wrong options.
- **Length:** keep text short, since most players are on phones.
- **Proverbs and riddles:** have a Nigerian reader check them before a wide launch.

Maths, sequences, money, counting, patterns and memory questions are **made fresh each time** by small formulas in `src/engine/generators.js`, so there is no list of them. To make them harder or easier, change the numbers in `src/data/puzzles.js`: for example `["mult",6,12]` means times tables from 6 to 12.

After editing, **rebuild and publish**: run `npm run build` and upload the new `dist` folder. Run `npm test` first; it checks every question pool.

`docs/QUESTION-POOLS.md` lists how many different questions each level can give. **Beginner Proverbs is too small**: add about 10 easy proverbs.

---

## d) Change timers, rounds per level and pass marks

Open **`src/config/gameConfig.js`**. Everything is explained in the file. The main settings:

| Setting | Today | What it does |
|---|---|---|
| `TIMER_SECONDS` | 4–10: 30/30/30 · 11–17: 20/25/30 · 18–59: 25/30/40 · 60+: 40/45/50 | Seconds per question for Beginner/Medium/Hard |
| `ROUNDS_PER_LEVEL` | 10 | Rounds in each level |
| `QUESTIONS_PER_ROUND` | 10 | Questions in each round |
| `PASS_MARK` | 6 | Right answers needed to pass a round |
| `STARS` | 60%, 80%, 90% | Share right for 1, 2 and 3 stars |
| `SPEED` | 20 down to 5 | Points for a right answer, fast to slow |
| `LEVEL_MULTIPLIER` | 1, 1.5, 2 | Points multiplier for Beginner, Medium, Hard |
| `DAILY_TARGET` | 150 / 300 / 300 / 200 | Daily points target per age band |
| `ADAPTIVE` | on, 3 rounds, 90% / 50% | Adaptive difficulty settings |
| `LEVELS_OPEN_FROM_START` | true | Players may choose any level |

Then run `npm run build` and publish the new `dist` folder.

**About the leaderboard:** changing points (`SPEED`, `LEVEL_MULTIPLIER`, `ROUNDS_PER_LEVEL`) changes how high totals can go. The database check in `supabase/hardening.sql` allows totals up to 234,000, so update that number too if you raise points.

---

## For developers

- **Stack:**
  - React 19 and Vite 8.
  - `vite-plugin-singlefile`, so the game is one HTML file that also opens from disk.
  - No other dependencies.
  - The Supabase client is the vendored file `public/vendor/supabase-2.118.0.js`, loaded only when needed.
- **Layout:**
  - `src/config` holds the rules and `src/data` the content.
  - `src/engine` is pure logic with no React: `generators.js` (question makers, copied verbatim from the old game), `questions.js` (round builder, no repeats), `ramp.js` (harder rounds later in a level), `adaptive.js` (one function, `decide()`), `scoring.js` and `daily.js`.
  - `src/services` handles storage and the outside world: `storage.js` (every localStorage call in try/catch), `progress.js`, `leaderboard.js` (`saveScore` / `getTopScores`; swap the adapter to change database), `leaderboardOnline.js`, `track.js` (anonymous stats) and `sound.js`.
  - `src/game/useGame.js` holds the game state and actions. `src/screens` and `src/components` are the UI.
- **Storage keys** are the same as the old game (`bn-profiles-v2` etc.), so players keep their progress.
- **Tests:**
  - `npm test` runs the engine checks.
  - `node tests/generators-parity.mjs ../js` checks that questions are identical to the old game (needs the old `js/` folder).
  - `tests/browser-check.cjs` (66 browser checks) and `tests/parity-old-vs-new.cjs` need Playwright. Instructions are at the top of each file.
- **`scripts/extract-from-v2.mjs`** was used once to move the questions out of the old code. It is not needed again.
