/* Player profiles checks for the React build (same cases as tests/players-check.cjs in the repository root).
   Build, serve the repository root (python3 -m http.server 8765), then: node brainbox-react/tests/players-check.cjs */
const {chromium}=require('playwright');
const URL0='http://localhost:8765/brainbox-react/dist/index.html';
const R=[];const ok=(id,n,c,i='')=>R.push([c?'PASS':'FAIL',id,n,c?'':String(i).slice(0,240)]);
const J=(p,k)=>p.evaluate(k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return localStorage.getItem(k)}},k);
async function open(b,o={}){const ctx=await b.newContext({viewport:{width:375,height:812}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  if(o.clock)await p.clock.install();await p.route('https://**.supabase.co/**',r=>r.abort());
  await p.addInitScript(([st,blk])=>{if(blk){Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('b','SecurityError')}});return}if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s',1);localStorage.clear();for(const k in st)localStorage.setItem(k,JSON.stringify(st[k]))},[o.storage||{},!!o.blocked]);
  await p.goto(URL0);await p.waitForTimeout(300);return {p,ctx,errs}}
const to=async(p,band,ti,l)=>{await p.locator('.grid.ages .card').nth(['kids','teens','adults','elders'].indexOf(band)).click();await p.locator('.grid.cats .card').nth(ti).click();await p.locator('.lvl').nth(l).click();await p.locator('.rnd').first().click()};
const play=async p=>{await p.getByRole('button',{name:'Start round'}).click();for(let i=0;i<10;i++){if(await p.getByText('I have remembered them').count())await p.getByText('I have remembered them').click();await p.waitForSelector('.opt:not([disabled])');await p.locator('.opt').first().click();await p.locator('#nextbtn').click()}await p.waitForSelector('.res')};
(async()=>{const b=await chromium.launch();
 {const {p,ctx,errs}=await open(b);ok('1','first visit: Start Game, no welcome back',/Start Game/.test(await p.textContent('main'))&&!/Welcome back/.test(await p.textContent('main')));
  await p.getByRole('button',{name:'Start Game'}).click();ok('1','privacy note',(await p.textContent('main')).includes('Your nickname and progress are saved on this device only. No email or personal info needed.'));
  await p.fill('#nick','MamaAda');await to(p,'adults',1,1);const pl=await J(p,'brainbox_players');
  ok('1','profile with UUID, nickname, ageBand, createdAt; last set',pl.length===1&&/^[0-9a-f-]{36}$/.test(pl[0].id)&&pl[0].ageBand==='adults'&&(await p.evaluate(()=>localStorage.getItem('brainbox_last')))===pl[0].id,JSON.stringify(pl));
  await play(p);ok('1','progress saved after a round',(await J(p,'brainbox_players'))[0].progress.type==='maths');
  await p.reload();await p.waitForTimeout(300);ok('2','returning: Welcome back, MamaAda! + Continue + Switch',/Welcome back, MamaAda!/.test(await p.textContent('main'))&&/Not you\? Switch player/.test(await p.textContent('main')));
  await p.getByRole('button',{name:'Continue'}).click();ok('2','Continue opens the Medium rounds of Mental Maths',/Medium level/.test(await p.textContent('main')));
  ok('-','no page errors',!errs.length,errs);await ctx.close()}
 {const {p,ctx,errs}=await open(b,{clock:true});await p.getByRole('button',{name:'Start Game'}).click();await p.fill('#nick','TimeoutTest');await to(p,'teens',0,0);await p.getByRole('button',{name:'Start round'}).click();
  const hide=async ms=>{await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'))});await p.clock.fastForward(ms);await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(150)};
  await hide(5*60e3);ok('3','5 min away: still in the round',await p.locator('.qcard .qn').count()===1);
  await hide(31*60e3);ok('3','31 min away: round dropped, Welcome back, TimeoutTest!',/Welcome back, TimeoutTest!/.test(await p.textContent('main'))&&(await J(p,'brainbox_players')).length===1);
  await p.getByRole('button',{name:'Continue'}).click();await p.locator('.rnd').first().click();ok('3','a fresh round can start (old round state gone)',/Get ready/.test(await p.textContent('main')));
  ok('-','no page errors',!errs.length,errs);await ctx.close()}
 {const {p,ctx,errs}=await open(b);await p.getByRole('button',{name:'Start Game'}).click();await p.fill('#nick','MamaAda');await to(p,'adults',0,0);await play(p);
  await p.reload();await p.getByRole('button',{name:/Switch player/}).click();await p.getByRole('button',{name:'+ Add new player'}).click();ok('5','Add new player: empty name box',(await p.inputValue('#nick'))==='');
  await p.fill('#nick','LittleTobi');await to(p,'kids',0,0);await p.reload();await p.waitForTimeout(200);
  ok('5','second player welcomed back in Candy Brain',/Welcome back, LittleTobi!/.test(await p.textContent('main'))&&await p.evaluate(()=>document.documentElement.dataset.pal)==='candy');
  await p.getByRole('button',{name:/Switch player/}).click();ok('4','both players listed',await p.locator('.pcard').count()===2);
  await p.locator('.pcard',{hasText:'MamaAda'}).click();ok('4','one tap: MamaAda back on her own age range',/Ages 18–59|Adult Brain Gym|Beginner level/.test(await p.textContent('main')));
  {const lid=await p.evaluate(()=>localStorage.getItem('brainbox_last'));ok('4','last player switched',(await J(p,'brainbox_players')).find(x=>x.id===lid).nickname==='MamaAda')}
  ok('-','no page errors',!errs.length,errs);await ctx.close()}
 {const {p,ctx,errs}=await open(b,{blocked:true});await p.getByRole('button',{name:'Start Game'}).click();await p.fill('#nick','PrivateMode');await to(p,'elders',0,0);await play(p);
  await p.locator('.navrow .btn').nth(2).click();await p.getByRole('button',{name:/Title screen/}).click();ok('6','storage blocked: round plays and profile kept for the visit',/Welcome back, PrivateMode!/.test(await p.textContent('main')));ok('6','no page errors',!errs.length,errs);await ctx.close()}
 for(const r of R)console.log(r[0].padEnd(5),r[1].padEnd(2),r[2],r[3]?'  -> '+r[3]:'');console.log(R.filter(r=>r[0]==='PASS').length+'/'+R.length+' passed');await b.close()})();
