/* Checks that every question maker the old game also has produces exactly the same questions as the old game.
   Run: node tests/generators-parity.mjs ../js   (needs the old js/ folder). Same random numbers in, same questions out.
   Since Nov 2026 the React levels also use new makers and more content (moreGenerators.js, new data files); those
   are skipped here and checked by npm test and tests/content-check.mjs. The old game's word list is given the
   new words first, so Unscramble and Missing letter can still be compared. */
import fs from 'fs';import vm from 'vm';import path from 'path';
import {G} from '../src/engine/generators.js';
import {PUZZLES} from '../src/data/puzzles.js';
import {WORDS_MORE} from '../src/data/words-more.js';
const OLD=path.resolve(process.argv[2]||'../js');
const seeded=s=>()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
const oldMath=Object.create(Math);
const ctx={console,Math:oldMath,Date,JSON,Set,Map,Array,Object,String,Number,localStorage:{getItem:()=>null,setItem(){},removeItem(){}}};
vm.createContext(ctx);for(const f of ['content.js','bank.js'])vm.runInContext(fs.readFileSync(path.join(OLD,f),'utf8'),ctx);
vm.runInContext('WORDS.push(...'+JSON.stringify(WORDS_MORE)+')',ctx);
const OG=vm.runInContext('G',ctx);
let skipped=0;
let specs=0,qs=0,bad=[];
const realRandom=Math.random;
for(const b in PUZZLES)PUZZLES[b].forEach((c,ci)=>c.levels.forEach((L,l)=>{
  for(const sp of L){const [fn,...a]=sp;
    if(!OG[fn]||fn==='naija'||fn==='wordQ'){skipped++;continue}   /* new in Nov 2026 */
    specs++;
    const sa=seeded(1000+specs),sb=seeded(1000+specs);oldMath.random=sa;Math.random=sb;
    for(let i=0;i<150;i++){qs++;const o=JSON.stringify(OG[fn](...a)),n=JSON.stringify(G[fn](...a));if(o!==n){bad.push(`${b}/${c.id}/${l} ${fn}: ${o.slice(0,90)} <> ${n.slice(0,90)}`);break}}
  }}));
Math.random=realRandom;
console.log(`${specs} question-maker settings, ${qs} questions compared: ${bad.length?bad.length+' DIFFERENCES':'all identical to the old game'} (${skipped} new settings skipped)`);
if(bad.length){console.log(bad.slice(0,10).join('\n'));process.exit(1)}
