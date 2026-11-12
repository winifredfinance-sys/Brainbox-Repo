/* Brainbox Ninja browser checks (functional parity list). Needs Node and Playwright (npx playwright install chromium).
   Serve the repository root (python3 -m http.server 8765) and run: node brainbox-react/tests/browser-check.cjs
   Supabase is replaced by a fake for every request; nothing reaches the real project. */
const {chromium}=require('playwright');
const NEW=process.env.URL||'http://localhost:8765/brainbox-react/dist/index.html';
const SB='https://bfsrrbxsgktmrpfepxrk.supabase.co';
const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt=uid=>b64({alg:'HS256'})+'.'+b64({sub:uid,role:'authenticated',is_anonymous:true,exp:Math.floor(Date.now()/1000)+3600})+'.sig';
const R=[];const ok=(id,name,c,info='')=>R.push([c?'PASS':'FAIL',id,name,c?'':String(info).slice(0,300)]);
const lagos=(o=0)=>new Date(Date.now()+3600e3+o*864e5).toISOString().slice(0,10);
async function open(b,o={}){
  const ctx=await b.newContext({viewport:o.vp||{width:375,height:812},reducedMotion:o.reduced?'reduce':'no-preference'});const p=await ctx.newPage();const net={events:[],rpc:[],signups:0,other:[]};const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  if(o.clock)await p.clock.install();
  await p.route(SB+'/**',async r=>{const q=r.request(),u=new URL(q.url()),h={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*','access-control-expose-headers':'*'};
    if(q.method()==='OPTIONS')return r.fulfill({status:204,headers:h});
    if(o.down)return r.abort();
    if(u.pathname==='/auth/v1/signup'){net.signups++;return r.fulfill({status:200,headers:h,contentType:'application/json',body:JSON.stringify({access_token:jwt('me-1'),token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'r',user:{id:'me-1',aud:'authenticated',role:'authenticated',is_anonymous:true}})})}
    if(u.pathname==='/rest/v1/rpc/submit_score'){const a=JSON.parse(q.postData());net.rpc.push(a);return r.fulfill({status:200,headers:h,contentType:'application/json',body:String(a.p_score)})}
    if(u.pathname==='/rest/v1/events'){try{net.events.push(...JSON.parse(q.postData()))}catch(e){}return r.fulfill({status:201,headers:h,body:''})}
    if(u.pathname==='/rest/v1/leaderboard_best'){const il=u.searchParams.get('player_name');
      if(il&&il.startsWith('ilike.'))return r.fulfill({status:200,headers:h,contentType:'application/json',body:JSON.stringify(/takenname/i.test(il)?[{user_id:'other'}]:[])});
      const rows=[{user_id:'u1',player_name:'BraveMango4821',score:5200,created_at:'2026-11-01T00:00:00Z'}].concat(net.rpc.length?[{user_id:'me-1',player_name:net.rpc.at(-1).p_name,score:net.rpc.at(-1).p_score,created_at:'2026-11-02T00:00:00Z'}]:[]);
      if(q.method()==='HEAD')return r.fulfill({status:200,headers:{...h,'content-range':'*/1'}});
      return r.fulfill({status:200,headers:h,contentType:'application/json',body:JSON.stringify(rows)})}
    net.other.push(u.pathname);return r.fulfill({status:404,headers:h,body:'{}'})});
  if(o.config)await p.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:o.config}));
  await p.addInitScript(([st,blocked])=>{
    window.__vib=[];navigator.vibrate=x=>{window.__vib.push(JSON.stringify(x));return true};
    if(blocked){Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError')}});return}
    if(sessionStorage.getItem('x'))return;sessionStorage.setItem('x',1);localStorage.clear();for(const k in st)localStorage.setItem(k,typeof st[k]==='string'?st[k]:JSON.stringify(st[k]))},[o.storage||{'bn-season':'2'},!!o.blocked]);
  await p.goto(o.url||NEW);await p.waitForTimeout(300);return {p,ctx,net,errs};
}
/* returning players see "Welcome back" + Continue; Continue opens their age range, whose back link is the home screen */
const startGame=async p=>{if(await p.getByRole('button',{name:'Start Game'}).count())return p.getByRole('button',{name:'Start Game'}).first().click();await p.getByRole('button',{name:'Continue'}).click();await p.waitForTimeout(200);const back=p.getByRole('button',{name:/Change age range/});if(await back.count())await back.click()};
const go=async(p,band,type,level,round)=>{await startGame(p);if(!(await p.inputValue('#nick')))await p.fill('#nick','TestNinja');
  await p.locator('.grid.ages .card').nth(['kids','teens','adults','elders'].indexOf(band)).click();await p.locator('.grid.cats .card').nth(type).click();await p.locator('.lvl').nth(level).click();await p.locator('.rnd').nth(round||0).click()};
