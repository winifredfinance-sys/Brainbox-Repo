/* Builds the questions for a round, without repeats.

   Every question has an id: a short hash of its text (same formula as the old game). For each player and each
   level pool (age band + puzzle type + level) the game remembers which ids that player has already seen.

   - Fixed lists (proverbs, riddles, logic puzzles) are dealt like a shuffled deck: only questions the player
     has not seen are picked, and the deck is reshuffled only when every question in it has been shown.
   - Generated questions (maths, sequences, money, memory...) come from very large pools; the game keeps
     drawing until it gets one this player has not seen (remembering the last SEEN_KEEP_GENERATED).
   - A round never contains the same question twice. */
import {G} from './generators.js';
import {pick,shuffle,mc,hq,qid} from './helpers.js';
import {rampPicker,diffOf} from './ramp.js';
import {PROVERBS} from '../data/proverbs.js';
import {RIDDLES} from '../data/riddles.js';
import {LOGIC} from '../data/logic.js';
import {PUZZLES} from '../data/puzzles.js';
import {QUESTIONS_PER_ROUND,ROUNDS_PER_LEVEL,ADAPTIVE,SEEN_KEEP_GENERATED} from '../config/gameConfig.js';

/* puzzle types for a band, plus "Mix It Up" made from all of them */
export const MIX={id:'mix',name:'Mix It Up',glyph:'★',blurb:'A bit of everything from this age range.'};
export const typesFor=band=>PUZZLES[band].concat([{...MIX,levels:[0,1,2].map(l=>PUZZLES[band].flatMap(c=>c.levels[l]))}]);
export const typeOf=(band,type)=>typesFor(band).find(c=>c.id===type);
export const poolKey=(band,type,level)=>band+'_'+type+'_'+level;

/* ---------- fixed lists as decks: each entry = the question's id and how to make it (same text as G makes) ---------- */
const full=p=>'“'+p.t.replace('___',p.a)+'”';
const DECKS={
  riddle:(lo,hi)=>RIDDLES.filter(x=>x.lv>=lo&&x.lv<=hi).map(x=>({key:hq(x.q+'||'),src:x.id,make:()=>mc(x.q,x.a,x.w,{why:x.why})})),
  logic:(lo,hi)=>LOGIC.filter(x=>x.lv>=lo&&x.lv<=hi).map(x=>({key:hq(x.q+'||'),src:x.id,make:()=>mc(x.q,x.a,x.w,{why:x.why})})),
  proverb:lv=>lv===3
    ?PROVERBS.map(x=>({key:hq('What does this proverb teach?|'+full(x)+'|'),src:x.id,make:()=>mc('What does this proverb teach?',x.m,shuffle(PROVERBS.filter(p=>p!==x)).map(p=>p.m),{show:full(x),why:'Proverb: '+x.t.replace('___',x.a)})}))
    :(lv===1?PROVERBS.filter(p=>p.e):PROVERBS).map(x=>({key:hq('Complete the African proverb|“'+x.t+'”|'),src:x.id,make:()=>mc('Complete the African proverb',x.a,x.w,{show:'“'+x.t+'”',why:x.m})})),
  proverbRev:lv=>(lv===1?PROVERBS.filter(p=>p.e):PROVERBS).map(x=>({key:hq('Which proverb has this meaning?|'+x.m+'|'),src:x.id,
    make:()=>mc('Which proverb has this meaning?',full(x),shuffle(PROVERBS.filter(p=>p!==x&&p.m!==x.m)).map(full),{show:x.m,why:'Proverb: '+full(x)})}))
};
const deckOf=sp=>DECKS[sp[0]]?DECKS[sp[0]](...sp.slice(1)):null;
const isGenerated=sp=>!DECKS[sp[0]];

/* seen: a Set of ids this player has seen in this pool (changed in place). Returns n questions. */
function pull(band,type,level,n,round,seen){
  const specs=typeOf(band,type).levels[level],next=rampPicker(specs,level,round),qs=[],inRound=new Set();
  for(let tries=0;qs.length<n&&tries<800;tries++){
    const sp=next(),deck=deckOf(sp);let q;
    if(deck){
      let fresh=deck.filter(d=>!seen.has(d.key)&&!inRound.has(d.key));
      if(!fresh.length){
        /* this list is used up: use another list in the level that still has unseen questions, if any */
        const others=specs.map(deckOf).filter(Boolean).some(dk=>dk.some(d=>!seen.has(d.key)&&!inRound.has(d.key)));
        if(others&&tries<600)continue;
        deck.forEach(d=>seen.delete(d.key));fresh=deck.filter(d=>!inRound.has(d.key));   /* everything shown: start this list again */
      }
      if(!fresh.length)continue;
      const d=pick(fresh);q=d.make();q.id=d.key;q.src=d.src;
    }else{
      const [fn,...a]=sp;q=G[fn](...a);q.id=qid(q);
      if(inRound.has(q.id)||(seen.has(q.id)&&tries<500))continue;   /* generated pools are huge: just draw again */
    }
    q.d=diffOf(sp);inRound.add(q.id);seen.add(q.id);qs.push(q);
  }
  return qs;
}

/* A round: QUESTIONS_PER_ROUND questions for band/type/level and round number (0-9, drives the difficulty ramp).
   adj = +1 / -1 swaps ADAPTIVE.swapQuestions questions for the level above / below (adaptive difficulty).
   seenFor(key) returns the player's Set of seen ids for a pool; trim(key) is called after, to keep storage small. */
export function buildRound({band,type,level,round,adj=0,seenFor}){
  const l2=level+adj,k=(adj&&l2>=0&&l2<=2)?ADAPTIVE.swapQuestions:0;
  const qs=pull(band,type,level,QUESTIONS_PER_ROUND-k,round,seenFor(poolKey(band,type,level)))
    .concat(k?pull(band,type,l2,k,round,seenFor(poolKey(band,type,l2))):[]);
  return k?shuffle(qs):qs;
}
/* which ids to keep: every id of a fixed-list deck, and the newest SEEN_KEEP_GENERATED of the rest */
export function trimSeen(band,type,level,ids){
  const decks=new Set(typeOf(band,type).levels[level].flatMap(sp=>(deckOf(sp)||[]).map(d=>d.key)));
  const fixed=ids.filter(i=>decks.has(i)),gen=ids.filter(i=>!decks.has(i));
  return fixed.concat(gen.slice(-SEEN_KEEP_GENERATED));
}

/* How many different questions a pool can give (for the README report). Fixed lists are counted exactly;
   generated questions are estimated by drawing `draws` of them. */
export function poolSize(band,type,level,draws=20000){
  const specs=typeOf(band,type).levels[level],keys=new Set();let generated=false;
  for(const sp of specs){const deck=deckOf(sp);if(deck)deck.forEach(d=>keys.add(d.key));else generated=true}
  if(generated){
    const gens=specs.filter(isGenerated);
    for(let i=0;i<draws;i++){const [fn,...a]=pick(gens);keys.add(qid(G[fn](...a)))}
  }
  return {count:keys.size,generated,needed:QUESTIONS_PER_ROUND*ROUNDS_PER_LEVEL};
}
