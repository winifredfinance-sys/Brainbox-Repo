/* Brainbox Ninja: game logic, screens, scoring and the global leaderboard view (data comes from js/online.js). */
/* ---------- progress, stored on this device (one profile per nickname) ---------- */
const ROUNDS=10;
const cleanNick=s=>String(s||'').replace(/[^\p{L}\p{N} _-]/gu,'').replace(/\s+/g,' ').trim().slice(0,20);
let ALL={};
try{ALL=JSON.parse(ls.get('bn-profiles-v2')||'{}')||{}}catch(e){ALL={}}
if(typeof ALL!=='object'||Array.isArray(ALL))ALL={};
let NICK=cleanNick(ls.get('bn-nick'));
let LP={};
const loadLP=()=>{LP=(NICK&&ALL[NICK])||{};if(NICK&&!ALL[NICK])ALL[NICK]=LP};
const saveLP=()=>{if(NICK){ALL[NICK]=LP;ls.set('bn-profiles-v2',JSON.stringify(ALL))}};
loadLP();
/* Season 2 (Nov 2026): faster answers now score 20 down to 5 points. Round points earned under the old scoring
   are cleared once so every total on the leaderboard uses the same rules. Stars, unlocks and best times stay. */
if(ls.get('bn-season')!=='2'){
  for(const n in ALL){const p=ALL[n];if(p&&typeof p==='object')for(const k in p)if(p[k]&&typeof p[k]==='object')p[k].p=0}
  ls.set('bn-profiles-v2',JSON.stringify(ALL));ls.set('bn-sent-v1','');ls.set('bn-season','2');
}
const key=(b,c,l,r)=>b+'_'+c+'_'+l+'_'+r;
const rec=(b,c,l,r)=>LP[key(b,c,l,r)]||{s:0,p:0,t:0};
const passedRounds=(b,c,l)=>{let n=0;for(let r=0;r<ROUNDS;r++)if(rec(b,c,l,r).s>=1)n++;return n};
const levelDone=(b,c,l)=>passedRounds(b,c,l)>=ROUNDS;
const levelOpen=(b,c,l)=>l===0||levelDone(b,c,l-1);
const roundOpen=(b,c,l,r)=>levelOpen(b,c,l)&&(r===0||rec(b,c,l,r-1).s>=1);
function totalsOf(lp){const t={total:0,kids:0,teens:0,adults:0,elders:0};for(const k in lp){const p=+lp[k].p||0;t.total+=p;const b=k.split('_')[0];if(b in t)t[b]+=p}return t}
const totals=()=>totalsOf(LP);
const stars=n=>`<span role="img" aria-label="${n} of 3 stars">`+[0,1,2].map(i=>`<span style="--i:${i}" class="${i<n?'on':'off'}">★</span>`).join('')+'</span>';

/* ---------- daily challenge and streak (per nickname, this device, Lagos days). Targets are DAILY in content.js ---------- */
let DY={};
try{DY=JSON.parse(ls.get('bn-daily-v1')||'{}')||{}}catch(e){DY={}}
if(typeof DY!=='object'||Array.isArray(DY))DY={};
/* today's state: points so far, whether the target is hit, the live streak (0 if a day was missed) and the target in use */
function dailyOf(nick){
  const d=(nick&&DY[nick])||{},today=lagosDay(),band=(S&&S.band)||d.band||null;
  const isToday=d.day===today,streak=(d.last===today||d.last===dayBefore(today))?(+d.streak||0):0;
  return {pts:isToday?+d.pts||0:0,hit:isToday&&!!d.hit,streak,band,target:band?DAILY[band]:null,keepUp:streak>0&&d.last!==today};
}
/* add a finished round's points; returns true the moment today's target is reached */
function addDaily(pts,band){
  if(!NICK||NICK.length<2)return false;
  const today=lagosDay(),d=DY[NICK]||{};
  if(d.day!==today){d.day=today;d.pts=0;d.hit=false}
  d.pts=(+d.pts||0)+Math.max(0,pts|0);d.band=band;
  let just=false;
  if(!d.hit&&d.pts>=DAILY[band]){d.hit=true;just=true;d.streak=(d.last===dayBefore(today)?(+d.streak||0):0)+1;d.last=today}
  DY[NICK]=d;ls.set('bn-daily-v1',JSON.stringify(DY));
  return just;
}
function dailyCard(){
  if(!NICK||NICK.length<2)return '<h2 class="sub">Daily challenge</h2><p class="lead">Pick a ninja name to start today’s challenge.</p>';
  const d=dailyOf(NICK),fire=d.streak?`<span class="streak">🔥 ${d.streak}-day streak</span>`:'';
  if(!d.target)return `<div class="mh"><h2 class="sub">Daily challenge</h2>${fire}</div><p class="lead">Play a round to see today’s points target for your age range.</p>`;
  const pct=Math.min(100,Math.round(100*d.pts/d.target)),b=BANDS.find(x=>x.id===d.band);
  return `<div class="mh"><h2 class="sub">Daily challenge</h2>${fire}</div>
  <p class="dnum"><b>${fmtN(d.pts)} / ${fmtN(d.target)}</b> points today${d.hit?' <span class="dok">✓ target reached</span>':''}</p>
  <div class="dbar" role="progressbar" aria-label="Daily target" aria-valuemin="0" aria-valuemax="${d.target}" aria-valuenow="${Math.min(d.pts,d.target)}"><i style="width:${pct}%"></i></div>
  <p class="foot">${d.hit?'Come back tomorrow to keep your streak going.':d.keepUp?'Reach the target today to keep your streak.':'Reach the target every day to build a streak.'} Target for ages ${esc(b?b.range:'')}.</p>`;
}

