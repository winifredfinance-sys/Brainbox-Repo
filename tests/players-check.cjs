/* Player profiles checks (first visit, returning visit, session timeout, switching and adding players, storage blocked,
   existing players moved over, player id with leaderboard scores). Needs Node + Playwright.
   Serve the repository root (python3 -m http.server 8765), then: node tests/players-check.cjs */
const {chromium}=require('playwright');
const URL0=process.env.URL||'http://localhost:8765/index.html';
const R=[];const ok=(id,n,c,i='')=>R.push([c?'PASS':'FAIL',id,n,c?'':String(i).slice(0,260)]);
const LSget=(p,k)=>p.evaluate(k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return localStorage.getItem(k)}},k);
async function open(b,o={}){
  const ctx=await b.newContext({viewport:o.vp||{width:375,height:812}});const p=await ctx.newPage();const errs=[],rpc=[];
  p.on('pageerror',e=>errs.push(e.message));
  if(o.clock)await p.clock.install();
  await p.route('https://**.supabase.co/**',r=>{const u=r.request().url(),h={'access-control-allow-origin':'*','access-control-allow-headers':'*'};
    if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:h});
    if(/auth\/v1\/signup/.test(u)){const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');return r.fulfill({status:200,headers:h,contentType:'application/json',body:JSON.stringify({access_token:b64({alg:'x'})+'.'+b64({sub:'u1',exp:Math.floor(Date.now()/1000)+3600})+'.s',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'r',user:{id:'u1'}})})}
    if(/rpc\/submit_score/.test(u)){rpc.push(JSON.parse(r.request().postData()));return r.fulfill({status:200,headers:h,contentType:'application/json',body:'100'})}
    if(/rest\/v1\/events/.test(u))return r.fulfill({status:201,headers:h,body:''});
    return r.fulfill({status:200,headers:h,contentType:'application/json',body:'[]'})});
  if(o.config)await p.route('**/js/config.js*',r=>r.fulfill({contentType:'text/javascript',body:o.config}));
  await p.addInitScript(([st,blocked])=>{
    if(blocked){Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError')}});return}
    if(sessionStorage.getItem('seeded'))return;sessionStorage.setItem('seeded','1');localStorage.clear();for(const k in st)localStorage.setItem(k,typeof st[k]==='string'?st[k]:JSON.stringify(st[k]))},[o.storage||{},!!o.blocked]);
  await p.goto(URL0);await p.waitForTimeout(300);return {p,ctx,errs,rpc};
}
const play=async(p,right=true)=>{await p.click('[data-a="go"]');for(let i=0;i<10;i++){if(await p.locator('[data-a="memodone"]').count())await p.click('[data-a="memodone"]');await p.waitForSelector('.opt:not([disabled])');const k=await p.evaluate(r=>r?S.qs[S.i].ans:(S.qs[S.i].ans+1)%S.qs[S.i].opts.length,right);await p.click(`[data-a="pick"][data-k="${k}"]`);await p.click('#nextbtn')}};
(async()=>{const b=await chromium.launch();
 // 1 first visit
 {const {p,ctx,errs}=await open(b);const t=await p.textContent('main');
  ok('1','first visit: normal title screen with Start Game',/Start Game/.test(t)&&!/Welcome back/.test(t));
  await p.click('[data-a="start"]');ok('1','privacy note under the nickname box',(await p.textContent('.panel')).includes('Your nickname and progress are saved on this device only. No email or personal info needed.'));
  ok('1','no "saved player" link yet',await p.locator('[data-a="players"]').count()===0);
  await p.fill('#nick','MamaAda');await p.click('[data-a="band"][data-b="adults"]');
  const pl=await LSget(p,'brainbox_players'),last=await p.evaluate(()=>localStorage.getItem('brainbox_last'));
  ok('1','profile saved: id (UUID), nickname, ageBand, progress, createdAt',pl&&pl.length===1&&/^[0-9a-f-]{36}$/.test(pl[0].id)&&pl[0].nickname==='MamaAda'&&pl[0].ageBand==='adults'&&pl[0].progress&&pl[0].createdAt,JSON.stringify(pl));
  ok('1','last player saved',last===pl[0].id);
  await p.click('.grid.cats .card >> nth=1');await p.click('[data-a="level"][data-l="1"]');await p.click('[data-a="round"][data-r="0"]');await play(p);
  const pl2=await LSget(p,'brainbox_players');ok('1','progress saved after a round (type, level, round, points)',pl2[0].progress.type==='maths'&&pl2[0].progress.level===1&&pl2[0].progress.totalPoints>0,JSON.stringify(pl2[0].progress));
  // 2 returning visit
  await p.reload();await p.waitForTimeout(300);const w=await p.textContent('main');
  ok('2','returning visit: "Welcome back, MamaAda!" with Continue and Switch player',/Welcome back, MamaAda!/.test(w)&&await p.locator('[data-a="continue"]').count()===1&&/Not you\? Switch player/.test(w),w.slice(0,200));
  ok('2','no new nickname asked',await p.locator('#nick').count()===0);
  await p.click('[data-a="continue"]');ok('2','Continue goes back to the level they were playing',await p.evaluate(()=>S.screen+'/'+S.band+'/'+S.cat+'/'+S.level)==='rounds/adults/maths/1',await p.evaluate(()=>S.screen+'/'+S.band+'/'+S.cat+'/'+S.level));
  ok('2','progress still there',(await p.textContent('main')).includes('1 of 10 rounds passed'));
  ok('-','no page errors',!errs.length,errs);await ctx.close()}
 // 3 session timeout
 {const {p,ctx,errs}=await open(b,{clock:true,storage:{'bn-season':'2'}});
  await p.click('[data-a="start"]');await p.fill('#nick','TimeoutTest');await p.click('[data-a="band"][data-b="teens"]');await p.click('.grid.cats .card >> nth=0');await p.click('[data-a="level"][data-l="0"]');await p.click('[data-a="round"][data-r="0"]');await p.click('[data-a="go"]');
  await p.click('[data-a="pick"] >> nth=0');await p.click('#nextbtn');
  const hide=async(ms)=>{await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'))});await p.clock.fastForward(ms);await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(100)};
  await hide(5*60*1000);ok('3','5 minutes away: still in the round',await p.evaluate(()=>S.screen)==='play');
  await hide(31*60*1000);const st=await p.evaluate(()=>({screen:S.screen,qs:S.qs.length,i:S.i,score:S.score,pts:S.pts,live:S.live,nick:NICK}));
  ok('3','after 31 minutes: round state reset (timer, questions, score)',st.qs===0&&st.i===0&&st.score===0&&st.pts===0&&!st.live,JSON.stringify(st));
  ok('3','profile and nickname kept, "Welcome back, TimeoutTest!" shown',st.screen==='welcome'&&st.nick==='TimeoutTest'&&/Welcome back, TimeoutTest!/.test(await p.textContent('main'))&&(await LSget(p,'brainbox_players')).length===1);
  ok('3','abandoned round reported to stats',await p.evaluate(()=>JSON.parse(localStorage.getItem('bn-q-v1')||'[]').some(e=>e.event_type==='round_abandoned')));
  ok('-','no page errors',!errs.length,errs);await ctx.close()}
 // 4+5 switching players and adding a second player
 {const {p,ctx,errs}=await open(b);await p.click('[data-a="start"]');await p.fill('#nick','MamaAda');await p.click('[data-a="band"][data-b="adults"]');await p.click('.grid.cats .card >> nth=0');await p.click('[data-a="level"][data-l="0"]');await p.click('[data-a="round"][data-r="0"]');await play(p);
  await p.reload();await p.click('[data-a="players"]');ok('5','Switch player lists saved profiles + Add new player',await p.locator('.pcard').count()===1&&await p.locator('[data-a="addplayer"]').count()===1);
  await p.click('[data-a="addplayer"]');ok('5','Add new player opens an empty name box',(await p.inputValue('#nick'))==='');
  await p.fill('#nick','LittleTobi');await p.click('[data-a="band"][data-b="kids"]');
  ok('5','second player saved with their own age band',(await LSget(p,'brainbox_players')).map(x=>x.nickname+':'+x.ageBand).sort().join()==='LittleTobi:kids,MamaAda:adults');
  await p.click('.grid.cats .card >> nth=0');await p.click('[data-a="level"][data-l="0"]');await p.click('[data-a="round"][data-r="0"]');await play(p,false);
  await p.reload();await p.waitForTimeout(200);
  ok('5','reload welcomes back the last player, in Candy Brain colours for 4-10',/Welcome back, LittleTobi!/.test(await p.textContent('main'))&&await p.evaluate(()=>document.documentElement.dataset.pal)==='candy');
  await p.click('[data-a="players"]');ok('4','Switch player shows both, one tap each',await p.locator('.pcard').count()===2);
  await p.screenshot({path:'/tmp/claude-0/-home-user-Brainbox-Repo/30cadd34-1da8-50cd-a760-0ffc92fbc6bb/scratchpad/players-375.png',fullPage:true});
  await p.click('.pcard:has-text("MamaAda")');const s=await p.evaluate(()=>({nick:NICK,band:S.band,screen:S.screen,total:totals().total}));
  ok('4','one tap switches to MamaAda with her own age band and progress',s.nick==='MamaAda'&&s.band==='adults'&&s.screen==='rounds'&&s.total>0,JSON.stringify(s));
  ok('4','LittleTobi keeps separate progress',await p.evaluate(()=>totalsOf(ALL.LittleTobi||{}).total)===0);
  ok('4','last player is now MamaAda',(await p.evaluate(()=>localStorage.getItem('brainbox_last')))===(await LSget(p,'brainbox_players')).find(x=>x.nickname==='MamaAda').id);
  ok('-','no sideways scroll',!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)));
  ok('-','no page errors',!errs.length,errs);await ctx.close()}
 // 6 storage blocked
 {const {p,ctx,errs}=await open(b,{blocked:true});await p.click('[data-a="start"]');await p.fill('#nick','PrivateMode');await p.click('[data-a="band"][data-b="elders"]');
  await p.click('.grid.cats .card >> nth=0');await p.click('[data-a="level"][data-l="0"]');await p.click('[data-a="round"][data-r="0"]');await play(p);
  ok('6','storage blocked: full round plays',await p.evaluate(()=>S.screen)==='result');
  await p.click('.navrow [data-a="home"]');await p.click('[data-a="welcome"]');ok('6','storage blocked: profile kept in memory for the visit',/Welcome back, PrivateMode!/.test(await p.textContent('main')));
  ok('6','no page errors',!errs.length,errs);await ctx.close()}
 // migration of existing players
 {const {p,ctx}=await open(b,{storage:{'bn-season':'2','bn-nick':'OldKemi','bn-profiles-v2':{OldKemi:{teens_maths_0_0:{s:2,p:0,t:5}},Dad:{adults_money_0_0:{s:1,p:0,t:9}}}}});
  const t=await p.textContent('main'),pl=await LSget(p,'brainbox_players');
  ok('M','existing players (from before this update) are welcomed back',/Welcome back, OldKemi!/.test(t),t.slice(0,120));
  ok('M','profiles made for every nickname on the device, age band guessed',pl.map(x=>x.nickname+':'+x.ageBand).sort().join()==='Dad:adults,OldKemi:teens',JSON.stringify(pl));await ctx.close()}
 // leaderboard readiness
 {const {p,ctx,rpc}=await open(b,{config:"window.BN_SUPABASE={url:'https://bfsrrbxsgktmrpfepxrk.supabase.co',key:'sb_publishable_test',sendPlayerId:true};"});
  await p.click('[data-a="start"]');await p.fill('#nick','IdTest');await p.click('[data-a="band"][data-b="teens"]');await p.click('.grid.cats .card >> nth=0');await p.click('[data-a="level"][data-l="0"]');await p.click('[data-a="round"][data-r="0"]');await play(p);await p.waitForTimeout(1500);
  const id=(await LSget(p,'brainbox_players'))[0].id;ok('L','with sendPlayerId on, the score carries the player id',rpc.length===1&&rpc[0].p_player===id,JSON.stringify(rpc));await ctx.close()}
 {const {p,ctx,rpc}=await open(b,{config:"window.BN_SUPABASE={url:'https://bfsrrbxsgktmrpfepxrk.supabase.co',key:'sb_publishable_test'};"});
  await p.click('[data-a="start"]');await p.fill('#nick','IdTest2');await p.click('[data-a="band"][data-b="teens"]');await p.click('.grid.cats .card >> nth=0');await p.click('[data-a="level"][data-l="0"]');await p.click('[data-a="round"][data-r="0"]');await play(p);await p.waitForTimeout(1500);
  ok('L','by default today\'s database call is unchanged',rpc.length===1&&!('p_player' in rpc[0]),JSON.stringify(rpc));await ctx.close()}
 for(const r of R)console.log(r[0].padEnd(5),r[1].padEnd(2),r[2],r[3]?'  -> '+r[3]:'');console.log(R.filter(r=>r[0]==='PASS').length+'/'+R.length+' passed');await b.close()})();
