/* Brainbox Ninja: anonymous gameplay stats for the admin dashboard (admin.html).
   - Sends three kinds of event to Supabase (public.events): session_start, round_complete, round_abandoned.
   - Identifies a browser only by a random device ID (bn-device-v1). No emails, real names, location or IP.
     The ninja name (nickname) is included so stats can later be matched to the leaderboard.
   - Never blocks or breaks the game: every call is wrapped, sending is in the background, and if
     Supabase is down, slow, blocked or not configured, events wait in a capped queue (bn-q-v1) and
     are retried later (next event, reconnect, next visit).
   - Uses plain fetch (no library) with the PUBLISHABLE key from js/config.js. Row Level Security on
     public.events allows inserts only; nobody can read the events with this key.
   Needs js/content.js (ls helper) and js/config.js. Loaded before js/app.js. */
const TRACK=(()=>{
  const VERSION='2026.11.1',QK='bn-q-v1',DK='bn-device-v1',LK='bn-live-v1',MAX=200,BATCH=50,SESSION_GAP=30*60*1000,TIMEOUT=8000;
  const COLS='occurred_at,event_id,device_id,session_id,event_type,nickname,round_id,age_band,puzzle_type,level,round_no,score,total_questions,answered,points,round_ms,passed,adaptive_adj,timeouts,app_version';
  const CFG=window.BN_SUPABASE||{};
  const url=String(CFG.url||'').trim().replace(/\/(rest|auth)\/v1(\/.*)?$/,'').replace(/\/+$/,''),key=String(CFG.key||'').trim();
  /* only a publishable key (or a legacy anon JWT) is ever used; a secret key switches tracking off */
  let jwt=false,safeKey=/^sb_publishable_/.test(key);
  if(!safeKey&&/^eyJ/.test(key)){try{const p=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(p&&p.role==='anon'){safeKey=true;jwt=true}}catch(e){}}
  const on=safeKey&&/^https:\/\/\S+$/.test(url)&&!/YOUR-/.test(url+key)&&typeof fetch==='function';

  const warned={};
  const warn=(k,m)=>{if(warned[k])return;warned[k]=1;try{console.warn('Brainbox Ninja: stats '+m)}catch(e){}};
  const uuid=()=>{
    try{if(window.crypto&&crypto.randomUUID)return crypto.randomUUID()}catch(e){}
    const b=new Uint8Array(16);
    try{crypto.getRandomValues(b)}catch(e){for(let i=0;i<16;i++)b[i]=Math.random()*256|0}
    b[6]=b[6]&15|64;b[8]=b[8]&63|128;
    const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
    return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
  };
  const isUuid=s=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s||''));
  const int=(v,lo,hi)=>Math.min(hi,Math.max(lo,Math.round(+v||0)));
  const BANDS_OK=['kids','teens','adults','elders'];
  const TYPES_OK=['count','sums','patterns','odd','skip','maths','seq','words','proverbs','riddles','money','memory','numbers','mix'];

  /* ---------- identity: random device ID; a new session per visit or after 30 minutes away ---------- */
  let device=on?ls.get(DK):null;
  if(on&&!isUuid(device)){device=uuid();ls.set(DK,device)}  /* if storage is blocked this lives only until the page closes */
  let session=null,lastSeen=0,nickOf=()=>'';
  const nick=()=>{let n='';try{n=String(nickOf()||'').trim().slice(0,20)}catch(e){}return n.length>=2&&!/[<>&"'\\/\u0000-\u001f]/.test(n)?n:null};
  function ensureSession(){
    const now=Date.now();
    if(!session||now-lastSeen>SESSION_GAP){session=uuid();lastSeen=now;queue({event_type:'session_start'})}
    lastSeen=now;
  }

  /* ---------- queue (localStorage through ls, with an in-memory copy when storage is blocked) ---------- */
  let Q=[];
  function load(){
    const s=ls.get(QK);
    if(s==null)return Q;  /* blocked storage or nothing saved yet: keep the in-memory queue */
    try{const a=JSON.parse(s);Q=Array.isArray(a)?a.filter(e=>e&&isUuid(e.event_id)):[]}catch(e){Q=[]}
    return Q;
  }
  function save(){if(Q.length>MAX)Q=Q.slice(-MAX);ls.set(QK,JSON.stringify(Q))}
  function queue(fields){
    if(!on)return;
    const ev={occurred_at:new Date().toISOString(),event_id:uuid(),device_id:device,session_id:session,event_type:fields.event_type,nickname:nick(),
      round_id:null,age_band:null,puzzle_type:null,level:null,round_no:null,score:null,total_questions:null,answered:null,points:null,
      round_ms:null,passed:null,adaptive_adj:null,timeouts:null,app_version:VERSION};
    Object.assign(ev,fields);
    load();Q.push(ev);save();schedule(2000);
  }

  /* ---------- sending: background, batched, with a timeout and growing retry gaps ---------- */
  let busy=false,timer=null,fails=0,size=BATCH;
  function schedule(ms){if(!on)return;clearTimeout(timer);timer=setTimeout(()=>{flush(false)},ms)}
  async function flush(keep){
    if(!on||busy)return;
    load();if(!Q.length)return;
    if(navigator.onLine===false){schedule(30000);return}
    busy=true;
    const batch=Q.slice(0,size);let ok=false,drop=false,split=false;
    try{
      const ctl=typeof AbortController==='function'?new AbortController():null;
      const stop=setTimeout(()=>{try{ctl&&ctl.abort()}catch(e){}},TIMEOUT);
      const headers={'apikey':key,'Content-Type':'application/json','Prefer':'return=minimal'};
      if(jwt)headers.Authorization='Bearer '+key;
      const r=await fetch(url+'/rest/v1/events?columns='+COLS,{method:'POST',headers,body:JSON.stringify(batch),keepalive:!!keep,signal:ctl?ctl.signal:undefined,credentials:'omit'});
      clearTimeout(stop);
      if(r.ok)ok=true;
      else if(r.status===400||r.status===409||r.status===413||r.status===422){
        if(batch.length>1){size=1;split=true}  /* find the bad one: send one at a time */
        else{drop=true;warn('bad','event rejected by the database and dropped (HTTP '+r.status+').')}
      }
      else if(r.status===401||r.status===403)warn('auth','not accepted (HTTP '+r.status+'). Check the key in js/config.js and that supabase/schema.sql has been run.');
      else if(r.status===404)warn('missing','table public.events not found. Run supabase/schema.sql in the Supabase SQL Editor.');
    }catch(e){/* offline, blocked, timed out or Supabase paused: keep the events and try later */}
    if(ok||drop){
      const sent=new Set(batch.map(e=>e.event_id));
      load();Q=Q.filter(e=>!sent.has(e.event_id));save();
      fails=0;if(drop||!Q.length)size=BATCH;  /* back to full batches once the bad event is gone */
    }else if(!split)fails++;
    busy=false;
    if(Q.length)schedule(ok||drop||split?300:Math.min(5*60*1000,5000*Math.pow(2,Math.min(fails,6))));
  }

  /* ---------- rounds: a "round in progress" marker so a closed tab still counts as abandoned ---------- */
  let live=null;
  const saveLive=()=>ls.set(LK,live?JSON.stringify(live):'');
  const roundFields=(m,extra)=>Object.assign({round_id:m.round_id,session_id:m.session_id,age_band:m.age_band,puzzle_type:m.puzzle_type,level:m.level,
    round_no:m.round_no,adaptive_adj:m.adaptive_adj,total_questions:m.total_questions,score:m.score,answered:m.answered,points:m.points,round_ms:m.round_ms,timeouts:m.timeouts},extra||{});
  function abandon(m){
    const total=int(m.total_questions,1,10),answered=int(m.answered,0,total);
    queue(roundFields(m,{event_type:'round_abandoned',answered,score:int(m.score,0,answered),timeouts:int(m.timeouts,0,answered),passed:null}));
  }
  function roundStart(r){
    if(!on)return;
    ensureSession();
    if(live)roundQuit();
    const band=BANDS_OK.includes(r.band)?r.band:null,type=TYPES_OK.includes(r.cat)?r.cat:null;
    if(!band||!type){live=null;saveLive();return}
    live={round_id:uuid(),session_id:session,age_band:band,puzzle_type:type,level:int(r.level,0,2),round_no:int(r.round,0,9),
      adaptive_adj:int(r.adj,-1,1),total_questions:int(r.total,1,10),score:0,answered:0,points:0,round_ms:0,timeouts:0,sent:false};
    saveLive();
  }
  function progress(p){
    if(!on||!live)return;
    const answered=int(p.answered,0,live.total_questions);
    Object.assign(live,{answered,score:int(p.score,0,answered),points:int(p.points,0,300),round_ms:int(p.ms,0,3600000),timeouts:int(p.timeouts,0,answered)});
    saveLive();
  }
  function roundEnd(r){
    if(!on||!live)return;
    const total=live.total_questions;
    queue(roundFields(live,{event_type:'round_complete',answered:total,score:int(r.score,0,total),points:int(r.points,0,300),
      round_ms:int(r.ms,0,3600000),passed:!!r.passed,timeouts:int(r.timeouts,0,total)}));
    live=null;saveLive();
  }
  function roundQuit(){
    if(!on||!live)return;
    abandon(live);live=null;saveLive();
  }
  /* tab hidden or closed mid-round: report it as abandoned now (a finished round later replaces it) */
  function hidden(){
    if(live&&!live.sent){abandon(live);live.sent=true;saveLive()}
    flush(true);
  }

  function init(getNick){
    if(typeof getNick==='function')nickOf=getNick;
    if(!on)return;
    /* a round left open when the page was last closed */
    try{const m=JSON.parse(ls.get(LK)||'null');if(m&&isUuid(m.round_id)&&!m.sent)abandon(m)}catch(e){}
    ls.set(LK,'');
    ensureSession();
    schedule(1500);
    window.addEventListener('online',()=>schedule(1000));
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='hidden')hidden();
      else{ensureSession();schedule(1000)}
    });
    window.addEventListener('pagehide',hidden);
  }

  const safe=f=>function(){try{return f.apply(null,arguments)}catch(e){}};
  return {on,init:safe(init),roundStart:safe(roundStart),progress:safe(progress),roundEnd:safe(roundEnd),roundQuit:safe(roundQuit),
    flush:safe(()=>flush(false)),pending:safe(()=>load().length)};
})();
