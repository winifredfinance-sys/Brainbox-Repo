/* Brainbox Ninja admin dashboard (admin.html). Not linked from the game.
   - Sign-in: Supabase email magic link. Only emails in private.admins can see data (enforced by the database).
   - All numbers come from one database function, public.admin_stats(), so the page never downloads raw events.
   - Charts are plain SVG. Names of age bands and puzzle types come from js/content.js.
   Needs js/content.js, js/config.js and js/vendor/supabase-2.118.0.js. */
(()=>{
  const CFG=window.BN_SUPABASE||{};
  const SB_URL=String(CFG.url||'').trim().replace(/\/(rest|auth)\/v1(\/.*)?$/,'').replace(/\/+$/,''),SB_KEY=String(CFG.key||'').trim();
  const configured=/^https:\/\/\S+$/.test(SB_URL)&&/^(sb_publishable_|eyJ)/.test(SB_KEY)&&!/YOUR-/.test(SB_URL+SB_KEY);
  const root=document.getElementById('adm');
  const BAND_IDS=['kids','teens','adults','elders'];
  const DAY=864e5,MIN_N=20,DB_LIMIT=500*1024*1024;

  /* ---------- small helpers ---------- */
  const nf=n=>(+n||0).toLocaleString('en-NG');
  const ratio=(a,b)=>b>0?a/b:null;
  const fp=x=>x==null?'–':(x<.1&&x>0?(x*100).toFixed(1):Math.round(x*100))+'%';
  const band=id=>BANDS.find(b=>b.id===id)||{id,range:id,name:id};
  const bandLabel=id=>{const b=band(id);return b.range+' · '+b.name};
  const bandCell=id=>{const b=band(id);return esc(b.range)+'<span class="bl-name"> · '+esc(b.name)+'</span>'};  /* name hidden on phones */
  const typeName=(b,t)=>{try{const c=catOf(b,t);return c?c.name:t}catch(e){return t}};
  const dur=s=>{s=Math.round(+s||0);if(s<60)return s+' s';const m=Math.floor(s/60);return m<60?m+' min '+String(s%60).padStart(2,'0')+' s':Math.floor(m/60)+' h '+(m%60)+' min'};
  const dayLabel=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-NG',{day:'numeric',month:'short',timeZone:'UTC'});
  const within=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('The database took too long to answer.')),ms))]);
  /* status badges always carry a word and a symbol, never colour alone */
  const badge=(kind,text)=>`<span class="badge b-${kind}"><span aria-hidden="true">${{ok:'✓',bad:'✗',warn:'!',few:'…',none:'–'}[kind]||''}</span>${esc(text)}</span>`;
  const store={getItem:k=>ls.get(k),setItem:(k,v)=>ls.set(k,v),removeItem:k=>{try{localStorage.removeItem(k)}catch(e){}}};

  /* ---------- state (filters are remembered on this browser) ---------- */
  const st={range:'30',band:'',view:'boot',data:null,err:'',email:'',msg:'',seq:0};
  try{const v=JSON.parse(ls.get('bn-admin-view')||'{}')||{};if(['7','30','all'].includes(v.range))st.range=v.range;if(v.band===''||BAND_IDS.includes(v.band))st.band=v.band}catch(e){}
  const saveView=()=>ls.set('bn-admin-view',JSON.stringify({range:st.range,band:st.band}));

  /* ---------- Supabase ---------- */
  let sb=null;
  const client=()=>sb||(sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'bn-admin-auth',storage:store}}));
  function rangeFrom(){
    if(st.range==='all')return null;
    const today=new Date(Date.now()+3600e3).toISOString().slice(0,10);   /* Lagos is UTC+1 all year */
    return new Date(Date.parse(today+'T00:00:00+01:00')-(+st.range-1)*DAY).toISOString();
  }
  async function load(){
    const my=++st.seq;
    st.view=st.data?'dash':'loading';st.loading=true;render();
    let res;
    try{res=await within(client().rpc('admin_stats',{p_from:rangeFrom(),p_to:null,p_band:st.band||null}),25000)}
    catch(e){res={error:{message:String(e&&e.message||e)}}}
    if(my!==st.seq)return;
    st.loading=false;
    const er=res.error;
    if(!er){st.data=res.data;st.view='dash'}
    else if(er.code==='42501'||/not allowed|permission denied/i.test(er.message||'')){st.data=null;st.view='denied'}
    else if(er.code==='PGRST202'||/admin_stats/.test(er.message||'')&&/find|exist/i.test(er.message||'')){st.data=null;st.view='nofunc'}
    else{st.err=er.message||'Unknown error';st.view=st.data?'dash':'error'}
    render();
  }
  function onSession(session){
    const u=session&&session.user;
    if(!u||u.is_anonymous){st.email='';st.data=null;if(st.view!=='sent')st.view='login';render();return}
    const changed=st.email!==u.email;st.email=u.email||'';
    if(changed||(!st.data&&!st.loading))load();
  }
  async function sendLink(email){
    email=String(email||'').trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){st.msg='Enter a valid email address.';render();return}
    st.msg='Sending…';render();
    let r;
    try{r=await within(client().auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.origin+location.pathname}}),15000)}
    catch(e){r={error:e}}
    if(r.error){
      const m=String(r.error.message||r.error);
      st.msg=/signups? not allowed|not found|user/i.test(m)?'There is no admin account for that email. Add the user in Supabase (Authentication → Users) first.'
            :/rate|seconds/i.test(m)?'Too many emails just now. Supabase’s free email service sends only a few per hour; try again later.'
            :'Could not send the link: '+m;
      render();return;
    }
    st.view='sent';st.msg='';st.sentTo=email;render();
  }

  /* ---------- views ---------- */
  function render(){
    const v=st.view;
    if(v==='config')root.innerHTML=shell('<section class="sec"><h2>Not connected</h2><p>Add the Supabase Project URL and Publishable key to <code>js/config.js</code>, then reload.</p></section>');
    else if(v==='nolib')root.innerHTML=shell('<section class="sec"><h2>Could not load</h2><p>The Supabase library (<code>js/vendor/supabase-2.118.0.js</code>) did not load. Reload the page.</p></section>');
    else if(v==='boot'||v==='loading')root.innerHTML=shell('<p class="lead" role="status">Loading the dashboard…</p>');
    else if(v==='login'||v==='sent')root.innerHTML=shell(loginView());
    else if(v==='denied')root.innerHTML=shell(`<section class="sec"><h2>Not an admin</h2><p>You are signed in as <strong>${esc(st.email)}</strong>, but this email is not on the admin list.</p><p>In the Supabase SQL Editor run:</p><pre><code>insert into private.admins (email) values ('${esc(st.email)}');</code></pre><div class="row-b"><button class="btn primary" data-a="reload">I have added it, try again</button><button class="btn" data-a="signout">Sign out</button></div></section>`);
    else if(v==='nofunc')root.innerHTML=shell('<section class="sec"><h2>Database not set up yet</h2><p>The dashboard function was not found. Run <code>supabase/schema.sql</code> in the Supabase SQL Editor, then try again.</p><div class="row-b"><button class="btn primary" data-a="reload">Try again</button><button class="btn" data-a="signout">Sign out</button></div></section>');
    else if(v==='error')root.innerHTML=shell(`<section class="sec"><h2>Could not load the numbers</h2><p>${esc(st.err)}</p><p class="muted">If the project has been idle, Supabase may have paused it: open the Supabase dashboard and click Restore project.</p><div class="row-b"><button class="btn primary" data-a="reload">Try again</button><button class="btn" data-a="signout">Sign out</button></div></section>`);
    else if(v==='dash')root.innerHTML=shell(dashView(),true);
    if(v==='dash')drawCharts();
  }
  function shell(body,dash){
    return `<header class="adm-top"><div><p class="eyebrow">Brainbox Ninja</p><h1>Player stats</h1></div>${st.email?`<div class="who"><span>${esc(st.email)}</span><button class="link" data-a="signout">Sign out</button></div>`:''}</header>${dash?filters():''}${body}`;
  }
  function loginView(){
    if(location.protocol==='file:')return '<section class="sec login"><h2>Open this page from a web address</h2><p>Email sign-in links cannot return to a file on your computer. Open <code>/admin</code> on your Vercel site, or serve the folder (for example <code>python -m http.server 8000</code>) and open <code>http://localhost:8000/admin.html</code>.</p></section>';
    if(st.view==='sent')return `<section class="sec login"><h2>Check your email</h2><p>We sent a sign-in link to <strong>${esc(st.sentTo)}</strong>. Open it on this device. The link works once and expires after an hour.</p><button class="link" data-a="again">Use a different email</button></section>`;
    return `<section class="sec login"><h2>Admin sign-in</h2><p class="muted">For the game’s owners only. Players never sign in here.</p>
      <form id="login" class="lform"><label for="email">Email</label><input id="email" type="email" autocomplete="email" required placeholder="you@example.com"><button class="btn primary" type="submit">Email me a sign-in link</button></form>
      <p class="msg" role="alert">${esc(st.msg)}</p></section>`;
  }
  function filters(){
    const R=[['7','7 days'],['30','30 days'],['all','All time']],B=[['','All ages']].concat(BAND_IDS.map(id=>[id,band(id).range]));
    return `<div class="filters"><div class="tabs" role="group" aria-label="Date range">${R.map(([v,l])=>`<button class="tab" data-a="range" data-v="${v}" aria-pressed="${st.range===v}">${l}</button>`).join('')}</div>
      <div class="tabs" role="group" aria-label="Age band">${B.map(([v,l])=>`<button class="tab" data-a="band" data-v="${v}" aria-pressed="${st.band===v}">${esc(l)}</button>`).join('')}</div>
      <button class="link" data-a="reload">${st.loading?'Updating…':'Refresh'}</button></div>`;
  }
  const sec=(n,title,metric,target,body,cls)=>`<section class="sec${cls?' '+cls:''}"><header class="sh"><h2><span class="sn">${n}</span>${title}</h2><p class="metric">${metric}</p><p class="target"><strong>Target:</strong> ${target}</p></header>${body}</section>`;
  const empty=t=>`<p class="empty">${t}</p>`;

  function dashView(){
    const D=st.data||{},M=D.meta||{};
    if(!M.events)return `<section class="sec"><h2>No gameplay data yet</h2>${empty('Numbers appear here once players open the game and finish rounds. Each finished or abandoned round sends one event from <code>js/track.js</code>.')}<p class="muted">To preview the dashboard now, run <code>supabase/seed_test.sql</code> in the SQL Editor. It adds clearly labelled test players you can delete later.</p></section>`;
    const scope=(st.range==='all'?'All time (up to 13 months)':'Last '+st.range+' days')+' · '+(st.band?bandLabel(st.band):'all ages');
    return `${M.test_events?`<div class="banner" role="note"><strong>Includes ${nf(M.test_events)} test events.</strong> Delete them in the SQL Editor with <code>delete from public.events where is_test;</code></div>`:''}
      <p class="scope">${esc(scope)}. Days are counted in Lagos time.</p>
      ${sOverview(D)}
      <div class="grid2">${sRetention(D)}${sBands(D)}</div>
      ${sPass(D)}
      <div class="grid2">${sAdaptive(D)}${sTimeouts(D)}</div>
      <div class="grid2">${sTypes(D)}${sDaily(D)}</div>
      <p class="foot meta">${nf(M.events)} events stored · database ${(M.db_bytes/1048576).toFixed(1)} MB of 500 MB free${M.db_bytes>DB_LIMIT*.8?' '+badge('warn','nearly full'):''} · updated ${new Date(M.generated_at||Date.now()).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})}${st.err&&st.view==='dash'?' · <span class="bad-t">last refresh failed: '+esc(st.err)+'</span>':''}</p>`;
  }

  /* 1. Overview */
  function sOverview(D){
    const o=D.overview||{},s=D.sessions||{},f=D.first_session||{};
    const players=+o.players||0,rounds=+o.rounds_completed||0,med=f.median==null?null:+f.median;
    const fsKind=!f.players?'none':med>=3?'ok':'bad';
    const tiles=[
      ['Players',nf(players),'unique devices with a round'],
      ['New players',st.range==='all'?'–':nf(o.new_players),st.range==='all'?'pick 7 or 30 days':'first played in this period'],
      ['Rounds played',nf(rounds),nf(o.rounds_abandoned)+' more left unfinished'],
      ['Rounds per player',players?(rounds/players).toFixed(1):'–','finished rounds ÷ players'],
      ['Average session',s.sessions?dur(s.avg_seconds):'–','from opening the game to the last round'],
      ['First session',f.players?(med%1?med.toFixed(1):med)+' rounds':'–',f.players?'median · '+fp(ratio(+f.three_plus,+f.players))+' played 3+ ('+nf(f.players)+' new players)':'no first sessions in this period']
    ];
    const body=players||f.players?`<div class="tiles">${tiles.map(([l,v,sub],i)=>`<div class="tile${i===5?' t-'+fsKind:''}"><span class="tl">${l}</span><b>${v}</b><small>${esc(sub)}</small>${i===5&&f.players?badge(fsKind,fsKind==='ok'?'On target':'Below target'):''}</div>`).join('')}</div>`
      :empty('No rounds in this period yet. Players, rounds and session length appear as soon as someone finishes a round.');
    return sec(1,'Overview','Players, rounds and how long a visit lasts. First session = rounds finished in a player’s very first visit.','3+ rounds in the first session (median).',body);
  }
  /* 2. Retention */
  function sRetention(D){
    const r=D.retention||{},d1=ratio(+r.d1_returned,+r.d1_cohort),d7=ratio(+r.d7_returned,+r.d7_cohort);
    const tile=(label,v,ret,cohort,goal,wait)=>{
      if(!cohort)return `<div class="tile"><span class="tl">${label}</span><b>–</b><small>${wait}</small></div>`;
      const kind=goal==null?'none':v>=goal?'ok':'bad';
      return `<div class="tile t-${kind}"><span class="tl">${label}</span><b>${fp(v)}</b><small>${nf(ret)} of ${nf(cohort)} players came back${cohort<30?' · small sample':''}</small>${goal!=null?badge(kind,kind==='ok'?'On target':'Below target'):''}</div>`};
    return sec(2,'Retention','Share of players who played again exactly 1 day and 7 days after their first day. Counts players whose first day is in this period.','20% come back on day 7.',
      `<div class="tiles t2">${tile('Day-1 return',d1,r.d1_returned,+r.d1_cohort,null,'Needs players whose first day was at least 1 day ago.')}${tile('Day-7 return',d7,r.d7_returned,+r.d7_cohort,.2,'Needs players whose first day was at least 7 days ago.')}</div>`);
  }
  /* 3. Age bands */
  function sBands(D){
    const T=D.bands_total||{},rows=BAND_IDS.map(id=>{const b=(D.bands||[]).find(x=>x.age_band===id||x.band===id)||{};return {id,p:ratio(+b.players||0,+T.players),r:ratio(+b.rounds||0,+T.rounds),np:+b.players||0}});
    const bar=v=>`<span class="bar"><i style="width:${v==null?0:Math.max(v*100,v>0?1:0)}%"></i></span><span class="bv">${fp(v)}</span>`;
    const body=T.players?`<div class="scroll"><table class="tbl"><thead><tr><th scope="col">Age band</th><th scope="col">Share of players</th><th scope="col">Share of rounds</th></tr></thead><tbody>${rows.map(x=>`<tr><th scope="row">${bandCell(x.id)}${x.p!=null&&x.p<.1?' '+badge('bad','below 10%'):''}</th><td class="bc">${bar(x.p)}</td><td class="bc">${bar(x.r)}</td></tr>`).join('')}</tbody></table></div><p class="note-s">Always shows every age band (the age filter does not apply). A player who tried two age bands counts in both.</p>`
      :empty('No rounds in this period yet. The split between 4–10, 11–17, 18–59 and 60+ appears here.');
    return sec(3,'Players by age band','Share of players and of finished rounds in each age band.','No age group below 10% of players.',body);
  }
  /* 4. Pass-rate heat map */
  function sPass(D){
    const P=D.pass||[],get=(b,t,l)=>P.find(x=>x.band===b&&x.type===t&&+x.level===l);
    const bands=st.band?[st.band]:BAND_IDS;
    const beg=P.filter(x=>+x.level===0),bn=beg.reduce((a,x)=>a+(+x.n),0),bp=beg.reduce((a,x)=>a+(+x.passed),0),br=ratio(bp,bn);
    const begKind=!bn?'none':br>=.6&&br<=.75?'ok':'bad';
    const cell=(b,t,l)=>{
      const c=get(b,t,l),n=c?+c.n:0,r=c?ratio(+c.passed,n):null,where=`${band(b).range} · ${typeName(b,t)} · ${LEVELS[l]}`;
      if(!n)return `<td class="hc hc-none" title="${esc(where)}: no finished rounds">–</td>`;
      let k='hc-mid',lab='';
      if(n<MIN_N){k='hc-few';lab='few rounds'}
      else if(r<.5){k='hc-bad';lab='too hard'}
      else if(r>.9){k='hc-warn';lab='too easy'}
      else if(l===0&&r>=.6&&r<=.75){k='hc-ok';lab='on target'}
      const tip=`${where}: ${fp(r)} passed (${nf(c.passed)} of ${nf(n)} rounds)${lab?' · '+lab:''}`;
      return `<td class="hc ${k}" title="${esc(tip)}" aria-label="${esc(tip)}"><b>${fp(r)}</b><small>${lab?esc(lab)+' · ':''}${nf(n)}</small></td>`};
    const body=P.length?`<p>${badge(begKind,'Beginner overall: '+fp(br))} <span class="muted">${nf(bp)} of ${nf(bn)} Beginner rounds passed.</span></p>
      <div class="scroll"><table class="tbl heat"><thead><tr><th scope="col">Puzzle type</th>${LEVELS.map(l=>`<th scope="col">${l}</th>`).join('')}</tr></thead><tbody>${bands.map(b=>`<tr class="grp"><th colspan="4" scope="rowgroup">${esc(bandLabel(b))}</th></tr>`+catsFor(b).map(c=>`<tr><th scope="row">${esc(c.name)}</th>${[0,1,2].map(l=>cell(b,c.id,l)).join('')}</tr>`).join('')).join('')}</tbody></table></div>
      <p class="legend">${badge('bad','too hard: under 50%')} ${badge('warn','too easy: over 90%')} ${badge('ok','Beginner on target: 60–75%')} ${badge('few','fewer than '+MIN_N+' rounds: not judged')}</p>`
      :empty('No finished rounds in this period yet. Each cell will show the share of rounds passed (6 out of 10 or better) for one age band, puzzle type and level.');
    return sec(4,'Pass rate by puzzle type and level','Share of finished rounds that were passed (6/10 or better).','Beginner pass rate of 60–75%. Cells under 50% are flagged too hard, over 90% too easy.',body);
  }
  /* 5. Adaptive difficulty */
  function sAdaptive(D){
    const A=D.adaptive||[],all=A.reduce((a,x)=>a+(+x.started),0),row=adj=>A.find(x=>+x.adj===adj)||{started:0,completed:0,passed:0};
    const L=[[0,'Normal'],[1,'Challenge boost <small class="muted">3 harder</small>'],[-1,'Warm-up mix <small class="muted">3 easier</small>']];
    const body=all?`<div class="scroll"><table class="tbl"><thead><tr><th scope="col">Round type</th><th scope="col">Started</th><th scope="col">Share</th><th scope="col">Pass rate</th></tr></thead><tbody>${L.map(([a,l])=>{const x=row(a);return `<tr><th scope="row">${l}</th><td>${nf(x.started)}</td><td>${fp(ratio(+x.started,all))}</td><td>${fp(ratio(+x.passed,+x.completed))}${+x.completed&&+x.completed<MIN_N?' <small class="muted">(few)</small>':''}</td></tr>`}).join('')}</tbody></table></div>`
      :empty('No rounds in this period yet. This shows how often the game adds harder or easier questions, and how players do on those rounds.');
    return sec(5,'Adaptive difficulty','How often challenge boosts and warm-up mixes trigger, and pass rate on those rounds compared with normal rounds.','None set in the product doc. Warm-up rounds should pass more often than before the warm-up.',body);
  }
  /* 6. Timeouts */
  function sTimeouts(D){
    const T=D.timeouts||[],ta=T.reduce((a,x)=>a+(+x.answered),0),tt=T.reduce((a,x)=>a+(+x.timeouts),0),all=ratio(tt,ta);
    const bands=st.band?[st.band]:BAND_IDS;
    const cell=(b,l)=>{const x=T.find(y=>y.band===b&&+y.level===l),a=x?+x.answered:0,r=x?ratio(+x.timeouts,a):null;
      if(!a)return '<td class="muted">–</td>';
      return `<td class="${r>=.1?'bad-t':''}" title="${esc(band(b).range+' · '+LEVELS[l]+': '+nf(x.timeouts)+' of '+nf(a)+' questions')}">${fp(r)}${r>=.1?' <span aria-hidden="true">✗</span>':''}</td>`};
    const kind=all==null?'none':all<.1?'ok':'bad';
    const body=ta?`<p>${badge(kind,'Overall: '+fp(all))} <span class="muted">${nf(tt)} of ${nf(ta)} questions ran out of time.</span></p><div class="scroll"><table class="tbl"><thead><tr><th scope="col">Age band</th>${LEVELS.map(l=>`<th scope="col">${l}</th>`).join('')}</tr></thead><tbody>${bands.map(b=>`<tr><th scope="row">${bandCell(b)}</th>${[0,1,2].map(l=>cell(b,l)).join('')}</tr>`).join('')}</tbody></table></div>`
      :empty('No answered questions in this period yet. The share of questions where the timer ran out appears here.');
    return sec(6,'Timeouts','Share of answered questions where the timer ran out, by age band and level.','Under 10%.',body);
  }
  /* 7. Puzzle types */
  function sTypes(D){
    const T=D.types||[],bands=st.band?[st.band]:BAND_IDS;
    const list=bands.flatMap(b=>catsFor(b).map(c=>{const x=T.find(y=>y.band===b&&y.type===c.id);return {b,name:c.name,n:x?+x.rounds:0}})).sort((a,b)=>b.n-a.n);
    const max=Math.max(1,...list.map(x=>x.n)),total=list.reduce((a,x)=>a+x.n,0);
    const li=(x,i)=>`<li><span class="tn">${esc(x.name)} <small>${esc(band(x.b).range)}</small></span><span class="bar"><i style="width:${x.n?Math.max(1,x.n/max*100):0}%"></i></span><span class="bv">${nf(x.n)}</span></li>`;
    const body=total?`<div class="two-l"><div><h3>Most played</h3><ol class="blist">${list.slice(0,5).map(li).join('')}</ol></div><div><h3>Least played</h3><ol class="blist">${list.slice(-5).reverse().map(li).join('')}</ol></div></div>
      <details><summary>All ${list.length} puzzle types</summary><ol class="blist">${list.map(li).join('')}</ol></details>`
      :empty('No rounds in this period yet. Puzzle types ranked by rounds played appear here.');
    return sec(7,'Most and least played puzzle types','Rounds started (finished or not) per puzzle type and age band.','None set in the product doc.',body);
  }
  /* 8. Daily activity */
  function sDaily(D){
    const days=D.daily||[],any=days.some(d=>+d.players||+d.rounds);
    const tbl=`<details><summary>Show as a table</summary><div class="scroll"><table class="tbl"><thead><tr><th scope="col">Day</th><th scope="col">Players</th><th scope="col">Rounds</th></tr></thead><tbody>${days.slice().reverse().map(d=>`<tr><th scope="row">${esc(dayLabel(d.day))}</th><td>${nf(d.players)}</td><td>${nf(d.rounds)}</td></tr>`).join('')}</tbody></table></div></details>`;
    const body=any?`<h3>Daily active players</h3><div class="chart" data-k="players" data-l="players"></div><h3>Rounds finished per day</h3><div class="chart" data-k="rounds" data-l="rounds"></div>${tbl}`
      :empty('No activity in this period yet. Two line charts (players per day and rounds per day) appear here.');
    return sec(8,'Activity over time','Players with at least one round, and finished rounds, per day.','None set in the product doc.',body);
  }

  /* ---------- SVG line chart with a hover crosshair and tooltip ---------- */
  const nice=m=>{if(m<=4)return 4;const p=Math.pow(10,Math.floor(Math.log10(m))),f=m/p;return (f<=1?1:f<=2?2:f<=5?5:10)*p};
  function drawCharts(){
    const days=(st.data&&st.data.daily)||[];
    root.querySelectorAll('.chart').forEach(el=>{
      const k=el.dataset.k,label=el.dataset.l,vals=days.map(d=>+d[k]||0);
      const W=Math.max(260,el.clientWidth||600),H=170,m={l:40,r:14,t:10,b:26},iw=W-m.l-m.r,ih=H-m.t-m.b;
      const top=nice(Math.max(...vals,1)),n=vals.length;
      const x=i=>m.l+(n<2?iw/2:i*iw/(n-1)),y=v=>m.t+ih*(1-v/top);
      const grid=[0,top/2,top].map(v=>`<line class="gl" x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${m.l-8}" y="${y(v)+4}" text-anchor="end">${nf(v)}</text>`).join('');
      const ticks=(n<2?[0]:[0,Math.floor((n-1)/2),n-1]).map((i,j,a)=>`<text class="ax" x="${x(i)}" y="${H-6}" text-anchor="${a.length>1&&j===0?'start':a.length>1&&j===a.length-1?'end':'middle'}">${esc(dayLabel(days[i].day))}</text>`).join('');
      const path=vals.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
      el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc('Daily '+label+', '+(n?dayLabel(days[0].day)+' to '+dayLabel(days[n-1].day):''))}">${grid}${ticks}<path class="ln" d="${path}"/>${n===1?`<circle class="pt" cx="${x(0)}" cy="${y(vals[0])}" r="4"/>`:''}<line class="xh" y1="${m.t}" y2="${m.t+ih}" x1="0" x2="0" visibility="hidden"/><circle class="hp" r="5" visibility="hidden"/><rect class="hit" x="${m.l}" y="0" width="${iw}" height="${H}"/></svg><div class="ctip" hidden></div>`;
      const svg=el.querySelector('svg'),xh=svg.querySelector('.xh'),hp=svg.querySelector('.hp'),tip=el.querySelector('.ctip');
      const show=ev=>{
        const r=svg.getBoundingClientRect(),px=(ev.clientX-r.left)*(W/r.width);
        const i=n<2?0:Math.max(0,Math.min(n-1,Math.round((px-m.l)/(iw/(n-1)))));
        xh.setAttribute('x1',x(i));xh.setAttribute('x2',x(i));xh.setAttribute('visibility','visible');
        hp.setAttribute('cx',x(i));hp.setAttribute('cy',y(vals[i]));hp.setAttribute('visibility','visible');
        tip.hidden=false;tip.innerHTML=`<strong>${esc(dayLabel(days[i].day))}</strong> ${nf(vals[i])} ${esc(label)}`;
        const tx=x(i)/W*r.width;tip.style.left=Math.min(Math.max(tx,60),r.width-60)+'px';tip.style.top=(y(vals[i])/H*r.height-8)+'px';
      };
      const hide=()=>{xh.setAttribute('visibility','hidden');hp.setAttribute('visibility','hidden');tip.hidden=true};
      svg.addEventListener('pointermove',show);svg.addEventListener('pointerdown',show);svg.addEventListener('pointerleave',hide);
    });
  }
  let rz=null;
  window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(st.view==='dash')drawCharts()},150)});

  /* ---------- events ---------- */
  root.addEventListener('click',e=>{
    const t=e.target.closest('[data-a]');if(!t)return;
    const a=t.dataset.a;
    if(a==='range'){st.range=t.dataset.v;saveView();load()}
    else if(a==='band'){st.band=t.dataset.v;saveView();load()}
    else if(a==='reload')load();
    else if(a==='again'){st.view='login';st.msg='';render()}
    else if(a==='signout'){client().auth.signOut().catch(()=>{}).then(()=>{st.email='';st.data=null;st.view='login';render()})}
  });
  root.addEventListener('submit',e=>{if(e.target.id==='login'){e.preventDefault();sendLink((document.getElementById('email')||{}).value)}});

  /* ---------- start ---------- */
  (async()=>{
    if(!configured){st.view='config';return render()}
    if(!window.supabase||!window.supabase.createClient){st.view='nolib';return render()}
    /* an expired or reused link comes back with an error in the address */
    const h=new URLSearchParams(location.hash.slice(1));
    if(h.get('error_description')){st.msg=h.get('error_description').replace(/\+/g,' ')+'. Request a new link.';history.replaceState(null,'',location.pathname)}
    const c=client();
    c.auth.onAuthStateChange((ev,session)=>{setTimeout(()=>onSession(session),0)});
    try{const {data}=await within(c.auth.getSession(),10000);onSession(data&&data.session)}
    catch(e){st.view='login';render()}
  })();
})();
