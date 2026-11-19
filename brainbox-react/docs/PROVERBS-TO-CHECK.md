# Proverbs to check before adding

These proverbs were **left out of the game** because we were not sure enough of the exact wording, the
translation or the meaning. Please ask a Nigerian reader who knows the language to check each one. Once checked,
add it to `src/data/proverbs-more.js` (fields `id`, `e`, `t` with one `___`, `a`, `w`, `m`), give it a theme in
`PROVERB_THEME` if its lesson matches another proverb's, and run `npm test`.

The 72 proverbs added in November 2026 are well-known English renderings of widely quoted African proverbs. Three
of them (pv091 lizard, pv092 firewood, pv093 Eneke the bird) come from *Things Fall Apart*.

| Proverb (English) | Language | Meaning we believe it has | What to check |
|---|---|---|---|
| Slowly, slowly does not stop you arriving (“Sannu sannu ba ta hana zuwa”) | Hausa | Patience still gets you there | Spelling and tone of the Hausa |
| However far a stone is thrown, it falls back to the ground (“Komai nisan jifa, ƙasa zai faɗo”) | Hausa | Everyone returns to their roots / limits | Meaning: roots or limits? |
| Let the kite perch and let the eagle perch (“Egbe bere, ugo bere”) | Igbo | Live and let live | Second half: “whichever says no, may its wing break” – keep or leave out for children? |
| Be your brother’s keeper (“Onye aghana nwanne ya”) | Igbo | Do not abandon your kin | Word-for-word meaning |
| When the king’s palace burns, the rebuilt one is more beautiful (“Ilé ọba tó jó, ẹwà ló bù si”) | Yoruba | Setbacks can lead to something better | Tone marks |
| The sun will shine on those who stand before it shines on those who kneel under them | Igbo (Achebe) | People who are already doing well get attention first | Meaning is often explained in different ways |
| An old woman is always uneasy when dry bones are mentioned in a proverb | Igbo (Achebe) | People are uneasy when talk touches their own weakness | Suitable for children? |
| A man who calls his kinsmen to a feast does not do so to save them from starving | Igbo (Achebe) | Gatherings are for fellowship, not need | Meaning |
| The fly that has no one to advise it follows the corpse into the grave | Igbo | People who ignore advice come to harm | Too dark for 4–10 screens? (only used for 11+) |
| Water is no match for a basket (“Ruwa ba sa’an kwando ba ne”) | Hausa | Some tasks cannot be done with the wrong tool | Exact wording and meaning |
| A child who says his mother will not sleep will also not sleep | Yoruba | Causing trouble for others brings trouble to yourself | Exact wording |
| It is the same sun that melts the wax and hardens the clay | Widely quoted | One event affects people differently | Is it African in origin? |

## Older proverbs that also need a check

`CLAUDE.md` already notes that the proverbs and riddles in the first version of the game need checking by a Nigerian
reader. Those are in `src/data/proverbs.js` (pv001–pv054).
