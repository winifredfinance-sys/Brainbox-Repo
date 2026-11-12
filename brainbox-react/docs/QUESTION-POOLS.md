# Question pools: how many different questions each level can give

A full level is 10 rounds × 10 questions = **100 questions**. Pools smaller than that must repeat some questions before the level is finished; the game repeats only after every question in the pool has been shown to that player.

- **Fixed list**: counted exactly (proverbs, riddles, logic puzzles).
- **Generated**: maths-style questions made fresh each time; counted by drawing 8,000 of them, so the real number is at least this.

Counted with `node tests/engine.test.mjs --report` on 2026-11-12.

| Age band | Puzzle type | Beginner | Medium | Hard |
|---|---|---|---|---|
| 4–10 | Count & Compare | 295 | 984 | 1,000+ |
| 4–10 | Add & Take Away | 230 | 959 | 336 |
| 4–10 | Patterns | 506 | 1,000+ | 1,000+ |
| 4–10 | Odd One Out | 1,000+ | 1,000+ | 1,000+ |
| 4–10 | Skip Counting | 126 | 140 | 173 |
| 4–10 | Mix It Up | 1,000+ | 1,000+ | 1,000+ |
| 11–17 | Maths | 1,000+ | 1,000+ | 1,000+ |
| 11–17 | Number Sequences | 240 | 420 | 103 |
| 11–17 | Word Games | 1,000+ | 1,000+ | 1,000+ |
| 11–17 | Proverbs | **82 (fixed list) ⚠️** | 108 (fixed list) | 108 (fixed list) |
| 11–17 | Riddles & Logic | 1,000+ | 1,000+ | 1,000+ |
| 11–17 | Mix It Up | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Naira Maths | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Mental Maths | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Number Sequences | 300 | 308 | 103 |
| 18–59 | Word Games | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Proverbs | **82 (fixed list) ⚠️** | 108 (fixed list) | 108 (fixed list) |
| 18–59 | Riddles & Logic | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Memory | 1,000+ | 1,000+ | 1,000+ |
| 18–59 | Mix It Up | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Memory | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Proverbs | **82 (fixed list) ⚠️** | 108 (fixed list) | 108 (fixed list) |
| 60+ | Riddles | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Word Games | 1,000+ | 1,000+ | 1,000+ |
| 60+ | Number Puzzles | 1,000+ | 1,000+ | 564 |
| 60+ | Mix It Up | 1,000+ | 1,000+ | 1,000+ |

⚠️ **Too small for 10 rounds:** Proverbs Beginner (11–17, 18–59 and 60+) has 82 questions: 41 easy proverbs, each asked two ways. A player who finishes all 10 Beginner rounds sees 18 repeats. Adding about 10 more easy proverbs to src/data/proverbs.js (with `e:1`) fixes this. Medium/Hard Proverbs (108) and Hard Number Sequences (103) only just cover 100.

The old game repeated questions in 5 pools in the same test (82 repeats in total, including 13–15 in Hard Number Sequences, whose pool is big enough). The React version repeats only in the three Beginner Proverbs pools, where it cannot be avoided.
