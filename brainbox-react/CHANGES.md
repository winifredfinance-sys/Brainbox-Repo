# What changed in behaviour, and why

Everything else works exactly as in the current game. That covers questions, timers, scoring, levels, the leaderboard, stats, sound, the daily challenge, adaptive difficulty, words, colours and animations. See `docs/PARITY.md`.

## Changes (each needed by the brief)

1. **Questions repeat less (brief task 4).**
   - **Remembered per player:** the game now remembers the questions each **nickname** has seen. Before, it was per device, so siblings sharing a phone used up each other's questions.
   - **Lists dealt like a shuffled deck:** proverbs, riddles and logic puzzles are dealt so a question comes back only after every question in that level has been shown. Before, the game drew at random and could give up early.
   - **Maths-style questions:** these come from very large pools, and the game remembers the last 400 per level.
   - **Nothing lost:** the old "already seen" list is copied to the current nickname on the first visit.
   - **Result:** in a test of one player finishing all 10 rounds of every level, repeats fell from 82, spread over 5 pools, to 54. Those 54 are all in the 3 Beginner Proverbs pools, which only hold 82 questions for 100 slots (see `docs/QUESTION-POOLS.md`).
2. **Better contrast (brief task 6).**
   - **Status words:** "New", "3/10" and "Cleared ✓" on the levels screen used light gold, at about 2:1 contrast. They now use a darker gold, at about 6:1.
   - **Stars:** they keep their gold, with a thin darker outline so they stand out.
3. **Bigger tap targets (brief task 6).** The filter tabs on the admin dashboard are now 44 px tall instead of 40 px. Everything else was already 44 px or more, apart from the "How to play" link inside a sentence on the home screen. Links inside a sentence are allowed to be smaller.
4. **Leaderboard fallback (decision 1).**
   - **No Supabase settings in `config.js`:** the board lists the nicknames on this device, as the very first version did. Before, it showed "not switched on yet".
   - **Supabase down:** the usual message and "Try again" now also show this device's scores underneath.
5. **Cache-busting numbers removed.** Each build makes a fresh file, so the `?v=20261106d` numbers are no longer needed. `config.js` is always re-checked.
6. **One file.** The game is a single `index.html` (decision 3), which still opens from a file.

## Choices I made (tell me if you want any different)

- **Your live site is untouched.** The React version is in a new `brainbox-react/` folder and nothing about your live site changes until you switch Vercel's Root Directory (see README).
- **Generated questions stay as formulas.** Maths, money, sequences, counting, patterns and memory questions are made by formulas (`src/engine/generators.js`). They aren't stored as lists, because there are thousands of them. Each one still gets an id (from its text), which is used to avoid repeats. The fixed lists have hand-numbered ids such as `pv001` and `rd001`.
- **The formulas are copied word for word.** A test feeds the old and new code the same random numbers and checks that all 32,250 sample questions come out identical.
- **The admin dashboard code is unchanged.** It is built as a separate page, `admin.html`, and was not rewritten in React.
- **Duplicates kept, as flagged earlier.** 9 riddles appear twice in slightly different wording. Remove them only if you want to.
- **Mismatched ages kept, as flagged.** The page description still says "ages 4 to 90" while the game says "4 to 60+". Tell me which to use.
- **Supabase SQL is still to run.** `supabase/hardening.sql` (from the last change) still needs to be run once in Supabase. The React version uses the same database function, and falls back to the old method until you run it.
