/* Old game vs React version: opens each screen in both with the same saved data and compares the visible text.
   Serve the repository root (python3 -m http.server 8765), build this project, then: node brainbox-react/tests/parity-old-vs-new.cjs */
const {chromium}=require('playwright');
const OLD='http://localhost:8765/index.html',NEW='http://localhost:8765/brainbox-react/dist/index.html';
const SB='https://bfsrrbxsgktmrpfepxrk.supabase.co';
const board=[{user_id:'u1',player_name:'BraveMango4821',score:5200,created_at:'2026-11-01T00:00:00Z'},{user_id:'u2',player_name:'KeenRobot88',score:3100,created_at:'2026-11-01T00:00:00Z'},{user_id:'u3',player_name:'JollyLantern932',score:900,created_at:'2026-11-01T00:00:00Z'}];
const progress={Ada:{teens_maths_0_0:{s:3,p:180,t:20000},teens_maths_0_1:{s:1,p:120,t:40000},teens_maths_1_0:{s:2,p:250,t:30000}}};
const norm=t=>t.replace(/\s+/g,' ').trim();
async function open(b,url,{nick,seedProgress,vp}){
  const ctx=await b.newContext({viewport:vp||{width:375,height:812}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.route(SB+'/**',r=>{const u=r.request().url();const h={'access-control-allow-origin':'*','access-control-allow-headers':'*'};if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:h});
    if(/leaderboard_best/.test(u)&&!/ilike/.test(u))return r.fulfill({status:200,headers:h,contentType:'application/json',body:JSON.stringify(board)});
    if(/ilike/.test(u))return r.fulfill({status:200,headers:h,contentType:'application/json',body:'[]'});
    return r.abort()});
  await p.addInitScript(([nick,prog])=>{if(sessionStorage.getItem('x'))return;sessionStorage.setItem('x',1);localStorage.clear();if(nick)localStorage.setItem('bn-nick',nick);if(prog)localStorage.setItem('bn-profiles-v2',JSON.stringify(prog));localStorage.setItem('bn-season','2')},[nick||'',seedProgress||null]);
  await p.goto(url);await p.waitForTimeout(400);return {p,ctx,errs};
}
const text=async p=>norm(await p.locator('main').innerText());
const click=async(p,old,sel,txt)=>{if(txt)await p.getByRole('button',{name:txt,exact:false}).first().click();else await p.locator(sel).first().click();await p.waitForTimeout(250)};
(async()=>{const b=await chromium.launch();const results=[];
  const cmp=(id,name,o,n)=>{const same=o===n;results.push([id,name,same?'PASS':'FAIL',same?'':('\n      old: '+o.slice(0,400)+'\n      new: '+n.slice(0,400))])};
  async function both(id,name,opts,nav){const r={};for(const [k,u] of [['o',OLD],['n',NEW]]){const x=await open(b,u,opts);await nav(x.p,k==='o');await x.p.waitForTimeout(1200);r[k]=await text(x.p);r[k+'e']=x.errs;await x.ctx.close()}cmp(id,name,r.o,r.n);if(r.oe.length||r.ne.length)results.push([id,'page errors','FAIL','old '+r.oe+' new '+r.ne])}
  await both('S1','Welcome, new player',{},async p=>{});
  await both('S1b','Welcome, returning player',{nick:'Ada',seedProgress:progress},async p=>{});
  await both('S2','How to play',{},async p=>{await click(p,0,0,'How to play')});
  await both('S3','Home (name, daily, bands, top 3)',{nick:'Ada',seedProgress:progress},async p=>{await click(p,0,0,'Start Game')});
  for(const band of ['kids','teens','adults','elders'])await both('S4','Puzzle types: '+band,{nick:'Ada',seedProgress:progress},async p=>{await click(p,0,0,'Start Game');await p.locator(`.card >> nth=${['kids','teens','adults','elders'].indexOf(band)}`).click();await p.waitForTimeout(250)});
  await both('S5','Levels (with progress)',{nick:'Ada',seedProgress:progress},async p=>{await click(p,0,0,'Start Game');await p.locator('.card >> nth=1').click();await p.locator('.grid.cats .card >> nth=0').click()});
  await both('S5b','Levels (new puzzle type: Start here)',{nick:'Ada',seedProgress:progress},async p=>{await click(p,0,0,'Start Game');await p.locator('.card >> nth=1').click();await p.locator('.grid.cats .card >> nth=2').click()});
  await both('S6','Rounds (stars, points, locks)',{nick:'Ada',seedProgress:progress},async p=>{await click(p,0,0,'Start Game');await p.locator('.card >> nth=1').click();await p.locator('.grid.cats .card >> nth=0').click();await p.locator('.lvl >> nth=0').click()});
  await both('S7','Get ready card',{nick:'Ada',seedProgress:progress},async p=>{await click(p,0,0,'Start Game');await p.locator('.card >> nth=1').click();await p.locator('.grid.cats .card >> nth=0').click();await p.locator('.lvl >> nth=0').click();await p.locator('.rnd >> nth=2').click()});
  await both('S10','Leaderboard (online, you not on it)',{nick:'Ada',seedProgress:progress},async p=>{await click(p,0,0,'View the leaderboard')});
  await both('S3m','Home top-3 preview',{nick:'Ada',seedProgress:progress},async p=>{await click(p,0,0,'Start Game');await p.waitForTimeout(800)});
  for(const r of results)console.log(r[2].padEnd(5),r[0].padEnd(4),r[1],r[3]||'');
  await b.close()})();
