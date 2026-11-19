/* Plays every band, puzzle type and level for one new player (10 rounds each) and checks:
   - no question repeats inside a level until its pool is used up;
   - the average difficulty score (DIFF in src/engine/ramp.js) rises from Beginner to Medium to Hard;
   - rounds 8-10 are on average at least as hard as rounds 1-3 inside each level.
   Run: node tests/difficulty-check.mjs */
import {buildRound,typesFor} from '../src/engine/questions.js';
import {BANDS} from '../src/config/gameConfig.js';
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length,f=x=>x.toFixed(2);
const bad=[],rows=[];
for(const {id:band} of BANDS)for(const t of typesFor(band)){
  const lv=[];
  for(let level=0;level<3;level++){
    const seen=new Set(),ids=new Set(),early=[],late=[],all=[];let rep=0;
    for(let round=0;round<10;round++){
      const qs=buildRound({band,type:t.id,level,round,seenFor:()=>seen});
      for(const q of qs){if(ids.has(q.id))rep++;ids.add(q.id);all.push(q.d);(round<3?early:round>=7?late:[]).push(q.d)}
    }
    if(rep)bad.push(`${band}/${t.id}/${level}: ${rep} repeats in a level`);
    if(avg(late)+0.01<avg(early))bad.push(`${band}/${t.id}/${level}: rounds 8-10 easier than rounds 1-3`);
    lv.push(avg(all));
  }
  if(!(lv[0]<=lv[1]&&lv[1]<=lv[2]))bad.push(`${band}/${t.id}: difficulty does not rise B→M→H (${lv.map(f).join(' / ')})`);
  rows.push(`${band.padEnd(6)} ${t.id.padEnd(9)} ${lv.map(f).join('  ')}`);
}
console.log('Average difficulty  Beginner  Medium  Hard\n'+rows.join('\n'));
console.log(bad.length?bad.length+' PROBLEMS\n'+bad.join('\n'):'difficulty rises B→M→H for every type; no repeats inside any level');
if(bad.length)process.exit(1);
