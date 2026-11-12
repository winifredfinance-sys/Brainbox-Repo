/* Brainbox Ninja: global leaderboard on Supabase.
   - signs every visitor in anonymously (no email, no phone), and keeps that session in this browser
   - sends the player's total points after a finished round, once per new total
   - reads the top 50 and the player's own best and position
   Progress, unlocks and stars still live in localStorage (see app.js). If Supabase cannot be
   reached, the game keeps working and only the leaderboard shows a message.
   Needs js/config.js. The official client (js/vendor/supabase-2.118.0.js) is loaded on demand. */
const NET=(()=>{
  const CFG=window.BN_SUPABASE||{},LIB='js/vendor/supabase-2.118.0.js',TOP=50,TABLE='leaderboard',VIEW='leaderboard_best',SENT='bn-sent-v1';
  /* accept the URL with or without a trailing /rest/v1/ (the client adds those paths itself) */
  const url=String(CFG.url||'').trim().replace(/\/(rest|auth)\/v1(\/.*)?$/,'').replace(/\/+$/,''),key=String(CFG.key||'').trim();

  /* refuse secret keys outright: they bypass Row Level Security and must never reach a browser */
  let secret=/^sb_secret_/.test(key);
  try{const p=key.split('.');if(p.length===3&&/service_role/.test(atob(p[1].replace(/-/g,'+').replace(/_/g,'/'))))secret=true}catch(e){}
  if(secret)console.error('Brainbox Ninja: js/config.js holds a SECRET Supabase key. Remove it, rotate it in the Supabase dashboard, and use the Publishable key instead.');
  const configured=!secret&&/^https:\/\/\S+$/.test(url)&&!!key&&!/YOUR-/.test(url+key);

  const board={status:configured?'idle':'off',rows:[],me:null,at:0,nick:null};
  const api={TOP,configured,board,uid:null,syncState:'',on,refresh,sync,init,nameTaken};
  const subs=[];
  function on(f){subs.push(f)}
  const emit=()=>subs.forEach(f=>{try{f()}catch(e){console.error(e)}});
  /* plain-English hints in the browser console for the usual set-up mistakes (players only see friendly messages) */
  function explain(what,e){
    const c=String(e&&e.code||''),m=String(e&&e.message||e||''),s=e&&e.status;let h='';
    if(/anonymous/i.test(c+' '+m))h='Anonymous sign-ins look switched off: Supabase dashboard → Authentication → Sign In / Providers → allow anonymous sign-ins.';
    else if(c==='42501'||/row-level security|permission denied/i.test(m))h='Supabase refused this (Row Level Security or table grants). Check the SELECT/INSERT policies and grants on public.leaderboard.';
    else if(s===401||/invalid api key|no api key|jwt/i.test(m))h='The key in js/config.js was not accepted. Use the Publishable key from Project Settings → API Keys.';
    else if(c==='42P01'||c==='PGRST205')h='The leaderboard table was not found. It must be public.leaderboard.';
    else if(/rate limit|429/i.test(m+' '+s))h='Supabase rate limit reached (often anonymous sign-ins per IP). Raise it under Authentication → Rate Limits.';
    console.warn('Brainbox Ninja: '+what,m,h?'| Fix: '+h:'');
  }

  /* ---------- connection ---------- */
  let sb=null,libP=null,authP=null;
  function loadLib(){
    if(window.supabase&&window.supabase.createClient)return Promise.resolve();
    return libP||(libP=new Promise((ok,fail)=>{
      const s=document.createElement('script');s.src=LIB;s.async=true;
      s.onload=()=>window.supabase?ok():fail(new Error('Supabase library did not load'));
      s.onerror=()=>{s.remove();fail(new Error('Supabase library did not load'))};
      document.head.appendChild(s);
    }).catch(e=>{libP=null;throw e}));
  }
  async function client(){
    if(!configured)throw new Error('not configured');
    await loadLib();
    if(!sb)sb=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'bn-auth'}});
    return sb;
  }
  /* the saved session, if any, without creating a new anonymous user (used when only reading) */
  async function knownUser(){
    try{const c=await client(),{data}=await c.auth.getSession();const u=data&&data.session&&data.session.user;if(u)api.uid=u.id;return u||null}catch(e){return null}
  }
  /* reuse the saved anonymous session if there is one, otherwise create a new anonymous user.
     Only called when there is a score to save: Supabase limits new anonymous sign-ins per internet address
     (30 an hour by default), and many players in Nigeria share one address on mobile networks. */
  function signIn(){
    return authP||(authP=(async()=>{
      const c=await client();
      let {data,error}=await c.auth.getSession();
      let session=!error&&data&&data.session;
      if(!session){const r=await c.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session}
      api.uid=session.user.id;
      return c;
    })().catch(e=>{authP=null;throw e}));
  }

  /* ---------- score upload ---------- */
  /* totals already sent from this browser, per nickname: {uid, sent:{nick:total}} */
  const readSent=()=>{try{const o=JSON.parse(ls.get(SENT)||'{}');return o&&typeof o==='object'&&o.sent?o:{uid:null,sent:{}}}catch(e){return {uid:null,sent:{}}}};
  let pending=()=>null,busy=false,again=false;
  async function sync(){
    if(!configured){api.syncState='';return}
    const p=pending(),nick=p&&p.nick,total=Math.max(0,Math.floor(+(p&&p.total)||0)),playerId=p&&p.playerId||null;
    /* the device player id (js/players.js) goes with every entry; it is only sent once the database has a column
       for it (set sendPlayerId:true in js/config.js after adding it), so today's database keeps working */
    const withId=CFG.sendPlayerId&&playerId;
    if(!nick||nick.length<2||total<=0||total<=(+readSent().sent[nick]||0)){if(!busy)api.syncState='';emit();return}
    if(busy){again=true;return}
    if(!navigator.onLine){api.syncState='offline';emit();return}
    busy=true;api.syncState='saving';emit();
    try{
      const c=await signIn();
      let m=readSent();if(m.uid!==api.uid)m={uid:api.uid,sent:{}};
      let stored=total;
      if(total>(+m.sent[nick]||0)){
        /* submit_score (supabase/hardening.sql) checks the name and score on the server and keeps one entry per
           player and name; until that SQL has been run, fall back to a plain insert */
        const r=await c.rpc('submit_score',withId?{p_name:nick,p_score:total,p_player:playerId}:{p_name:nick,p_score:total});
        if(r.error&&(r.error.code==='PGRST202'||r.error.code==='42883'||/submit_score/.test(r.error.message||'')&&/find|exist/i.test(r.error.message||''))){
          const {error}=await c.from(TABLE).insert(withId?{user_id:api.uid,player_name:nick,score:total,player_id:playerId}:{user_id:api.uid,player_name:nick,score:total});
          if(error)throw error;
        }else if(r.error)throw r.error;
        else if(typeof r.data==='number')stored=Math.min(total,r.data);
        m.sent[nick]=stored;ls.set(SENT,JSON.stringify(m));
      }
      api.syncState='saved';
      /* the server lets a total grow only so fast; send the rest a little later */
      if(stored<total){clearTimeout(api._later);api._later=setTimeout(sync,60000)}
      busy=false;refresh(nick,true);
    }catch(e){
      explain('score not sent yet.',e);
      api.syncState=navigator.onLine?'failed':'offline';
    }finally{busy=false;emit()}
    if(again){again=false;sync()}
  }

  /* ---------- reading the board ---------- */
  const COLS='user_id,player_name,score,created_at';
  /* fallback when the leaderboard_best view has not been created: read raw rows and keep each player's best */
  function bestPerPlayer(list){
    const seen=new Set();
    return list.filter(r=>{const k=r.user_id+'|'+r.player_name;if(seen.has(k))return false;seen.add(k);return true});
  }
  /* give up after a while so a slow or blocked connection shows a clear message instead of "Loading" forever */
  const within=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timed out')),ms))]);
  let loading=null,reload=false;
  function refresh(nick,force){
    if(nick!==undefined&&(nick||'')!==board.nick){board.nick=nick||'';force=true}
    if(!configured){board.status='off';emit();return Promise.resolve()}
    if(!navigator.onLine){board.status='offline';emit();return Promise.resolve()}
    if(loading){if(force)reload=true;return loading}
    if(!force&&board.status==='ok'&&Date.now()-board.at<30000)return Promise.resolve();
    if(board.status!=='ok')board.status='loading';
    emit();
    return loading=(async()=>{
      try{
        const c=await within(client(),10000);
        const auth=knownUser(); /* reading is public; the saved session (if any) only marks "you" */
        let fromView=true,r=await within(c.from(VIEW).select(COLS).order('score',{ascending:false}).order('created_at',{ascending:true}).limit(TOP),8000);
        let rows;
        if(r.error&&!r.error.code)throw r.error; /* no answer from the server: do not try the fallback */
        if(r.error){
          fromView=false;
          r=await within(c.from(TABLE).select(COLS).order('score',{ascending:false}).order('created_at',{ascending:true}).limit(1000),10000);
          if(r.error)throw r.error;
          rows=bestPerPlayer(r.data||[]).slice(0,TOP);
        }else rows=r.data||[];
        await within(auth,5000).catch(()=>{});
        rows=rows.filter(x=>(+x.score||0)>0);
        let me=null;const n=board.nick;
        if(api.uid&&n){
          const i=rows.findIndex(x=>x.user_id===api.uid&&x.player_name===n);
          if(i>=0)me={score:+rows[i].score,rank:i+1};
          else{
            const q=await c.from(fromView?VIEW:TABLE).select('score,created_at').eq('user_id',api.uid).eq('player_name',n).order('score',{ascending:false}).limit(1);
            const b=!q.error&&q.data&&q.data[0];
            if(b){
              me={score:+b.score,rank:null};
              if(fromView){
                const k=await c.from(VIEW).select('user_id',{count:'exact',head:true}).or(`score.gt.${+b.score},and(score.eq.${+b.score},created_at.lt."${b.created_at}")`);
                if(!k.error&&typeof k.count==='number')me.rank=k.count+1;
              }
            }
          }
        }
        Object.assign(board,{status:'ok',rows,me,at:Date.now()});
      }catch(e){
        explain('leaderboard not loaded.',e);
        board.status=navigator.onLine?'error':'offline';
      }finally{loading=null;emit();if(reload){reload=false;refresh(undefined,true)}}
    })();
  }

  /* is this name already used on the leaderboard by another player? true / false, or null if it cannot be checked */
  async function nameTaken(name){
    name=String(name||'').trim();
    if(!configured||name.length<2||navigator.onLine===false)return null;
    try{
      const c=await within(client(),5000);await knownUser();
      const like=name.replace(/[\\%_]/g,m=>'\\'+m);   /* match the whole name, any letter case */
      let q=c.from(VIEW).select('user_id').ilike('player_name',like).limit(5);
      let r=await within(q,5000);
      if(r.error&&r.error.code)r=await within(c.from(TABLE).select('user_id').ilike('player_name',like).limit(5),5000);
      if(r.error)return null;
      return (r.data||[]).some(x=>x.user_id!==api.uid);
    }catch(e){return null}
  }

  /* getPending returns {nick,total} for the current player; called at start-up, after each round and when back online */
  function init(getPending){
    pending=getPending||pending;
    if(!configured)return;
    sync(); /* signs in only if this device has a score waiting to be sent */
    window.addEventListener('online',()=>{sync();if(board.status!=='ok')refresh(undefined,true)});
    window.addEventListener('offline',()=>{if(board.status!=='ok')board.status='offline';emit()});
  }
  return api;
})();