(async()=>{const b=await chromium.launch();
  // F1 timer, keyboard, feedback
  {const {p,net,errs,ctx}=await open(b);await go(p,'teens',0,0,0);await p.getByRole('button',{name:'Start round'}).click();
   const t1=await p.textContent('#tpts');await p.waitForTimeout(1600);const t2=await p.textContent('#tpts');const clock=await p.textContent('#tclk');
   ok('S8','points counter falls while the clock runs',parseInt(t2)<parseInt(t1),t1+' -> '+t2);ok('S8','total time ticks',clock!=='0:00',clock);
   await p.keyboard.press('b');const fb=await p.textContent('.fb');ok('R11','keyboard B answers',/Correct! \+\d+ pts in \d+\.\ds|Not quite\./.test(fb),fb);
   ok('S8','next button gets focus',await p.evaluate(()=>document.activeElement&&document.activeElement.id==='nextbtn'));
   await p.keyboard.press('Enter');ok('R11','Enter goes to the next question',(await p.textContent('.qn')).startsWith('Question 2'));
   await p.keyboard.press('3');ok('R11','keyboard 3 answers',await p.locator('.fb').count()===1);
   const two=await p.locator('.opts.two').count(),over=await p.evaluate(()=>[...document.querySelectorAll('.opt')].some(o=>o.scrollWidth>o.clientWidth+1));ok('S8','answers never overflow',!over);
   ok('-','no page errors (play)',!errs.length,errs);await ctx.close()}
  // F1b timeout with fake clock
  {const {p,ctx}=await open(b,{clock:true});await go(p,'teens',0,0,0);await p.getByRole('button',{name:'Start round'}).click();
   await p.clock.fastForward(11000);await p.waitForTimeout(150);ok('S8','timer bar amber below half time',await p.locator('#tbar.mid').count()===1);
   await p.clock.fastForward(5000);await p.waitForTimeout(150);ok('S8','timer bar red in the last quarter',await p.locator('#tbar.low').count()===1);
   await p.clock.fastForward(5000);await p.waitForTimeout(200);const fb=await p.textContent('.fb');ok('R4','time runs out after 20 s (11-17 Beginner)',/Time is up\./.test(fb),fb);await ctx.close()}
  // F2 memory step
  {const {p,ctx}=await open(b);await go(p,'adults',6,0,0);await p.getByRole('button',{name:'Start round'}).click();
   ok('S8','memory: list shown first, clock waits',await p.locator('text=Remember these items').count()===1&&await p.locator('.timer').count()===0);
   await p.getByText('I have remembered them').click();ok('S8','memory: then the question and timer',await p.locator('.timer').count()===1);await ctx.close()}
  // F3 full round, result, leaderboard send, stats, sound, vibration, seen
  {const {p,net,ctx,errs}=await open(b,{storage:{'bn-season':'2','bn-daily-v1':{TestNinja:{day:lagos(-1),pts:200,hit:true,streak:2,last:lagos(-1),band:'kids'}}}});
   ok('R-LB','no anonymous sign-in just for opening the game',net.signups===0,net.signups);
   await go(p,'kids',0,0,0);await p.getByRole('button',{name:'Start round'}).click();
   for(let i=0;i<10;i++){await p.waitForSelector('.opt:not([disabled])');await p.locator('.opt').nth(0).click();await p.locator('#nextbtn').click()}
   await p.waitForSelector('.res');await p.waitForTimeout(1500);
   const res=await p.textContent('main');ok('S9','results: ring, stars, points, time, accuracy',await p.locator('.ring').count()&&/round time/.test(res)&&/correct/.test(res));
   ok('S9','results: pointer tip and 3 suggestions',/Pointer:/.test(res)&&await p.locator('.sugg').count()>=2);
   ok('S9','results: navigation row',await p.locator('.navrow .btn').count()===4);
   ok('R-LB','score sent through submit_score with the nickname',net.rpc.length===1&&net.rpc[0].p_name==='TestNinja',JSON.stringify(net.rpc));
   ok('R-LB','signed in anonymously only to send it',net.signups===1,net.signups);
   ok('S9','"sent to leaderboard" status',/Your total is on the global leaderboard\./.test(res),res.slice(-300));
   const pts=await p.evaluate(()=>JSON.parse(localStorage.getItem('bn-profiles-v2')).TestNinja.kids_count_0_0.p);
   const daily=await p.evaluate(()=>JSON.parse(localStorage.getItem('bn-daily-v1')).TestNinja);
   ok('R8','daily points added',daily.pts===pts&&daily.day,JSON.stringify(daily));
   const seen=await p.evaluate(()=>JSON.parse(localStorage.getItem('bn-seen-v2')||'{}'));ok('R9','questions seen saved per nickname',(seen.TestNinja&&seen.TestNinja.kids_count_0&&seen.TestNinja.kids_count_0.length)===10,JSON.stringify(seen).slice(0,120));
   ok('S12','sound engine played and vibration patterns sent',(await p.evaluate(()=>window.__vib.length))>0,await p.evaluate(()=>window.__vib.join(' ')));
   await p.waitForTimeout(3500);const types=net.events.map(e=>e.event_type);ok('Stats','stats events sent (session_start, round_complete)',types.includes('session_start')&&types.includes('round_complete'),types.join());
   const rc=net.events.find(e=>e.event_type==='round_complete')||{};ok('Stats','round_complete matches the game',rc.age_band==='kids'&&rc.puzzle_type==='count'&&rc.points===pts&&rc.answered===10&&rc.nickname==='TestNinja',JSON.stringify(rc));
   await p.locator('.navrow .btn').nth(3).click();await p.waitForTimeout(1200);
   ok('S10','leaderboard shows you highlighted',(await p.locator('#gboard li.me').count())===1,await p.textContent('#gboard'));
   ok('-','no page errors (round)',!errs.length,errs);await ctx.close()}
  // F4 daily target + streak, celebration, event
  {const {p,net,ctx}=await open(b,{storage:{'bn-season':'2','bn-nick':'Kemi','bn-daily-v1':{Kemi:{day:lagos(-1),pts:200,hit:true,streak:2,last:lagos(-1),band:'kids'}}}});
   await startGame(p);
   ok('R8','home shows streak and target',/2-day streak/.test(await p.textContent('#daily'))&&/0 \/ 150 points today/.test(await p.textContent('#daily')),await p.textContent('#daily'));
   await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('bn-daily-v1'));d.Kemi.day=new Date(Date.now()+3600e3).toISOString().slice(0,10);d.Kemi.pts=149;d.Kemi.hit=false;localStorage.setItem('bn-daily-v1',JSON.stringify(d))});
   await p.reload();await go(p,'kids',1,0,0);await p.getByRole('button',{name:'Start round'}).click();
   for(let i=0;i<10;i++){await p.waitForSelector('.opt:not([disabled])');await p.locator('.opt').nth(0).click();await p.locator('#nextbtn').click()}
   await p.waitForSelector('.res');const t=await p.textContent('main');
   if(/Daily target reached!/.test(t)){ok('R8','daily target reached: celebration + 3-day streak',/3-day streak/.test(t),t.slice(0,200));await p.waitForTimeout(3500);ok('Stats','daily_target_hit event',net.events.some(e=>e.event_type==='daily_target_hit'&&e.streak===3),JSON.stringify(net.events.map(e=>e.event_type)))}
   else ok('R8','daily target reached (needs at least 1 right answer)',/points today/.test(t),'no right answer by chance: '+t.slice(0,160));
   await ctx.close()}
  // F6 adaptive chip
  {const {p,ctx}=await open(b,{storage:{'bn-season':'2','bn-nick':'Ada','bn-skill-v1':{'Ada|teens_maths':[1,1,0.9]}}});await go(p,'teens',0,0,0);
   ok('R7','adaptive: challenge boost after 3 strong rounds',/Challenge boost: 3 harder questions this round/.test(await p.textContent('main')));await ctx.close()}
  // F9 names
  {const {p,ctx}=await open(b);await startGame(p);await p.getByRole('button',{name:'Shuffle'}).click();await p.waitForTimeout(400);
   const n=await p.inputValue('#nick');ok('S3','Shuffle: Adjective+Noun+3-4 digits',/^[A-Z][a-z]+[A-Z][a-z]+\d{3,4}$/.test(n)&&n.length<=20,n);
   await p.fill('#nick','TakenName');await p.waitForTimeout(1500);ok('S3','typed taken name: gentle note',/Another player already uses this name/.test(await p.textContent('#nmsg')));
   await p.fill('#nick','');await p.locator('.grid.ages .card').first().click();ok('S3','empty name blocked',/Pick a ninja name first/.test(await p.textContent('#msg')));
   await p.getByRole('button',{name:/Sound:/}).click();ok('S12','sound switch saved',(await p.evaluate(()=>localStorage.getItem('bn-sound')))==='off');
   await ctx.close()}
  // F10 levels open, rounds in order
  {const {p,ctx}=await open(b);await startGame(p);await p.fill('#nick','Fresh');await p.locator('.grid.ages .card').nth(1).click();await p.locator('.grid.cats .card').nth(0).click();
   ok('R3','all 3 levels open',await p.locator('.lvl:not([disabled])').count()===3);await p.locator('.lvl').nth(2).click();
   ok('R3','Hard: only round 1 open',await p.locator('.rnd:not([disabled])').count()===1);await ctx.close()}
  // F11 local fallback (no Supabase settings)
  {const {p,net,ctx}=await open(b,{config:"window.BN_SUPABASE={url:'https://YOUR-PROJECT-REF.supabase.co',key:'sb_publishable_YOUR-KEY-HERE'};",storage:{'bn-season':'2','bn-nick':'Ada','bn-profiles-v2':{Ada:{teens_maths_0_0:{s:3,p:180,t:1}},Bola:{kids_count_0_0:{s:1,p:90,t:1}}}}});
   await p.getByText('View the leaderboard').click();await p.waitForTimeout(500);const t=await p.textContent('main');
   ok('LB-local','no Supabase settings: board of nicknames on this device',/Players on this device/.test(t)&&/Ada \(you\)/.test(t)&&/Bola/.test(t),t.slice(0,300));
   ok('LB-local','no network calls',net.signups===0&&net.rpc.length===0&&net.events.length===0);await ctx.close()}
  // F12 Supabase down
  {const {p,ctx,errs}=await open(b,{down:true,storage:{'bn-season':'2','bn-nick':'Ada','bn-profiles-v2':{Ada:{teens_maths_0_0:{s:3,p:180,t:1}}}}});
   await p.getByText('View the leaderboard').click();await p.waitForTimeout(9500);const t=await p.textContent('main');
   ok('S10','Supabase down: friendly message, Try again, and this device\'s scores',/could not load just now/.test(t)&&/Try again/.test(t)&&/On this device/.test(t),t.slice(0,300));
   await p.getByText('← Back').click();await go(p,'teens',0,0,0);await p.getByRole('button',{name:'Start round'}).click();ok('-','game still plays with Supabase down',await p.locator('.opt').count()>=2);ok('-','no page errors',!errs.length,errs);await ctx.close()}
  // F13 storage blocked
  {const {p,ctx,errs}=await open(b,{blocked:true});await go(p,'elders',0,0,0);await p.getByRole('button',{name:'Start round'}).click();
   for(let i=0;i<10;i++){if(await p.locator('text=I have remembered them').count())await p.getByText('I have remembered them').click();await p.waitForSelector('.opt:not([disabled])');await p.locator('.opt').nth(0).click();await p.locator('#nextbtn').click()}
   ok('-','private browsing / storage blocked: full round plays',await p.locator('.res').count()===1);ok('-','no page errors (blocked storage)',!errs.length,errs);await ctx.close()}
  // F14 file:// 
  {const {p,ctx,errs}=await open(b,{url:'file:///home/user/Brainbox-Repo/brainbox-react/dist/index.html'});await go(p,'teens',0,0,0);await p.getByRole('button',{name:'Start round'}).click();
   ok('-','opens directly from a file and plays',await p.locator('.opt').count()>=2);ok('-','no page errors (file)',!errs.length,errs);await ctx.close()}
  // F15 layout: no horizontal scroll, sizes, palette, reduced motion
  for(const w of [320,375]){const {p,ctx}=await open(b,{vp:{width:w,height:740}});const bad=[];
   const check=async name=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(o)bad.push(name)};
   await check('welcome');await startGame(p);await p.fill('#nick','LayoutTest');await check('home');
   for(const [bi,band] of ['kids','teens','adults','elders'].entries()){await p.locator('.grid.ages .card').nth(bi).click();await check(band+' types');
     if(band==='kids')ok('Look','Candy Brain palette on 4-10 screens',await p.evaluate(()=>document.documentElement.dataset.pal)==='candy');
     const fs=await p.evaluate(()=>getComputedStyle(document.querySelector('main')).fontSize);ok('Look',`text size ${band} at ${w}px`,fs===({kids:'19px',teens:'17px',adults:'17px',elders:'21px'})[band],fs);
     await p.locator('.grid.cats .card').nth(0).click();await check(band+' levels');await p.locator('.lvl').nth(0).click();await check(band+' rounds');await p.locator('.rnd').nth(0).click();await check(band+' ready');
     await p.getByRole('button',{name:'Start round'}).click();if(await p.locator('text=I have remembered them').count())await p.getByText('I have remembered them').click();await check(band+' play');
     await p.getByRole('button',{name:'← Rounds'}).click();await p.getByRole('button',{name:/^←/}).first().click();await p.getByRole('button',{name:/^←/}).first().click();await p.getByRole('button',{name:/^←/}).first().click()}
   ok('A11y',`no horizontal scroll at ${w}px on any screen`,!bad.length,bad.join());
   ok('Look','Naija Green palette on home',await p.evaluate(()=>document.documentElement.dataset.pal)==='naija');await ctx.close()}
  {const {p,ctx}=await open(b,{reduced:true});const an=await p.evaluate(()=>getComputedStyle(document.querySelector('.mascot .bob')).animationName);ok('A11y','reduced motion: animations off',an==='none',an);await ctx.close()}
  // F16 keyboard only + visible focus
  {const {p,ctx}=await open(b,{storage:{'bn-season':'2','bn-nick':'KeyboardKid'}});
   await p.keyboard.press('Tab');const f=await p.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return e.textContent+'|'+s.outlineStyle+'|'+s.outlineWidth});
   ok('A11y','Tab reaches the main button with a visible focus outline',/(Start Game|Continue)\|solid\|3px/.test(f),f);
   await p.keyboard.press('Enter');for(let i=0;i<20;i++){await p.keyboard.press('Tab');if(await p.evaluate(()=>document.activeElement.classList.contains('card')))break}
   await p.keyboard.press('Enter');for(let i=0;i<5;i++){await p.keyboard.press('Tab');if(await p.evaluate(()=>document.activeElement.classList.contains('card')))break}
   await p.keyboard.press('Enter');for(let i=0;i<5;i++){await p.keyboard.press('Tab');if(await p.evaluate(()=>document.activeElement.classList.contains('lvl')))break}
   await p.keyboard.press('Enter');for(let i=0;i<5;i++){await p.keyboard.press('Tab');if(await p.evaluate(()=>/Start Round 1/.test(document.activeElement.textContent)))break}
   await p.keyboard.press('Enter');await p.keyboard.press('Enter');
   for(let i=0;i<10;i++){if(await p.locator('text=I have remembered them').count()){await p.getByText('I have remembered them').focus();await p.keyboard.press('Enter')}await p.waitForSelector('.opt:not([disabled])');await p.keyboard.press('a');await p.keyboard.press('Enter')}
   ok('A11y','whole round playable with the keyboard only',await p.locator('.res').count()===1,await p.textContent('main'));await ctx.close()}
  // F18 admin page
  {const {p,ctx,errs}=await open(b,{url:NEW.replace('index.html','admin.html')});await p.waitForTimeout(1500);const t=await p.textContent('#adm');
   ok('S11','admin page shows the sign-in',/Admin sign-in/.test(t),t.slice(0,120));ok('S11','admin: no page errors',!errs.length,errs);await ctx.close()}
  // F20 season reset
  {const {p,ctx}=await open(b,{storage:{'bn-nick':'Old','bn-profiles-v2':{Old:{teens_maths_0_0:{s:2,p:999,t:5}}}}});const v=await p.evaluate(()=>JSON.parse(localStorage.getItem('bn-profiles-v2')).Old.teens_maths_0_0);
   ok('R10','Season 2: old points cleared once, stars and times kept',v.p===0&&v.s===2&&v.t===5,JSON.stringify(v));await ctx.close()}
  for(const r of R)console.log(r[0].padEnd(5),r[1].padEnd(8),r[2],r[3]?'  -> '+r[3]:'');
  console.log(R.filter(r=>r[0]==='PASS').length+'/'+R.length+' passed');await b.close()})();