/* ---------- adaptive difficulty: recent accuracy per player and puzzle type ---------- */
let SK={};
try{SK=JSON.parse(ls.get('bn-skill-v1')||'{}')||{}}catch(e){SK={}}
const skKey=()=>(NICK||'?')+'|'+S.band+'_'+S.cat;
const recordSkill=ratio=>{const k=skKey(),a=(SK[k]||[]).concat(ratio).slice(-5);SK[k]=a;ls.set('bn-skill-v1',JSON.stringify(SK))};
/* last 3 rounds averaging 90%+ adds harder questions; averaging 50% or less adds easier ones */
function adaptAdj(){
  const a=(SK[skKey()]||[]).slice(-3);if(a.length<3)return 0;
  const avg=(a[0]+a[1]+a[2])/3;
  if(avg>=.9&&S.level<2)return 1;
  if(avg<=.5&&S.level>0)return -1;
  return 0;
}
const adaptNote=adj=>adj>0?'Challenge boost: 3 harder questions this round':adj<0?'Warm-up mix: 3 easier questions this round':'';

/* ---------- global leaderboard (Supabase via js/online.js). Progress and unlocks still save on this device. ---------- */
/* a player's leaderboard score is their total: the sum of their best points in every round (totals().total) */
const fmtN=n=>(+n||0).toLocaleString('en-NG');
const isMe=e=>!!NET.uid&&!!NICK&&e.user_id===NET.uid&&e.player_name===NICK;
const row=(e,i)=>`<li class="${isMe(e)?'me':''}"><span class="rk r${i<3?i+1:0}">${i+1}</span><span class="pn">${esc(e.player_name||'Ninja')}${isMe(e)?' (you)':''}</span><span class="pt">${fmtN(e.score)}</span></li>`;
function rows(list,lim){
  const top=list.slice(0,lim),mi=list.findIndex(isMe),me=NET.board.me;
  let h='<ol class="rows">'+top.map((e,i)=>row(e,i)).join('');
  if(mi>=lim)h+=row(list[mi],mi);
  else if(mi<0&&me&&me.rank)h+=row({user_id:NET.uid,player_name:NICK,score:me.score},me.rank-1);
  return h+'</ol>';
}
function boardMsg(){
  const st=NET.board.status;
  if(st==='off')return 'The global leaderboard is not switched on yet. Your progress is still saved on this device.';
  if(st==='offline')return 'You are offline. Your progress is saved on this device, and your score will be sent when you are back online.';
  if(st==='error')return 'The leaderboard could not load just now. Check your connection and try again.';
  if(st!=='ok')return 'Loading the leaderboard…';
  return '';
}
const retryBtn=()=>NET.board.status==='error'?'<button class="btn" data-a="reload">Try again</button>':'';
const EMPTY='<p class="lead">No scores yet. Be the first ninja on the board.</p>';
function miniBody(){
  const list=NET.board.rows,m=boardMsg();
  if(!list.length)return m?`<p class="lead" role="status">${esc(m)}</p>${retryBtn()}`:EMPTY;
  return rows(list,3);
}
function miniBoard(){
  return '<div class="mh"><h2 class="sub">Leaderboard</h2><button class="link" data-a="board">See all →</button></div>'+`<div id="minibody">${miniBody()}</div>`;
}
function boardBody(){
  const B=NET.board,list=B.rows,m=boardMsg();
  if(!list.length)return m?`<p class="chase" role="status">${esc(m)}</p>${retryBtn()}`:EMPTY+chaseLine(list);
  return (m?`<p class="note" role="status">${esc(m)}</p>${retryBtn()}`:'')+chaseLine(list)+rows(list,NET.TOP);
}
function chaseLine(list){
  const mi=list.findIndex(isMe),me=NET.board.me,t=totals().total;
  if(mi>=0){const my=+list[mi].score,up=list[mi-1],dn=list[mi+1];
    return `<p class="chase"><strong>You are #${mi+1} with ${fmtN(my)} pts.</strong> ${up?`${esc(up.player_name)} is ${fmtN(+up.score-my)} pts ahead of you. Catch up!`:'You are in front. Keep going!'} ${dn?`${esc(dn.player_name)} is ${fmtN(my-(+dn.score))} pts behind you.`:''}</p>`}
  if(me)return `<p class="chase"><strong>Your best: ${fmtN(me.score)} pts${me.rank?` (#${me.rank})`:''}.</strong> Keep playing to climb into the top ${NET.TOP}.</p>`;
  if(NICK&&t>0&&NET.configured)return `<p class="chase">Your ${fmtN(t)} pts will show here once they reach the leaderboard.</p>`;
  return '<p class="chase">Play a round to join the board.</p>';
}
const SYNC={saving:'Sending your total to the global leaderboard…',saved:'Your total is on the global leaderboard.',failed:'Could not reach the global leaderboard. Your score is safe on this device and will be sent later.',offline:'You are offline. Your score is safe on this device and will be sent when you are back online.'};
const syncText=()=>SYNC[NET.syncState]||'';
/* when leaderboard data arrives, update only the part of the screen that shows it (keeps typing focus on the home screen) */
NET.on(()=>{
  const el=id=>document.getElementById(id);
  if(S.screen==='board'&&el('gboard'))el('gboard').innerHTML=boardBody();
  else if(S.screen==='home'&&el('minibody'))el('minibody').innerHTML=miniBody();
  else if(S.screen==='result'&&el('sync'))el('sync').textContent=syncText();
});
/* ---------- anonymous gameplay stats (js/track.js). Wrapped so stats can never stop or slow the game. ---------- */
const tr=(f,a)=>{try{if(typeof TRACK!=='undefined')TRACK[f](a)}catch(e){}};

/* ---------- state ---------- */
let S={screen:'welcome',from:'home',band:null,cat:null,level:0,round:0,qs:[],i:0,score:0,pts:0,gain:0,totalMs:0,picked:null,memoDone:false,qStart:0,limit:0,rem:0,res:null};
const cur=()=>BANDS.find(b=>b.id===S.band);
const app=document.getElementById('app');
let tick=null;

const MASCOT=`<svg class="mascot" viewBox="0 0 120 120" role="img" aria-label="Brainbox Ninja mascot"><g class="bob"><circle cx="60" cy="64" r="44" fill="#2A2017"/><rect x="22" y="48" width="76" height="30" rx="15" fill="#F5D9B5"/><g class="eyes"><circle cx="46" cy="63" r="6" fill="#fff"/><circle cx="74" cy="63" r="6" fill="#fff"/><circle cx="47" cy="64" r="3" fill="#2A2017"/><circle cx="75" cy="64" r="3" fill="#2A2017"/></g><rect x="16" y="36" width="88" height="11" rx="5" style="fill:var(--red)"/><g class="tail"><path d="M100 41 L118 30 L114 44 L119 56 L100 46Z" style="fill:var(--red)"/></g><rect x="50" y="37.5" width="20" height="8" rx="2" fill="#FBF3E6"/><text x="60" y="44.2" font-size="7.5" text-anchor="middle" fill="#2A2017" font-weight="800" font-family="Trebuchet MS,sans-serif">BRAIN</text></g></svg>`;

/* ---------- views ---------- */
function welcome(){
  const t=totals();
  return `<section class="welcome">${MASCOT}<h1 class="wtitle">Brainbox <em>Ninja</em></h1>
  <p class="wsub">${NICK&&t.total>0?'Welcome back, '+esc(NICK)+'. Ready for another round?':'The timed puzzle game for every age.'}</p>
  <div class="wfeat"><span>Ages 4 to 60+</span><span>Maths, words, proverbs, riddles</span><span>Beat the clock</span></div>
  <button class="btn primary big" data-a="start">Start Game</button>
  <button class="btn" data-a="howto">How to play</button>
  <button class="link" data-a="board">View the leaderboard</button>
  <p class="foot">Free to play. No ads. We collect anonymous gameplay stats and ninja names to improve the game, never real names or personal details.</p></section>`;
}
function howto(){
  return `<button class="link" data-a="hback">← Back</button>
  <header class="top"><h1>How to play</h1><p class="lead">Four quick steps. A round takes about two minutes.</p></header>
  <ol class="steps">
   <li><strong>Choose your ninja name</strong><span>This is the name shown on the global leaderboard, up to 20 letters. Use a nickname, not your real full name. Tap Surprise me for ideas.</span></li>
   <li><strong>Pick your age range</strong><span>You get puzzles made for your age: 4–10, 11–17, 18–59 or 60+.</span></li>
   <li><strong>Choose a puzzle type</strong><span>Maths, words, proverbs, riddles, memory and more. Start at Beginner and work up to Hard.</span></li>
   <li><strong>Answer before the timer runs out</strong><span>Each round has 10 questions. Tap an answer, or press A to D on a keyboard. A quick right answer earns ${SPEED.max} points, falling to ${SPEED.min} as the clock runs down.</span></li>
  </ol>
  <section class="panel"><h2 class="sub">Scoring and levels</h2><ul class="rules"><li>Score 6 out of 10 to pass a round and open the next one.</li><li>Every level has 10 rounds. Pass all 10 to unlock the next level.</li><li>Answer fast: a right answer is worth ${SPEED.max} points at once and ${SPEED.min} at the buzzer.</li><li>Medium levels score 1.5× points and Hard levels score double.</li><li>Rounds get harder as you go: Round 10 is tougher than Round 1.</li><li>Hit your daily points target every day to build a streak.</li><li>Your best score in each round counts on the leaderboard.</li></ul></section>
  <button class="btn primary" data-a="start">Start Game</button>`;
}
function home(){
  const t=totals();
  return `<button class="link" data-a="welcome">← Title screen</button>
  <header class="hero">${MASCOT}<div class="top"><h1>Get ready</h1><p class="lead">Pick a ninja name and your age range. <button class="link inline" data-a="howto">How to play</button></p></div></header>
  <section class="panel"><label for="nick">Your ninja name</label>
   <div class="row"><input id="nick" maxlength="20" autocomplete="off" placeholder="e.g. SwiftMango42" value="${esc(NICK)}"><button class="btn" type="button" data-a="rand">Surprise me</button></div>
   <p id="msg" class="msg" role="alert"></p></section>
  <section id="daily" class="panel daily">${dailyCard()}</section>
  <h2 class="sub">Choose your age range</h2>
  <div class="grid ages">${BANDS.map(b=>`<button class="card" data-a="band" data-b="${b.id}" style="--c:var(--${b.id});--cbg:var(--${b.id}-bg)"><span class="rng">${b.range}</span><span class="nm">${b.name}</span><span class="bl">${b.blurb}</span><span class="pr">${t[b.id].toLocaleString('en-NG')} pts</span></button>`).join('')}</div>
  <section id="mini" class="panel">${miniBoard()}</section>
  <p class="foot">No ads and no videos. Your progress saves on this device and your total goes on the global leaderboard. No sign-up needed.</p>`;
}
function cats(){
  const b=cur();
  return `<button class="link" data-a="home">← Change age range</button>
  <header class="top"><span class="chip">Ages ${b.range}</span><h1>${b.name}</h1><p class="lead">Pick a puzzle type. Each has three levels, and every level has ten rounds of ten timed questions.</p></header>
  <div class="grid cats">${catsFor(b.id).map(c=>{const passed=[0,1,2].reduce((a,l)=>a+passedRounds(b.id,c.id,l),0);
   return `<button class="card" data-a="cat" data-c="${c.id}"><span class="glyph">${c.glyph}</span><span class="nm">${c.name}</span><span class="bl">${c.blurb}</span><span class="pr">${passed} of ${3*ROUNDS} rounds passed</span></button>`}).join('')}</div>
  <button class="btn" data-a="board">View leaderboard</button>`;
}
function hub(){
  const b=cur(),c=catOf(b.id,S.cat);
  return `<button class="link" data-a="cats">← ${b.name}</button>
  <header class="top"><span class="chip">Ages ${b.range}</span><h1>${c.name}</h1><p class="lead">${c.blurb}</p></header>
  <ol class="levels">${LEVELS.map((n,i)=>{const open=levelOpen(b.id,S.cat,i),pr=passedRounds(b.id,S.cat,i),st=Array.from({length:ROUNDS},(_,r)=>rec(b.id,S.cat,i,r).s).reduce((x,y)=>x+y,0);
   const info=open?`${pr} of ${ROUNDS} rounds passed · ${st} of ${ROUNDS*3} stars`:'Pass all '+ROUNDS+' rounds of '+LEVELS[i-1]+' to unlock';
   return `<li><button class="lvl" data-a="level" data-l="${i}" ${open?'':'disabled'}><span class="ln"><small>Level ${i+1}</small>${n}</span><span class="ls">${open?(levelDone(b.id,S.cat,i)?'Cleared':pr+'/'+ROUNDS):'Locked'}</span><span class="lh">${info}</span></button></li>`}).join('')}</ol>
  <p class="foot">Each level has ${ROUNDS} rounds of 10 timed questions. Pass a round with 6 out of 10 to open the next one. Hard levels score double.</p>`;
}
function rounds(){
  const b=cur(),c=catOf(b.id,S.cat),l=S.level;
  let next=0;while(next<ROUNDS-1&&rec(b.id,S.cat,l,next).s>=1)next++;
  const pr=passedRounds(b.id,S.cat,l);
  return `<button class="link" data-a="hub">← ${c.name}</button>
  <header class="top"><span class="chip">${LEVELS[l]} level</span><h1>${pr>=ROUNDS?'Level cleared':'Round '+(next+1)+' is next'}</h1><p class="lead">${pr} of ${ROUNDS} rounds passed. Ten questions per round, ${TL[b.id][l]} seconds each.</p></header>
  <button class="btn primary" data-a="round" data-r="${next}">${pr>=ROUNDS?'Play a round again':(pr?'Continue with Round '+(next+1):'Start Round 1')}</button>
  <div class="rgrid">${Array.from({length:ROUNDS},(_,r)=>{const open=roundOpen(b.id,S.cat,l,r),x=rec(b.id,S.cat,l,r);
   return `<button class="rnd${x.s>=1?' done':''}" data-a="round" data-r="${r}" ${open?'':'disabled'}><span class="rn">${r+1}</span><span class="rs">${open?stars(x.s):'Locked'}</span>${x.p?`<span class="rp">${x.p} pts</span>`:''}</button>`}).join('')}</div>
  <p class="foot">Pass a round with 6 out of 10 to open the next one. Replay any round to beat your best points.</p>`;
}
function ready(){
  const b=cur(),c=catOf(b.id,S.cat),secs=TL[b.id][S.level],top=ptsFor(1,1,S.level),low=ptsFor(0,1,S.level);
  return `<button class="link" data-a="rounds">← Rounds</button>
  <section class="qcard ready"><span class="chip">${esc(c.name)} · ${LEVELS[S.level]} · Round ${S.round+1} of ${ROUNDS}</span>
  <h1>Get ready</h1>
  <p class="rfacts"><span><b>${S.qs.length}</b> questions</span><span><b>${secs}</b> seconds each</span></p>
  <p class="fast"><strong>Answer fast for more points.</strong> A right answer is worth ${top} points straight away, falling to ${low} at the buzzer.</p>
  ${S.adj?`<p><span class="chip">${adaptNote(S.adj)}</span></p>`:''}
  <button class="btn primary big" id="nextbtn" data-a="go">Start round</button></section>`;
}
function play(){
  const q=S.qs[S.i],N=S.qs.length,done=S.picked!==null;
  let h=`<div class="topbar"><button class="link" data-a="rounds">← Rounds</button><span class="meta">${LEVELS[S.level]} · Round ${S.round+1} · Time <span id="tclk">${mmss(S.totalMs)}</span></span></div>
  <div class="prog" role="progressbar" aria-label="Question progress" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${S.i+(done?1:0)}">${S.qs.map((_,k)=>`<i class="${k<S.i||(k===S.i&&done)?'done':k===S.i?'now':''}"></i>`).join('')}</div>${S.adj?`<p><span class="chip">${adaptNote(S.adj)}</span></p>`:''}`;
  if(q.memo&&!S.memoDone)return h+`<section class="qcard"><p class="qn">Question ${S.i+1} <span>of ${N}</span></p><p class="q">Remember these items. The clock starts when you are ready.</p><p class="show memo">${esc(q.memo)}</p><button class="btn primary" data-a="memodone">I have remembered them</button></section>`;
  const frac=done?S.rem/S.limit:1;
  h+=`<div class="timer" aria-label="Time left"><span class="tl">Time left</span><div class="tbarwrap"><div id="tbar" class="${frac<.25?'low':frac<.5?'mid':''}" style="transform:scaleX(${frac})"></div></div><span id="tnum">${Math.ceil((done?S.rem:S.limit)/1000)}s</span><span id="tpts" class="tpts" aria-label="Points for a right answer now">${done?'':ptsFor(1,1,S.level)+' pts'}</span></div>`;
  const short=q.opts.every(o=>o.length<9);
  h+=`<section class="qcard"><p class="qn">Question ${S.i+1} <span>of ${N}</span></p><p class="q">${q.q}</p>${q.show?`<p class="show">${esc(q.show)}</p>`:''}
  <div class="opts${short?' two':''}" role="group" aria-label="Answer choices">${q.opts.map((o,k)=>{let c='opt',m='ABCD'[k];if(done){if(k===q.ans){c+=' good';m='✓'}else if(k===S.picked){c+=' bad';m='✗'}}
   return `<button class="${c}" data-a="pick" data-k="${k}" ${done?'disabled':''}><span class="key">${m}</span><span class="ot">${esc(o)}</span></button>`}).join('')}</div>`;
  if(!done)h+='<p class="hint">Tip: press A to D, or 1 to 4, to answer.</p>';
  if(done){
    const ok=S.picked===q.ans,to=S.picked===-1;
    h+=`<div class="fb ${ok?'good':'bad'}" role="status"><strong>${ok?'Correct! +'+S.gain+' pts in '+(S.used/1000).toFixed(1)+'s':to?'Time is up.':'Not quite.'}</strong> ${ok?'':'The answer is '+esc(q.opts[q.ans])+'. '}${esc(q.why||'')}</div>
    <button class="btn primary" id="nextbtn" data-a="next">${S.i===N-1?'See my score':'Next question'}</button>`;
  }
  return h+'</section>';
}
function confetti(){const cols=['var(--red)','var(--gold)','var(--good)','var(--teens)'];return Array.from({length:30},(_,i)=>`<i class="cf" style="left:${rnd(2,96)}%;background:${cols[i%4]};--d:${(Math.random()*.9).toFixed(2)}s"></i>`).join('')}
const SHOUTS=['You are brilliant!','Great!','Awesome!','Fantastic!','Well done, ninja!','Superb!','Brilliant!','Outstanding!','Ninja skills!','Excellent!'];
const PERFECT=['Flawless!','Perfect round!','You are a legend!','Total genius!'];
const TRY=['Good try!','So close!','Keep going, ninja!','Nearly there!'];
const CLEARED=['Level cleared!','Champion!','Master of this level!'];
const TIPS={count:'Touch each fruit once as you count so you do not count it twice.',sums:'Count on from the bigger number. For 7 + 2, start at 7 and count 8, 9.',patterns:'Say the pattern out loud, then say what comes next.',odd:'Name each item. The one that does not fit the group is your answer.',skip:'Say the whole count out loud: 5, 10, 15 and keep the beat going.',maths:'Break big numbers into tens and ones. For 38 + 27, add 30 + 20, then 8 + 7.',seq:'Look at the gaps between the numbers. If the gaps grow, the rule is changing.',words:'Look for familiar endings and beginnings, then try the first letter.',proverbs:'Think about the lesson first. The missing word usually carries it.',riddles:'Read the riddle twice. The answer often hides in plain words.',money:'Round to the nearest ₦100 first, then adjust for the exact amount.',memory:'Group the items into pairs or picture a market stall. Linking them helps you recall.',numbers:'Take it slowly. For change, count up from the price to the amount paid.',mix:'Answer in the first half of the timer to earn the biggest speed bonus.'};
function suggestions(){
  const b=cur(),r=S.res,out=[];
  const passedN=c=>[0,1,2].reduce((a,l)=>a+passedRounds(b.id,c.id,l),0);
  const fresh=catsFor(b.id).filter(c=>c.id!=='mix'&&c.id!==S.cat).sort((x,y)=>passedN(x)-passedN(y)||Math.random()-.5)[0];
  if(fresh)out.push({a:'cat',c:fresh.id,t:'Try '+fresh.name,d:(passedN(fresh)?passedN(fresh)+' of '+3*ROUNDS+' rounds passed. ':'New for you. ')+fresh.blurb});
  if(r.pass&&S.cat!=='mix')out.push({a:'cat',c:'mix',t:'Play Mix It Up',d:'A bit of everything from this age range.'});
  const bi=BANDS.findIndex(x=>x.id===b.id),nb=BANDS[bi+1]||BANDS[bi-1];
  out.push({a:'band',bb:nb.id,t:'Peek at the '+nb.range+' puzzles',d:nb.name+': '+nb.blurb});
  return out.slice(0,3);
}
const ring=(score,n,pass)=>{const C=2*Math.PI*52;return `<div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="rtrack" cx="60" cy="60" r="52"/><circle class="rfill${pass?'':' fail'}" cx="60" cy="60" r="52" style="--c2:${C.toFixed(1)};--off:${(C*(1-score/n)).toFixed(1)}"/></svg><div class="rtxt"><b>${score}</b><span>out of ${n}</span></div></div>`};
function result(){
  const r=S.res,tip=TIPS[S.cat]||TIPS.mix,acc=Math.round(100*r.score/r.n);
  const msg=r.cleared?(S.level===2?'You cleared every level of this puzzle type.':'You passed all '+ROUNDS+' rounds. The next level is open.'):r.pass?'Round '+(r.round+1)+' passed. Round '+(r.round+2)+' is open.':'You need 6 out of 10 to pass. Try again with fresh questions.';
  let primary;
  if(r.cleared&&S.level<2)primary=`<button class="btn primary" data-a="nextlevel">Next level: ${LEVELS[S.level+1]}</button>`;
  else if(r.cleared)primary='<button class="btn primary" data-a="cats">Pick another puzzle type</button>';
  else if(r.pass)primary=`<button class="btn primary" data-a="nextround">Next round (Round ${r.round+2})</button>`;
  else primary='<button class="btn primary" data-a="again">Play Again</button>';
  const again=r.pass?'<button class="btn" data-a="again">Play Again</button>':'';
  const dy=dailyOf(NICK),dline=dy.target?`<div class="dres${r.dailyHit?' hit':''}" role="status">${r.dailyHit?`<strong>🎯 Daily target reached!</strong> <span class="nw">🔥 ${dy.streak}-day streak</span>`:`<strong>${fmtN(dy.pts)} / ${fmtN(dy.target)}</strong> points today${dy.hit?' · target reached ✓':` · ${fmtN(dy.target-dy.pts)} to go`}${dy.streak?` · <span class="nw">🔥 ${dy.streak}-day streak</span>`:''}`}</div>`:'';
  return `<section class="res">${r.pass||r.dailyHit?confetti():''}<p class="shout${r.pass||r.dailyHit?'':' soft'}">${esc(r.shout)}</p><span class="chip">${LEVELS[S.level]} · Round ${r.round+1} of ${ROUNDS}</span>${ring(r.score,r.n,r.pass)}<p class="ss">${stars(r.stars)}</p>
  <div class="stats"><div class="stat"><b>+${r.pts}</b><span>points${r.newBest?' · new best':''}</span></div><div class="stat"><b>${mmss(r.ms)}</b><span>round time</span></div><div class="stat"><b>${acc}%</b><span>correct</span></div></div>
  ${dline}
  <p class="lead">${msg} ${r.passed} of ${ROUNDS} rounds passed in this level.</p>
  <p class="foot" id="sync" role="status">${esc(syncText())}</p>
  ${r.nextAdj?`<p class="note"><strong>Smart difficulty:</strong> ${r.nextAdj>0?'you are doing very well, so your next round will mix in 3 harder questions.':'this one looks tricky, so your next round will mix in 3 easier questions.'}</p>`:''}
  <div class="stack">${primary}${again}</div>
  <div class="tip"><strong>Pointer:</strong> ${esc(tip)}</div>
  <h2 class="sub">What next?</h2>
  <div class="stack">${suggestions().map(x=>`<button class="sugg" data-a="${x.a}"${x.c?` data-c="${x.c}"`:''}${x.bb?` data-b="${x.bb}"`:''}><strong>${esc(x.t)}</strong><span>${esc(x.d)}</span></button>`).join('')}</div>
  <div class="navrow"><button class="btn" data-a="rounds">All rounds</button><button class="btn" data-a="cats">Puzzle types</button><button class="btn" data-a="home">Age range</button><button class="btn" data-a="board">Leaderboard</button></div></section>`;
}
function boardView(){
  return `<button class="link" data-a="back">← Back</button>
  <header class="top"><h1>Leaderboard</h1><p class="lead">The top ${NET.TOP} ninjas everywhere. Your score is your total: your best points in every round you have played, added up.</p></header>
  <div id="gboard">${boardBody()}</div>
  <button class="link" data-a="reload">Refresh the leaderboard</button>
  <p class="note">Names are nicknames chosen by players. Scores are sent from players’ own devices.</p>`;
}
function render(){
  const b=S.band&&['cats','hub','rounds','ready','play','result'].includes(S.screen)?cur():null;
  document.documentElement.dataset.pal=(b&&b.id==='kids')?'candy':'naija';
  app.className='app'+(b&&b.cls?' '+b.cls:'');
  app.setAttribute('style',b?`--c:var(--${b.id});--cbg:var(--${b.id}-bg)`:'');
  app.innerHTML=({welcome,howto,home,cats,hub,rounds,ready,play,result,board:boardView})[S.screen]();
  const nb=document.getElementById('nextbtn');if(nb)nb.focus();
}
function enter(){app.classList.remove('enter');void app.offsetWidth;app.classList.add('enter')}
function go(s){if(S.screen==='play'&&s!=='play'&&S.live)tr('roundQuit');if(s!=='play')clearInterval(tick);if(s==='board'&&S.screen!=='board')S.from=S.screen;if(s==='howto'&&S.screen!=='howto')S.hfrom=S.screen;S.screen=s;render();if(s==='board'||s==='home')NET.refresh(NICK);enter();window.scrollTo(0,0)}

/* ---------- timed round ---------- */
function startQ(){S.qStart=Date.now();S.limit=TL[S.band][S.level]*1000;clearInterval(tick);tick=setInterval(onTick,100)}
function onTick(){
  if(S.screen!=='play'||S.picked!==null){clearInterval(tick);return}
  const used=Date.now()-S.qStart,rem=S.limit-used,bar=document.getElementById('tbar'),num=document.getElementById('tnum'),clk=document.getElementById('tclk');
  if(rem<=0){answer(-1);return}
  if(bar){const f=rem/S.limit;bar.style.transform=`scaleX(${f})`;bar.classList.toggle('low',f<.25);bar.classList.toggle('mid',f>=.25&&f<.5)}
  if(num)num.textContent=Math.ceil(rem/1000)+'s';
  const tp=document.getElementById('tpts');if(tp)tp.textContent=ptsFor(rem,S.limit,S.level)+' pts';
  if(clk)clk.textContent=mmss(S.totalMs+used);
}
function answer(k){
  if(S.picked!==null)return;
  clearInterval(tick);
  const q=S.qs[S.i],used=Math.min(S.limit,Date.now()-S.qStart);
  S.totalMs+=used;S.rem=Math.max(0,S.limit-used);S.used=used;S.picked=k;S.gain=0;
  if(k===q.ans){S.score++;S.gain=ptsFor(S.rem,S.limit,S.level);S.pts+=S.gain}  /* S.pts already includes the level multiplier */
  if(k===-1)S.to=(S.to||0)+1; /* timeouts, for stats only */
  tr('progress',{answered:S.i+1,score:S.score,points:S.pts,ms:S.totalMs,timeouts:S.to||0});
  render();
}
/* a round is built here and shown on the "Get ready" card; the clock starts on "Start round" (beginRound) */
function startRound(){
  S.live=false;S.adj=adaptAdj();S.qs=build(S.band,S.cat,S.level,S.adj,S.round);
  go('ready');
}
function beginRound(){
  if(S.screen!=='ready'||!S.qs.length)return;
  S.live=true; /* set when a round starts; finish() clears it so one round is scored and sent only once */
  S.i=0;S.score=0;S.pts=0;S.totalMs=0;S.picked=null;S.memoDone=false;
  S.to=0;tr('roundStart',{band:S.band,cat:S.cat,level:S.level,round:S.round,adj:S.adj,total:S.qs.length});
  go('play');if(!S.qs[0].memo)startQ();
}
function finish(){
  if(!S.live)return;S.live=false;
  const n=S.qs.length,ratio=S.score/n,pass=S.score>=Math.ceil(n*.6),st=ratio>=.9?3:ratio>=.8?2:ratio>=.6?1:0,pts=S.pts;
  const k=key(S.band,S.cat,S.level,S.round),old=LP[k]||{s:0,p:0,t:0};
  LP[k]={s:Math.max(old.s,st),p:Math.max(old.p,pts),t:pass&&(!old.t||S.totalMs<old.t)?S.totalMs:old.t};
  saveLP();recordSkill(ratio);
  NET.sync(); /* the round is complete and its points are final: send the new total (only if it went up) */
  tr('roundEnd',{score:S.score,points:pts,ms:S.totalMs,passed:pass,timeouts:S.to||0});
  const dailyHit=addDaily(pts,S.band),dy=dailyOf(NICK);
  if(dailyHit)tr('dailyHit',{band:S.band,points:dy.pts,target:dy.target,streak:dy.streak});
  S.res={score:S.score,n,pts,ms:S.totalMs,stars:st,pass,newBest:pts>old.p,round:S.round,cleared:pass&&levelDone(S.band,S.cat,S.level),passed:passedRounds(S.band,S.cat,S.level),nextAdj:adaptAdj(),dailyHit};
  S.res.shout=dailyHit?'Daily target reached!':S.res.cleared?pick(CLEARED):pass?pick(st===3?PERFECT:SHOUTS):pick(TRY);
  go('result');
}

/* ---------- events ---------- */
const ADJ=['Swift','Clever','Sharp','Brave','Calm','Quick','Bold','Silent','Lucky','Mighty','Wise','Zesty'],NOUN=['Mango','Jollof','Falcon','Panther','Danfo','Eagle','Suya','Tiger','Drum','Cobra','Baobab','Comet'];
app.addEventListener('input',e=>{
  if(e.target.id==='nick'){NICK=cleanNick(e.target.value);ls.set('bn-nick',NICK);const d=document.getElementById('daily');if(d)d.innerHTML=dailyCard()}
});
app.addEventListener('click',e=>{
  const t=e.target.closest('[data-a]');if(!t)return;
  const a=t.dataset.a;
  if(a==='rand'){NICK=cleanNick(pick(ADJ)+pick(NOUN)+rnd(1,99));ls.set('bn-nick',NICK);const i=document.getElementById('nick');if(i)i.value=NICK;const dc=document.getElementById('daily');if(dc)dc.innerHTML=dailyCard();const m=document.getElementById('msg');if(m)m.textContent=''}
  else if(a==='band'){
    if(NICK.length<2){const m=document.getElementById('msg'),i=document.getElementById('nick');if(m)m.textContent='Pick a ninja name first. Use at least 2 letters, or tap Surprise me.';if(i)i.focus();return}
    S.band=t.dataset.b;loadLP();go('cats');
  }
  else if(a==='start')go('home');
  else if(a==='welcome')go('welcome');
  else if(a==='howto')go('howto');
  else if(a==='hback')go(S.hfrom&&S.hfrom!=='howto'?S.hfrom:'welcome');
  else if(a==='home'){S.band=null;go('home')}
  else if(a==='cats')go('cats');
  else if(a==='cat'){S.cat=t.dataset.c;go('hub')}
  else if(a==='hub')go('hub');
  else if(a==='level'){S.level=+t.dataset.l;go('rounds')}
  else if(a==='rounds')go('rounds');
  else if(a==='round'){S.round=+t.dataset.r;startRound()}
  else if(a==='nextround'){S.round++;startRound()}
  else if(a==='again')startRound();
  else if(a==='nextlevel'){S.level++;S.round=0;startRound()}
  else if(a==='go')beginRound();
  else if(a==='memodone'){S.memoDone=true;render();startQ()}
  else if(a==='pick')answer(+t.dataset.k);
  else if(a==='next'){
    if(S.i===S.qs.length-1)finish();
    else{S.i++;S.picked=null;S.memoDone=false;render();enter();window.scrollTo(0,0);if(!S.qs[S.i].memo)startQ()}
  }
  else if(a==='board')go('board');
  else if(a==='reload')NET.refresh(NICK,true);
  else if(a==='back')go(S.from&&S.from!=='board'?S.from:'home');
});

document.addEventListener('keydown',e=>{
  if(S.screen!=='play'||e.ctrlKey||e.metaKey||e.altKey)return;
  const q=S.qs[S.i];if(!q||(q.memo&&!S.memoDone)||S.picked!==null)return;
  const k=Math.max('abcd'.indexOf(e.key.toLowerCase()),['1','2','3','4'].indexOf(e.key));
  if(k>=0&&k<q.opts.length)answer(k);
});

/* ---------- drifting background glyphs ---------- */
(function(){
  const bg=document.getElementById('bg'),g=['+','×','÷','?','=','7','3','Aa','π','%','2','9','−','?','5','₦'];
  bg.innerHTML=g.map((c,i)=>`<span style="--x:${(i*37+8)%94}%;--y:${(i*53+6)%92}%;--s:${rnd(30,64)}px;--t:${rnd(14,26)}s;--dl:-${rnd(0,14)}s;--r0:${rnd(-25,25)}deg;--r1:${rnd(-40,40)}deg;--dx:${rnd(-40,40)}px;--dy:${rnd(-60,60)}px">${esc(c)}</span>`).join('');
})();

tr('init',()=>NICK);
NET.init(()=>({nick:NICK,total:totalsOf(ALL[NICK]||{}).total}));  /* the typed nickname's own profile, even before it is loaded */
render();
