/* Checks the written questions (Nov 2026): unique ids and texts, exactly one right answer, 3 different wrong options,
   proverbs with one gap, theme tags that exist, and how many questions each Naija Knowledge level has.
   Run: node tests/content-check.mjs */
import {PROVERBS} from '../src/data/proverbs.js';
import {PROVERBS_MORE,PROVERB_THEME} from '../src/data/proverbs-more.js';
import {RIDDLES} from '../src/data/riddles.js';
import {RIDDLES_MORE} from '../src/data/riddles-more.js';
import {LOGIC} from '../src/data/logic.js';
import {LOGIC_MORE} from '../src/data/logic-more.js';
import {WORDQ,WORDS_MORE} from '../src/data/words-more.js';
import {WORDS} from '../src/data/words.js';
import {NAIJA_FACTS,stateQuestions,naijaFor} from '../src/engine/naija.js';
import {STATES} from '../src/data/naija/states.js';
const bad=[],norm=s=>String(s).trim().toLowerCase();
/* the old riddle list already had 8 riddles at two levels; the deck shows each only once, so they are only noted */
const OLD_DUP=new Set(RIDDLES.map(x=>norm(x.q)).filter((t,i,a)=>a.indexOf(t)!==i));
function checkList(name,list,{text='q',ans='a'}={}){
  const ids=new Set(),texts=new Set();
  for(const x of list){
    if(ids.has(x.id))bad.push(`${name}: id ${x.id} used twice`);ids.add(x.id);
    const t=norm(x[text]);if(texts.has(t)&&!OLD_DUP.has(t))bad.push(`${name}: same text twice: ${x[text]}`);texts.add(t);
    if(x.lv!=null&&![1,2,3].includes(x.lv))bad.push(`${name} ${x.id}: level ${x.lv}`);
    if(!x[ans])bad.push(`${name} ${x.id}: no answer`);
    if(!Array.isArray(x.w)||x.w.length!==3)bad.push(`${name} ${x.id}: needs exactly 3 wrong options`);
    const all=[x[ans],...(x.w||[])].map(norm);
    if(new Set(all).size!==all.length)bad.push(`${name} ${x.id}: an option repeats or a wrong option equals the answer`);
    if(!x.why&&!x.m)bad.push(`${name} ${x.id}: no explanation`);
  }
  return ids;
}
const pIds=checkList('proverbs',PROVERBS.concat(PROVERBS_MORE),{text:'t'});
for(const p of PROVERBS.concat(PROVERBS_MORE))if(p.t.split('___').length!==2)bad.push(`proverb ${p.id}: needs exactly one ___`);
const themed=new Set();
for(const [t,ids] of Object.entries(PROVERB_THEME))for(const id of ids.split(' ')){if(!pIds.has(id))bad.push(`theme ${t}: unknown proverb ${id}`);if(themed.has(id))bad.push(`proverb ${id} has two themes`);themed.add(id)}
checkList('riddles',RIDDLES.concat(RIDDLES_MORE));
checkList('logic',LOGIC.concat(LOGIC_MORE));
checkList('word puzzles',WORDQ);
import('../src/data/naija/common.js');
for(const band in NAIJA_FACTS)checkList('naija '+band,[1,2,3].flatMap(l=>naijaFor(band,l)));
const wset=new Set();for(const [w] of WORDS){if(wset.has(w))bad.push('word twice: '+w);wset.add(w);if(!/^[A-Z]+$/.test(w))bad.push('word not A-Z: '+w)}
if(STATES.length!==36)bad.push('expected 36 states, got '+STATES.length);
const counts=Object.keys(NAIJA_FACTS).map(b=>`${b} ${[1,2,3].map(l=>naijaFor(b,l).length).join('/')}`).join(', ');
console.log(`New: ${PROVERBS_MORE.length} proverbs, ${RIDDLES_MORE.length} riddles, ${LOGIC_MORE.length} logic puzzles, ${WORDQ.length} word puzzles, ${WORDS_MORE.length} words, `+
  `${stateQuestions().length} state/town/place questions; Naija Knowledge B/M/H: ${counts}`);
console.log(`Note: ${OLD_DUP.size} riddles from the old list appear at two levels (shown once per player).`);
console.log(bad.length?bad.length+' PROBLEMS\n'+bad.join('\n'):'content OK: every question has one right answer and 3 different wrong options');
if(bad.length)process.exit(1);
