/* One-off migration script: reads the old vanilla JS game (../js/content.js + ../js/bank.js) and writes the
   question data and puzzle setup as data files with ids, plus the question makers as a module.
   Kept in the project so the move can be checked; not needed to run or build the game. */
import fs from 'fs';import vm from 'vm';import path from 'path';
const OLD=path.resolve(process.argv[2]||'../js'),OUT=path.resolve('src');
const content=fs.readFileSync(OLD+'/content.js','utf8'),bank=fs.readFileSync(OLD+'/bank.js','utf8');
const ctx={console,Math,Date,JSON,Set,Map,Array,Object,String,Number,localStorage:{getItem:()=>null,setItem(){},removeItem(){}}};
vm.createContext(ctx);vm.runInContext(content,ctx);vm.runInContext(bank,ctx);
const get=n=>vm.runInContext(n,ctx);
const js=v=>JSON.stringify(v,null,0).replace(/\],\[/g,'],\n  [').replace(/\},\{/g,'},\n  {');
const pad=(p,i)=>p+String(i+1).padStart(3,'0');
const head=t=>`/* ${t}\n   Generated from the old game by scripts/extract-from-v2.mjs, then edited by hand from here on. */\n`;
const w=(f,s)=>{fs.writeFileSync(path.join(OUT,f),s);console.log('wrote',f,s.length,'bytes')};

w('data/proverbs.js',head('African proverbs. Fields: id, e (1 = easy enough for Beginner), t (text, ___ = missing word), a (answer), w (wrong options), m (meaning).')+
  `export const PROVERBS=${js(get('PROVERBS').map((p,i)=>({id:pad('pv',i),...p})))};\n`);
w('data/riddles.js',head('Riddles. Fields: id, lv (1 easy, 2 medium, 3 hard), q, a (answer), w (wrong options), why.')+
  `export const RIDDLES=${js(get('RIDDLES').map((p,i)=>({id:pad('rd',i),...p})))};\n`);
w('data/logic.js',head('Logic puzzles. Fields: id, lv (1-3), q, a, w, why.')+
  `export const LOGIC=${js(get('LOGIC').map((p,i)=>({id:pad('lg',i),...p})))};\n`);
w('data/words.js',head('Nigerian words for Word Games: [WORD, category]. Single words only (no spaces).')+
  `export const WORDS=${js(get('WORDS'))};\n`);
w('data/lists.js',head('Other lists the question makers draw from.')+
  `/* emoji for counting, adding and patterns (4-10) */\nexport const FR=${js(get('FR'))};\nexport const GROUPS=${js(get('GROUPS'))};\n`+
  `/* shopping list items for Memory */\nexport const POOL=${js(get('POOL'))};\n`+
  `/* names, comparisons and days for the logic puzzles that change every time */\nexport const NAMES=${js(get('NAMES'))};\nexport const QUAL=${js(get('QUAL'))};\nexport const ORD=${js(get('ORD'))};\nexport const DAYS=${js(get('DAYS'))};\n`+
  `/* goods and prices for money questions */\nexport const ITEMS=${js(get('ITEMS'))};\nexport const COSTS=${js(get('COSTS'))};\nexport const GOODS=${js(get('GOODS'))};\n`);
/* puzzle types by age band, each with its three levels (Beginner, Medium, Hard). Each level is a list of
   question makers [name, ...settings]; Mix It Up is built from all of them. */
const CATS=get('CATS'),tree={};
for(const b in CATS)tree[b]=CATS[b].map(c=>({id:c.id,name:c.name,glyph:c.glyph,blurb:c.blurb,levels:c.L.map(l=>l.map(s=>s.slice()))}));
w('data/puzzles.js',head(`Puzzle types for each age band. levels[0] = Beginner, [1] = Medium, [2] = Hard.
   Each level lists the question makers it draws from, as [maker, ...settings]; repeat an entry to make it more
   common. Makers are in src/engine/generators.js (e.g. ['riddle',1,2] = riddles of difficulty 1 to 2).
   "Mix It Up" is added automatically from every type in the band.`)+
  `export const PUZZLES={\n${Object.entries(tree).map(([b,list])=>`  ${b}:[\n${list.map(c=>`    {id:'${c.id}',name:${JSON.stringify(c.name)},glyph:${JSON.stringify(c.glyph)},blurb:${JSON.stringify(c.blurb)},\n     levels:[\n       ${c.levels.map(l=>JSON.stringify(l)).join(',\n       ')}]}`).join(',\n')}\n  ]`).join(',\n')}\n};\n`);

/* question makers: the final versions (bank.js replaced several), copied word for word */
const sl=(s,a,b)=>{const i=s.indexOf(a),j=b?s.indexOf(b,i):s.length;if(i<0||j<0)throw new Error('marker '+a);return s.slice(i,j)};
let gen=sl(content,'const scr=','/* ---------- age ranges');
gen+='\n'+sl(bank,'/* ---------- more variety in the generators','/* ---------- endless logic')
  .replace(/^const ITEMS=.*\n/m,'').replace(/^const COSTS=.*\n/m,'').replace(/^PROV_L\[0\].*\n/m,'');
gen+='\n'+sl(bank,'/* ---------- endless logic','const cat=(b,id)')
  .replace(/^const NAMES=.*\n/m,'').replace(/^const QUAL=.*\n/m,'').replace(/^const ORD=.*\n/m,'').replace(/^const DAYS=.*\n/m,'');
gen+='\n'+sl(bank,'/* ---------- Naira Maths','Object.assign(DIFF').replace(/^const GOODS=.*\n(.*\n)*?(?=const basket)/m,'');
w('engine/generators.js',`/* Brainbox Ninja question makers. Each G.name(...settings) returns one multiple-choice question:
   {q, opts, ans (index of the right option), show (big text), why (explanation), memo (memory list)}.
   Copied from the old game (content.js + bank.js) without changes, so questions are exactly as before.
   The data they use lives in src/data. To add a new kind of question, add G.myMaker=... here and list
   ['myMaker', ...settings] in src/data/puzzles.js. */
import {rnd,pick,shuffle,fmt,near,mc} from './helpers.js';
import {PROVERBS} from '../data/proverbs.js';
import {RIDDLES} from '../data/riddles.js';
import {LOGIC} from '../data/logic.js';
import {WORDS} from '../data/words.js';
import {FR,GROUPS,POOL,NAMES,QUAL,ORD,DAYS,ITEMS,COSTS,GOODS} from '../data/lists.js';

${gen.replace('const G={','export const G={')}`);
console.log('DIFF additions:',bank.match(/Object\.assign\(DIFF,\{[^;]*;/)[0].slice(0,80));
