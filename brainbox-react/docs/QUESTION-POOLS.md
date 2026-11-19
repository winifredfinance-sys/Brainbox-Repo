# Question pools: how many different questions each level can give

A full level is 10 rounds × 10 questions = **100 questions**. The game never repeats a question for a player inside a
level until every question in that level's pool has been shown; then it starts the list again.

- **Fixed list**: written questions, counted exactly (proverbs, riddles, logic, word puzzles, Naija Knowledge).
- **Generated**: made fresh each time (maths, sequences, shapes...); counted by drawing questions, so the real number is at least this.
- Levels that mix both are counted as generated.

Counted with `node tests/engine.test.mjs --report && node scripts/pool-report.mjs` on 2026-11-19.

| Age band | Puzzle type | Beginner | Medium | Hard |
|---|---|---|---|---|
| 4–10 | Count & Compare | 295 | 989 | 1,000+ |
| 4–10 | Add & Take Away | 230 | 910 | 1,000+ |
| 4–10 | Patterns | 1,000+ | 1,000+ | 1,000+ |
| 4–10 | Odd One Out | 1,000+ | 1,000+ | 1,000+ |
| 4–10 | Skip Counting | 126 | 140 | 173 |
| 4–10 | Mix It Up | 1,000+ | 1,000+ | 1,000+ |
| 11–17 | Maths | 1,000+ | 1,000+ | 1,000+ |
| 11–17 | Number Sequences | 240 | 1,000+ | 949 |
| 11–17 | Word Games | 1,000+ | 1,000+ | 1,000+ |
| 11–17 | Proverbs | 156 (fixed list) | 252 (fixed list) | 252 (fixed list) |
| 11–17 | Riddles & Logic | 1,000+ | 1,000+ | 1,000+ |
| 11–17 | Naija Knowledge | 113 (fixed list) | 100 (fixed list) | 151 (fixed list) |
| 11–17 | Mix It Up | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Naira Maths | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Mental Maths | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Number Sequences | 300 | 1,000+ | 915 |
| 18–59 | Word Games | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Proverbs | 156 (fixed list) | 252 (fixed list) | 252 (fixed list) |
| 18–59 | Riddles & Logic | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Memory | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Naija Knowledge | 102 (fixed list) | 102 (fixed list) | 154 (fixed list) |
| 18–59 | Mix It Up | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Memory | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Proverbs | 156 (fixed list) | 252 (fixed list) | 252 (fixed list) |
| 60+ | Riddles | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Word Games | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Number Puzzles | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Naija Knowledge | 105 (fixed list) | 101 (fixed list) | 150 (fixed list) |
| 60+ | Mix It Up | 1,000+ | 1,000+ | 1,000+ |

Every pool now holds at least 100 questions, so a player can finish a whole level without a repeat.
