# Adaptive difficulty: proposal for a smarter version (not built)

## What runs today (kept unchanged)
- **The rule:** after each round, the game looks at the player's last **3 rounds** of that puzzle type in that age band.
- **Stepping up:** if they averaged **90% or better**, the next round swaps **3 of its 10 questions** for questions from the level above.
- **Stepping down:** if they averaged **50% or less**, it swaps 3 questions for the level below.
- **What players see:** the "Get ready" card says "Challenge boost" or "Warm-up mix". Pass marks and points don't change.
- **On top of a fixed rise:** rounds 1–3 of a level already use easier question types and rounds 8–10 harder ones.

All of this lives in one function, `decide()` in `src/engine/adaptive.js`, with its numbers in `ADAPTIVE` in `src/config/gameConfig.js`. Any version below means changing only that function and what is recorded after a round. Screens don't change.

## The proposal
1. **Use more than accuracy.** Record, per round: share right, share of time-outs, and average answer time as a share of the timer. The data is already collected during play; only `recordSkill()` needs to save it.
2. **Step gradually and calm down after a change.**
   - Swap 2 questions, then 3, then 4 at most, rather than 3 straight away.
   - After any change, wait 2 rounds before changing again, so players don't bounce up and down.
3. **Different rules per age band:**

| Band | Step up when | Step down when | Notes |
|---|---|---|---|
| 4–10 | 3 rounds at 90%+ **and** few time-outs | 2 rounds at 50% or less, **or** time-outs above 30% (slow reading, not wrong answers) | At most 2 harder questions. Keep the friendly wording. Never mention "easier". |
| 11–17 and 18–59 | 3 rounds at 90%+ **and** answers in under half the time | 3 rounds at 50% or less | As today, plus speed. |
| 60+ | 3 rounds at 90%+ (accuracy only; ignore speed) | 3 rounds at 60% or less | Slower answers are normal. Never step up on speed. Start fresh after 7 days away. |

4. **Start fresh after a long break.** Ignore rounds more than 7 days old for all players, so a returning player isn't surprised.

## Data it needs
- **Saved per nickname + age band + puzzle type, on the device, last 5 rounds:** share right, share of time-outs, average answer time ÷ timer, date, level. No new personal data and nothing sent online.
- **Stats:** the dashboard's existing "Adaptive difficulty" section (rounds boosted or warmed up, and their pass rates) shows whether it helps.

## Edge cases to decide
- **Shared phones:** history is per nickname, so a parent and child on one phone don't affect each other if they use their own names.
- **Mix It Up:** keeps its own history, separate from the single puzzle types.
- **Top and bottom levels:** Hard can't step up and Beginner can't step down. For Beginner, a "warm-up" could instead use only the level's easier question types for the next round.
- **Points fairness:** swapped questions score at the round's level. A warm-up round on Medium therefore earns Medium points for 3 Beginner questions. That's fine today; keep it in mind if competition grows.
- **Daily target and leaderboard:** unaffected.
- **Children's feelings:** labels stay encouraging ("Warm-up mix", "Challenge boost"). No "you failed" wording.

## How to judge it
Run it for 4 weeks and compare with today, using the existing dashboard:
- Beginner pass rate within 60–75%.
- Fewer rounds abandoned after a failed round.
- Time-outs under 10% for 4–10 and 60+.
- Day-7 return holding at 20% or better.
