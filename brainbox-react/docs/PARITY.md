# Parity checklist: old game vs React version

Checked on 12 Nov 2026 against the built `dist/` folder.

**How it was checked:**
- **Text:** "same text" means the screen was opened in the old game and in the React version with the same saved data, and the visible text was identical (`tests/parity-old-vs-new.cjs`).
- **Behaviour:** functional items were checked in a real browser (Chromium) at 320, 375 and 1280 px wide, with a fake Supabase (`tests/browser-check.cjs`, 66 checks).
- **Rules and questions:** checked with `npm test`, plus `tests/generators-parity.mjs`, which compares 32,250 questions with the old code using the same random numbers.

**Result: every item passes.** Items marked *changed* differ on purpose (see `CHANGES.md`).

## Screens
| # | Item | Result |
|---|---|---|
| S1 | Welcome: mascot, title, "Welcome back, NAME", feature chips, Start Game, How to play, leaderboard link, privacy line | ✅ same text (new and returning player); pixel-identical |
| S1c | Returning player: "Welcome back, NAME!", Continue, "Not you? Switch player"; Who is playing? (one tap per profile, Add new player); privacy note under the name box; 30-minute timeout drops only the round | ✅ same text as the live game; 19 scenario checks (`tests/players-check.cjs`) |
| S2 | How to play: 4 steps and scoring rules; Back returns to the previous screen | ✅ same text |
| S3 | Home: name box (20 max), Shuffle (Adjective+Noun+3–4 digits), taken-name note, empty name blocked, Sound/Vibration switches, Daily card, 4 age bands with points, top-3 preview, footer | ✅ same text; pixel-identical; behaviour checks pass |
| S4 | Puzzle types for all 4 bands (26 types incl. Mix It Up), "n of 30 rounds passed" | ✅ same text for every band |
| S5 | Levels: all 3 open, trade-off line, "Start here", New / n/10 / Cleared ✓, stars | ✅ same text · *changed:* darker status colour |
| S6 | Rounds: 10 tiles, stars, points, rounds open in order, "Continue with Round N" | ✅ same text · *changed:* star outline |
| S7 | Get ready card: facts, "Answer fast for more points", adaptive chip, mute, Start round | ✅ same text; chip shown after 3 strong rounds |
| S8 | Play: progress bar, timer bar green→amber→red, seconds, points counting down, memory step, A–D answers, ✓/✗, "+N pts in Xs", correct answer + explanation, time-up | ✅ |
| S9 | Results: shout-out, confetti, ring, stars, points/time/accuracy, daily line, adaptive note, next buttons, tip, 3 suggestions, nav row, "sent to leaderboard" | ✅ |
| S10 | Leaderboard: top 50, medals, "(you)", your row outside top 50, chase line, loading/empty/offline/error, Refresh | ✅ same text · *changed:* local fallback (see below) |
| S11 | Admin dashboard page (sign-in, unchanged code) | ✅ loads, no errors |
| S12 | Sound and vibration, switches and mute, saved | ✅ |
| S13 | Shout-outs, tips per puzzle type, suggestions (another type / Mix It Up / another band) | ✅ |

## Rules
| # | Rule | Result |
|---|---|---|
| R1 | 4 bands (Little Minds, Sharp Teens, Adult Brain Gym, Golden Minds); no age typed | ✅ |
| R2 | Puzzle types per band + Mix It Up; level setups identical to the old game | ✅ all 78 level setups compared |
| R3 | 3 levels × 10 rounds × 10 questions; levels open; rounds in order | ✅ |
| R4 | Seconds per question (4–10 30/30/30 · 11–17 20/25/30 · 18–59 25/30/40 · 60+ 40/45/50); clock starts on Start round; memory clock starts after "I have remembered them" | ✅ (time-up checked with a fake clock) |
| R5 | Points 20→5 by speed × 1/1.5/2; pass 6/10; stars 60/80/90% | ✅ |
| R6 | Harder rounds later in a level | ✅ same code; simulation unchanged |
| R7 | Adaptive difficulty (3 rounds, 90% / 50%, 3 questions) | ✅ |
| R8 | Daily target, streak, celebration, stats event | ✅ |
| R9 | No repeats | ✅ *changed (improved)*: per nickname; deck for lists |
| R10 | Season 2 reset (old points cleared once, stars and times kept) | ✅ |
| R11 | Keyboard: A–D / 1–4, Enter for next | ✅ |
| Q | Questions identical to the old game (same random numbers in → same questions out) | ✅ 32,250 compared |

## Saved data, online features, quality
| # | Item | Result |
|---|---|---|
| D1 | Same storage keys; progress saved by the old game shows in the React version | ✅ |
| D2 | Works with storage blocked (private browsing): full round plays | ✅ |
| L1 | Global leaderboard via Supabase; anonymous sign-in **only** when a score is sent; score sent through `submit_score` with the nickname | ✅ |
| L2 | Name check against the online board | ✅ |
| L3 | Supabase down: friendly message, game still plays | ✅ *changed:* also shows this device's scores |
| L4 | No Supabase settings: no network calls | ✅ *changed:* board of nicknames on this device |
| T1 | Anonymous stats: session_start, round_complete (matches the game), daily_target_hit | ✅ |
| A1 | Keyboard only: a whole round from the welcome screen | ✅ |
| A2 | Visible focus (3 px outline) | ✅ |
| A3 | Contrast: main text about 14:1, grey text 6.5:1 or more, status text now ~6:1, stars outlined | ✅ *changed* |
| A4 | Tap targets 44 px or more (except a link inside a sentence) | ✅ *changed:* admin tabs 40→44 px |
| A5 | Reduced motion switches animations off | ✅ |
| A6 | No sideways scrolling at 320 px and 375 px on every screen of every band | ✅ |
| A7 | Text sizes on phones: 4–10 19 px, 11–59 17 px, 60+ 21 px (one size larger on wide screens) | ✅ |
| P1 | Candy Brain on 4–10 screens, Naija Green elsewhere | ✅ |
| F1 | Opens directly from a file | ✅ |
