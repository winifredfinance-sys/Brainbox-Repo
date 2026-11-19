# Adding Open Trivia DB questions (optional, not done)

[Open Trivia DB](https://opentdb.com) is a free, community-made bank of multiple-choice questions. It could add
general-knowledge questions for **11–17** and **18–59**. Nothing has been downloaded: only fetch questions once the
owner agrees.

## Licence and attribution

- Licence: **Creative Commons Attribution-ShareAlike 4.0** (CC BY-SA 4.0).
- You must credit it where players can see it. Add this line to the footer or an About section:

  > Some questions are from Open Trivia DB (opentdb.com), used under CC BY-SA 4.0.

- **Share-alike:** the imported questions, and any changes you make to them, must stay under CC BY-SA 4.0. Keep them
  in their own file (for example `src/data/trivia-opentdb.js`) with the licence line at the top, so the rest of the
  game's code and questions are not affected.

## How to do it

1. Download once, by hand, not from the game. The game must never call opentdb.com while someone plays (privacy, and
   it must work offline). Example: `https://opentdb.com/api.php?amount=50&type=multiple&difficulty=easy`
   (`difficulty` = easy, medium or hard; `category` = a number from `https://opentdb.com/api_category.php`;
   at most 50 questions per call and one call every 5 seconds).
2. The text is HTML-encoded (`&quot;`, `&#039;`, `&amp;`). Decode it, then store each question as
   `{id:'ot001', lv:1|2|3, q, a, w:[3 wrong], why:'Source: Open Trivia DB'}` (easy = 1, medium = 2, hard = 3).
3. Read every question before adding it. Many are about American or British TV, sport and history, so most will not
   fit a Nigerian audience. Remove anything unkind, violent, political or out of date, and anything with an answer
   that depends on the year.
4. Add a deck in `src/engine/questions.js` (like `wordQ`) and add `['trivia',lv]` to the 11–17 and 18–59 levels in
   `src/data/puzzles.js`, or make a new puzzle type (then add its id to `TYPES_OK` in `src/services/track.js` and to the
   `events_puzzle` check in `supabase/schema.sql`, and raise the leaderboard cap in `supabase/hardening.sql` by 9,000).
5. Run `npm test`, which checks for one right answer, three different wrong options and unique question texts.
