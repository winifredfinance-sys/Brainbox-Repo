/* Brainbox Ninja: player profiles saved on this device (Nov 2026).
   - "brainbox_players": [{id, nickname, ageBand, progress:{type, level, round, totalPoints, roundsPassed}, createdAt, lastPlayedAt}]
   - "brainbox_last": id of the player who played last, so they are welcomed back instead of being asked for a name.
   Several people can share one device (a parent and a child); each keeps their own age band and progress.
   Stars and per-round points stay in bn-profiles-v2 (keyed by nickname) as before; this list sits on top of it.
   No email, no sign-up, nothing sent anywhere. Every storage call goes through the ls helper (try/catch); if storage
   is blocked the list lives in memory for the visit. Same module as js/players.js in the vanilla game. */
import {store} from './storage.js';
const ls={get:k=>store.get(k),set:(k,v)=>store.set(k,v)};
export const PLAYERS=(()=>{
  const PK='brainbox_players',LK='brainbox_last';
  const uuid=()=>{
    try{if(window.crypto&&crypto.randomUUID)return crypto.randomUUID()}catch(e){}
    const b=new Uint8Array(16);
    try{crypto.getRandomValues(b)}catch(e){for(let i=0;i<16;i++)b[i]=Math.random()*256|0}
    b[6]=b[6]&15|64;b[8]=b[8]&63|128;
    const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
    return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
  };
  const ok=p=>p&&typeof p==='object'&&typeof p.id==='string'&&typeof p.nickname==='string'&&p.nickname.length>=2;
  let list=[],lastId=null;
  try{const a=JSON.parse(ls.get(PK)||'[]');if(Array.isArray(a))list=a.filter(ok)}catch(e){list=[]}
  lastId=ls.get(LK)||null;
  const save=()=>ls.set(PK,JSON.stringify(list));
  const same=(a,b)=>String(a).toLowerCase()===String(b).toLowerCase();

  const all=()=>list.slice().sort((a,b)=>String(b.lastPlayedAt||b.createdAt).localeCompare(String(a.lastPlayedAt||a.createdAt)));
  const byId=id=>list.find(p=>p.id===id)||null;
  const byNick=n=>list.find(p=>same(p.nickname,n))||null;
  const last=()=>byId(lastId);
  function setLast(id){lastId=id;ls.set(LK,id||'')}
  function add(nickname,ageBand){
    const now=new Date().toISOString();
    const p={id:uuid(),nickname,ageBand:ageBand||null,progress:{type:null,level:0,round:0,totalPoints:0,roundsPassed:0},createdAt:now,lastPlayedAt:now};
    list.push(p);save();return p;
  }
  /* the profile for a nickname: the existing one on this device, or a new one */
  function forNick(nickname,ageBand){const p=byNick(nickname)||add(nickname,ageBand);if(ageBand&&p.ageBand!==ageBand)update(p.id,{ageBand});return p}
  function update(id,patch){
    const p=byId(id);if(!p)return null;
    Object.assign(p,patch,patch.progress?{progress:Object.assign({},p.progress,patch.progress)}:{});
    p.lastPlayedAt=new Date().toISOString();save();return p;
  }
  /* first visit after this update: make a profile for every nickname already played on this device,
     and welcome back the one in bn-nick. bandOf(nick) guesses the age band from that nickname's progress. */
  function migrate(nicknames,lastNick,bandOf,totalOf){
    if(ls.get(PK)!=null&&list.length)return;
    const now=new Date().toISOString();
    for(const n of nicknames.concat(lastNick?[lastNick]:[]))if(n&&n.length>=2&&!byNick(n))
      list.push({id:uuid(),nickname:n,ageBand:bandOf(n),progress:{type:null,level:0,round:0,totalPoints:totalOf(n),roundsPassed:0},createdAt:now,lastPlayedAt:now});
    if(list.length){save();const p=byNick(lastNick);if(p&&!last())setLast(p.id)}
  }
  return {all,byId,byNick,last,setLast,add,forNick,update,migrate,uuid};
})();
