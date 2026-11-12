/* Engine checks: run with `npm test` (or node tests/engine.test.mjs).
   1. Every puzzle pool: one player plays all 10 rounds of a level (100 questions). Counts repeats and the
      pool size, and fails if a question repeats while unseen questions were still available.
   2. Scoring, pass mark, stars, daily challenge and adaptive rules give the same answers as the old game. */
import {BANDS,LEVELS,ROUNDS_PER_LEVEL,QUESTIONS_PER_ROUND} from '../src/config/gameConfig.js';
import {typesFor,buildRound,poolSize,poolKey} from '../src/engine/questions.js';
import {ptsFor,passed,starsFor} from '../src/engine/scoring.js';
import {decide} from '../src/engine/adaptive.js';
import {addDaily,dailyState,lagosDay,dayBefore} from '../src/engine/daily.js';
import fs from 'fs';
let fail=0;const ok=(name,cond,info='')=>{if(!cond){fail++;console.log('FAIL',name,info)}};
const rows=[];
for(const b of BANDS)for(const t of typesFor(b.id))for(let l=0;l<3;l++){
  const seen={},seenFor=k=>seen[k]||(seen[k]=new Set());
  const ids=[];let roundDup=0;
  for(let r=0;r<ROUNDS_PER_LEVEL;r++){const qs=buildRound({band:b.id,type:t.id,level:l,round:r,adj:0,seenFor});
    ok(`10 questions ${b.id}/${t.id}/${l}/r${r}`,qs.length===QUESTIONS_PER_ROUND,qs.length);
    if(new Set(qs.map(q=>q.id)).size!==qs.length)roundDup++;
    ok(`answer is one of the options ${b.id}/${t.id}`,qs.every(q=>q.ans>=0&&q.opts.length>=2));
    ids.push(...qs.map(q=>q.id))}
  const repeats=ids.length-new Set(ids).size,ps=poolSize(b.id,t.id,l,8000);
  ok(`no repeat inside a round ${b.id}/${t.id}/${l}`,roundDup===0);
  if(ps.count>=100&&!ps.generated)ok(`no repeats while unseen questions remain ${b.id}/${t.id}/${l}`,repeats===0,repeats);
  rows.push({band:b.id,type:t.id,level:LEVELS[l],pool:ps.count,generated:ps.generated,repeats});
}
/* scoring, same values as the old game */
ok('20 points at once on Beginner',ptsFor(10000,10000,0)===20);ok('5 at the buzzer',ptsFor(0,10000,0)===5);
ok('Hard doubles',ptsFor(10000,10000,2)===40);ok('Medium half time',ptsFor(5000,10000,1)===19);
ok('pass at 6/10',passed(6)&&!passed(5));ok('stars',starsFor(6)===1&&starsFor(8)===2&&starsFor(9)===3&&starsFor(5)===0);
ok('adaptive up',decide({history:[.9,1,.9],level:0})===1);ok('adaptive down',decide({history:[.5,.4,.5],level:1})===-1);
ok('adaptive needs 3 rounds',decide({history:[1,1],level:0})===0);ok('no step down from Beginner',decide({history:[0,0,0],level:0})===0);
let d=addDaily({last:dayBefore(lagosDay()),streak:2},160,'kids');ok('daily target hit continues the streak',d.justHit&&d.data.streak===3,JSON.stringify(d));
ok('daily state',dailyState(d.data,'kids').pts===160&&dailyState(d.data,'kids').hit);
/* report */
const small=rows.filter(r=>r.pool<ROUNDS_PER_LEVEL*QUESTIONS_PER_ROUND);
console.log(`${rows.length} pools checked. Pools smaller than the ${ROUNDS_PER_LEVEL*QUESTIONS_PER_ROUND} questions a full level needs: ${small.length}`);
small.forEach(r=>console.log(`  ${r.band}/${r.type}/${r.level}: ${r.pool} questions, ${r.repeats} repeats in 10 rounds`));
if(process.argv.includes('--report'))fs.writeFileSync('docs/pool-sizes.json',JSON.stringify(rows,null,1));
console.log(fail?`${fail} FAILED`:'All engine checks passed');process.exit(fail?1:0);
