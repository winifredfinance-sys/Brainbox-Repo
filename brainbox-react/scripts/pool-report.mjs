/* Writes docs/QUESTION-POOLS.md from docs/pool-sizes.json. Run: node tests/engine.test.mjs --report && node scripts/pool-report.mjs */
import fs from 'fs';
import {typesFor} from '../src/engine/questions.js';
import {BANDS} from '../src/config/gameConfig.js';
const rows=JSON.parse(fs.readFileSync('docs/pool-sizes.json','utf8'));
const cell=r=>{const n=r.pool>=1000&&r.generated?'1,000+':r.pool.toLocaleString('en-GB');return (r.pool<100?'**'+n+' ⚠️**':n)+(r.generated?'':' (fixed list)')};
let md=`# Question pools: how many different questions each level can give

A full level is 10 rounds × 10 questions = **100 questions**. The game never repeats a question for a player inside a
level until every question in that level's pool has been shown; then it starts the list again.

- **Fixed list**: written questions, counted exactly (proverbs, riddles, logic, word puzzles, Naija Knowledge).
- **Generated**: made fresh each time (maths, sequences, shapes...); counted by drawing questions, so the real number is at least this.
- Levels that mix both are counted as generated.

Counted with \`node tests/engine.test.mjs --report && node scripts/pool-report.mjs\` on ${new Date().toISOString().slice(0,10)}.

| Age band | Puzzle type | Beginner | Medium | Hard |
|---|---|---|---|---|
`;
for(const b of BANDS)for(const t of typesFor(b.id)){
  const r=['Beginner','Medium','Hard'].map(l=>rows.find(x=>x.band===b.id&&x.type===t.id&&x.level===l));
  if(r.every(Boolean))md+=`| ${b.range} | ${t.name} | ${r.map(cell).join(' | ')} |\n`;
}
const small=rows.filter(r=>r.pool<100);
md+=small.length?`\n⚠️ Pools under 100: ${small.map(r=>r.band+' '+r.type+' '+r.level).join(', ')}.\n`:'\nEvery pool now holds at least 100 questions, so a player can finish a whole level without a repeat.\n';
fs.writeFileSync('docs/QUESTION-POOLS.md',md);console.log(md);
