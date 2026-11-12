/* Everything saved on this device for each nickname: progress, adaptive history, questions already seen,
   daily challenge. Uses the same storage keys as the old game, so nothing is lost after the update. */
import {store,KEYS} from './storage.js';
import {ROUNDS_PER_LEVEL,ADAPTIVE,NICKNAME_MAX} from '../config/gameConfig.js';
import {trimSeen} from '../engine/questions.js';
import {PLAYERS} from './players.js';
export {PLAYERS};

/* nicknames: letters (any language), digits, space, _ and -; trimmed; at most NICKNAME_MAX characters */
export const cleanNick=s=>String(s||'').replace(/[^\p{L}\p{N} _-]/gu,'').replace(/\s+/g,' ').trim().slice(0,NICKNAME_MAX);

let ALL=store.json(KEYS.profiles,{});
/* Season 2 (Nov 2026): round points from the old scoring were cleared once; stars, unlocks and times stay */
if(store.get(KEYS.season)!=='2'){
  for(const n in ALL){const p=ALL[n];if(p&&typeof p==='object')for(const k in p)if(p[k]&&typeof p[k]==='object')p[k].p=0}
  store.setJson(KEYS.profiles,ALL);store.set(KEYS.sent,'');store.set(KEYS.season,'2');
}
export const getNick=()=>cleanNick(store.get(KEYS.nick));
export const saveNick=n=>store.set(KEYS.nick,n);

/* player profiles on this device (services/players.js): one per nickname played here. The first visit after this
   update makes a profile for every nickname already in the progress data, and the last player is welcomed back. */
const bandOf=n=>{let best=null,most=0;for(const b of ['kids','teens','adults','elders']){const c=Object.keys(ALL[n]||{}).filter(k=>k.split('_')[0]===b).length;if(c>most){most=c;best=b}}return best};
PLAYERS.migrate(Object.keys(ALL),getNick(),bandOf,n=>totalsOf(ALL[n]||{}).total);
{const lp=PLAYERS.last();if(lp)saveNick(cleanNick(lp.nickname))}
export const allProfiles=()=>ALL;
export const profileOf=nick=>(nick&&ALL[nick])||{};
export const roundKey=(b,c,l,r)=>b+'_'+c+'_'+l+'_'+r;
export const rec=(nick,b,c,l,r)=>profileOf(nick)[roundKey(b,c,l,r)]||{s:0,p:0,t:0};
export const passedRounds=(nick,b,c,l)=>{let n=0;for(let r=0;r<ROUNDS_PER_LEVEL;r++)if(rec(nick,b,c,l,r).s>=1)n++;return n};
export const levelDone=(nick,b,c,l)=>passedRounds(nick,b,c,l)>=ROUNDS_PER_LEVEL;
export const roundOpen=(nick,b,c,l,r)=>r===0||rec(nick,b,c,l,r-1).s>=1;
export const nextRoundOf=(nick,b,c,l)=>{let r=0;while(r<ROUNDS_PER_LEVEL-1&&rec(nick,b,c,l,r).s>=1)r++;return r};
export const playedLevel=(nick,b,c,l)=>Array.from({length:ROUNDS_PER_LEVEL},(_,r)=>rec(nick,b,c,l,r)).some(x=>x.s||x.t);
export function totalsOf(p){const t={total:0,kids:0,teens:0,adults:0,elders:0};for(const k in p){const v=+(p[k]&&p[k].p)||0;t.total+=v;const b=k.split('_')[0];if(b in t)t[b]+=v}return t}
export const totals=nick=>totalsOf(profileOf(nick));
/* keep the best stars, points and time for a round; returns the previous record */
export function saveRound(nick,b,c,l,r,{stars,pts,ms,pass}){
  if(!nick)return {s:0,p:0,t:0};
  const p=ALL[nick]||(ALL[nick]={}),k=roundKey(b,c,l,r),old=p[k]||{s:0,p:0,t:0};
  p[k]={s:Math.max(old.s,stars),p:Math.max(old.p,pts),t:pass&&(!old.t||ms<old.t)?ms:old.t};
  store.setJson(KEYS.profiles,ALL);
  return old;
}

/* adaptive difficulty history: last ADAPTIVE.keepHistory round results per nickname + band + puzzle type */
let SK=store.json(KEYS.skill,{});
const skKey=(nick,b,c)=>(nick||'?')+'|'+b+'_'+c;
export const skillHistory=(nick,b,c)=>SK[skKey(nick,b,c)]||[];
export function recordSkill(nick,b,c,ratio){const k=skKey(nick,b,c);SK[k]=(SK[k]||[]).concat(ratio).slice(-ADAPTIVE.keepHistory);store.setJson(KEYS.skill,SK)}

/* questions already seen, per nickname and level pool. The old per-device list is copied to the current nickname once. */
let SEEN=store.json(KEYS.seen,{});
if(!store.get(KEYS.seen)){
  const old=store.json(KEYS.seenOld,{}),me=getNick()||'?';
  if(Object.keys(old).length){SEEN[me]={};for(const k in old)if(Array.isArray(old[k]))SEEN[me][k]=old[k]}
  store.setJson(KEYS.seen,SEEN);
}
const live={};   /* Sets in use this visit */
export function seenFor(nick,key){
  const id=(nick||'?')+'|'+key;
  return live[id]||(live[id]=new Set(((SEEN[nick||'?']||{})[key])||[]));
}
export function saveSeen(nick,keys){
  const n=nick||'?',mine=SEEN[n]||(SEEN[n]={});
  for(const key of keys){const [b,c,l]=key.split('_');mine[key]=trimSeen(b,c,+l,[...seenFor(nick,key)])}
  store.setJson(KEYS.seen,SEEN);
}

/* daily challenge data per nickname */
let DY=store.json(KEYS.daily,{});
export const dailyData=nick=>(nick&&DY[nick])||null;
export function saveDaily(nick,data){if(!nick)return;DY[nick]=data;store.setJson(KEYS.daily,DY)}
