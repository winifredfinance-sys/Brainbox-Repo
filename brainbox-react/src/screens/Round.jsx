/* A round: the "Get ready" card, the timed questions, and the results screen */
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {BANDS,LEVELS,ROUNDS_PER_LEVEL,QUESTIONS_PER_ROUND,PASS_MARK,TIMER_SECONDS} from '../config/gameConfig.js';
import {typeOf,typesFor} from '../engine/questions.js';
import {ptsFor} from '../engine/scoring.js';
import {adaptNote} from '../engine/adaptive.js';
import {dailyState} from '../engine/daily.js';
import {mmss,fmtN} from '../engine/helpers.js';
import {TIPS} from '../data/copy.js';
import * as P from '../services/progress.js';
import * as LB from '../services/leaderboard.js';
import {Stars,Confetti,Ring,MuteButton} from '../components/Common.jsx';

const focusNext=()=>{const b=document.getElementById('nextbtn');if(b)b.focus()};

export function Ready({s,a,band}){
  const b=band(),c=typeOf(b.id,s.type),secs=TIMER_SECONDS[b.id][s.level];
  useEffect(focusNext,[]);
  return <>
    <div className="topbar"><button className="link" onClick={()=>a.go('rounds')}>← Rounds</button><MuteButton onToggle={a.toggleSound}/></div>
    <section className="qcard ready"><span className="chip">{c.name} · {LEVELS[s.level]} · Round {s.round+1} of {ROUNDS_PER_LEVEL}</span>
      <h1>Get ready</h1>
      <p className="rfacts"><span><b>{s.qs.length}</b> questions</span><span><b>{secs}</b> seconds each</span></p>
      <p className="fast"><strong>Answer fast for more points.</strong> A right answer is worth {ptsFor(1,1,s.level)} points straight away, falling to {ptsFor(0,1,s.level)} at the buzzer.</p>
      {s.adj?<p><span className="chip">{adaptNote(s.adj)}</span></p>:null}
      <button className="btn primary big" id="nextbtn" onClick={a.beginRound}>Start round</button></section>
  </>;
}

export function Play({s,a}){
  const q=s.qs[s.i],N=s.qs.length,done=s.picked!==null,waitingMemo=q.memo&&!s.memoDone;
  const [rem,setRem]=useState(s.limit),[oneCol,setOneCol]=useState(false),optsRef=useRef(null);
  /* the clock: every 100 ms while a question is open */
  useEffect(()=>{
    if(done||waitingMemo||!s.qStart)return;
    setRem(s.limit);
    const id=setInterval(()=>setRem(a.tick()),100);
    return ()=>clearInterval(id);
  },[s.i,done,waitingMemo,s.qStart]);
  /* keyboard: A-D or 1-4 to answer */
  useEffect(()=>{
    const onKey=e=>{
      if(e.ctrlKey||e.metaKey||e.altKey||done||waitingMemo)return;
      const k=Math.max('abcd'.indexOf(e.key.toLowerCase()),['1','2','3','4'].indexOf(e.key));
      if(k>=0&&k<q.opts.length){e.preventDefault();a.answer(k)}
    };
    document.addEventListener('keydown',onKey);return ()=>document.removeEventListener('keydown',onKey);
  },[s.i,done,waitingMemo]);
  useEffect(()=>{if(done)focusNext()},[done]);
  /* two answer columns only when every answer fits on one line */
  useLayoutEffect(()=>{setOneCol(false)},[s.i]);
  useLayoutEffect(()=>{const el=optsRef.current;if(el&&el.classList.contains('two')&&[...el.children].some(o=>o.scrollWidth>o.clientWidth+1))setOneCol(true)});
  const live=done?s.rem:Math.max(0,rem),frac=s.limit?live/s.limit:1,clock=s.totalMs+(done||!s.qStart?0:s.limit-live);
  const short=q.opts.every(o=>o.length<9)&&!oneCol;
  const top=<>
    <div className="topbar"><button className="link" onClick={()=>a.go('rounds')}>← Rounds</button><span className="meta">{LEVELS[s.level]} · Round {s.round+1} · Time <span id="tclk">{mmss(clock)}</span></span><MuteButton onToggle={a.toggleSound}/></div>
    <div className="prog" role="progressbar" aria-label="Question progress" aria-valuemin="0" aria-valuemax={N} aria-valuenow={s.i+(done?1:0)}>{s.qs.map((_,k)=><i key={k} className={k<s.i||(k===s.i&&done)?'done':k===s.i?'now':''}/>)}</div>
    {s.adj?<p><span className="chip">{adaptNote(s.adj)}</span></p>:null}
  </>;
  if(waitingMemo)return <>{top}<section className="qcard"><p className="qn">Question {s.i+1} <span>of {N}</span></p><p className="q">Remember these items. The clock starts when you are ready.</p><p className="show memo">{q.memo}</p><button className="btn primary" onClick={a.memoDone}>I have remembered them</button></section></>;
  const ok=s.picked===q.ans,to=s.picked===-1;
  return <>{top}
    <div className="timer" aria-label="Time left"><span className="tl">Time left</span><div className="tbarwrap"><div id="tbar" className={frac<.25?'low':frac<.5?'mid':''} style={{transform:`scaleX(${frac})`}}/></div><span id="tnum">{Math.ceil((done?s.rem:(s.qStart?live:s.limit))/1000)}s</span><span id="tpts" className="tpts" aria-label="Points for a right answer now">{done?'':ptsFor(s.qStart?live:s.limit,s.limit,s.level)+' pts'}</span></div>
    <section className="qcard"><p className="qn">Question {s.i+1} <span>of {N}</span></p><p className="q">{q.q}</p>{q.show?<p className="show">{q.show}</p>:null}
      <div ref={optsRef} className={'opts'+(short?' two':'')} role="group" aria-label="Answer choices">{q.opts.map((o,k)=>{
        let c='opt',m='ABCD'[k];if(done){if(k===q.ans){c+=' good';m='✓'}else if(k===s.picked){c+=' bad';m='✗'}}
        return <button key={k} className={c} disabled={done} onClick={()=>a.answer(k)}><span className="key">{m}</span><span className="ot">{o}</span></button>})}</div>
      {!done&&<p className="hint">Tip: press A to D, or 1 to 4, to answer.</p>}
      {done&&<><div className={'fb '+(ok?'good':'bad')} role="status"><strong>{ok?`Correct! +${s.gain} pts in ${(s.used/1000).toFixed(1)}s`:to?'Time is up.':'Not quite.'}</strong> {ok?'':`The answer is ${q.opts[q.ans]}. `}{q.why||''}</div>
        <button className="btn primary" id="nextbtn" onClick={a.next}>{s.i===N-1?'See my score':'Next question'}</button></>}
    </section></>;
}

const SYNC={saving:'Sending your total to the global leaderboard…',saved:'Your total is on the global leaderboard.',failed:'Could not reach the global leaderboard. Your score is safe on this device and will be sent later.',offline:'You are offline. Your score is safe on this device and will be sent when you are back online.'};

function suggestions(s,b){
  const r=s.res,out=[],passedN=c=>[0,1,2].reduce((x,l)=>x+P.passedRounds(s.nick,b.id,c.id,l),0);
  const fresh=typesFor(b.id).filter(c=>c.id!=='mix'&&c.id!==s.type).sort((x,y)=>passedN(x)-passedN(y)||Math.random()-.5)[0];
  if(fresh)out.push({kind:'type',id:fresh.id,t:'Try '+fresh.name,d:(passedN(fresh)?passedN(fresh)+' of '+3*ROUNDS_PER_LEVEL+' rounds passed. ':'New for you. ')+fresh.blurb});
  if(r.pass&&s.type!=='mix')out.push({kind:'type',id:'mix',t:'Play Mix It Up',d:'A bit of everything from this age range.'});
  const bi=BANDS.findIndex(x=>x.id===b.id),nb=BANDS[bi+1]||BANDS[bi-1];
  out.push({kind:'band',id:nb.id,t:'Peek at the '+nb.range+' puzzles',d:nb.name+': '+nb.blurb});
  return out.slice(0,3);
}

export function Result({s,a,band}){
  const r=s.res,b=band(),tip=TIPS[s.type]||TIPS.mix,acc=Math.round(100*r.score/r.n);
  const sugg=useMemo(()=>suggestions(s,b),[r]);
  const msg=r.cleared?(s.level===2?'You cleared every level of this puzzle type.':`You passed all ${ROUNDS_PER_LEVEL} rounds of ${LEVELS[s.level]}. Ready for ${LEVELS[s.level+1]}?`):r.pass?`Round ${r.round+1} passed. Round ${r.round+2} is open.`:`You need ${PASS_MARK} out of ${QUESTIONS_PER_ROUND} to pass. Try again with fresh questions.`;
  let primary;
  if(r.cleared&&s.level<2)primary=<button className="btn primary" onClick={a.nextLevel}>Try {LEVELS[s.level+1]}</button>;
  else if(r.cleared)primary=<button className="btn primary" onClick={()=>a.go('cats')}>Pick another puzzle type</button>;
  else if(r.pass)primary=<button className="btn primary" onClick={a.nextRound}>Next round (Round {r.round+2})</button>;
  else primary=<button className="btn primary" onClick={a.startRound}>Play Again</button>;
  const dy=dailyState(P.dailyData(s.nick),s.band);
  const party=r.pass||r.dailyHit;
  return <section className="res">{party&&<Confetti/>}<p className={'shout'+(party?'':' soft')}>{r.shout}</p><span className="chip">{LEVELS[s.level]} · Round {r.round+1} of {ROUNDS_PER_LEVEL}</span><Ring score={r.score} n={r.n} pass={r.pass}/><p className="ss"><Stars n={r.stars}/></p>
    <div className="stats"><div className="stat"><b>+{r.pts}</b><span>points{r.newBest?' · new best':''}</span></div><div className="stat"><b>{mmss(r.ms)}</b><span>round time</span></div><div className="stat"><b>{acc}%</b><span>correct</span></div></div>
    {dy.target?<div className={'dres'+(r.dailyHit?' hit':'')} role="status">{r.dailyHit
      ?<><strong>🎯 Daily target reached!</strong> <span className="nw">🔥 {dy.streak}-day streak</span></>
      :<><strong>{fmtN(dy.pts)} / {fmtN(dy.target)}</strong> points today{dy.hit?' · target reached ✓':` · ${fmtN(dy.target-dy.pts)} to go`}{dy.streak?<> · <span className="nw">🔥 {dy.streak}-day streak</span></>:null}</>}</div>:null}
    <p className="lead">{msg} {r.passed} of {ROUNDS_PER_LEVEL} rounds passed in this level.</p>
    <p className="foot" id="sync" role="status">{SYNC[LB.sendState()]||''}</p>
    {r.nextAdj?<p className="note"><strong>Smart difficulty:</strong> {r.nextAdj>0?'you are doing very well, so your next round will mix in 3 harder questions.':'this one looks tricky, so your next round will mix in 3 easier questions.'}</p>:null}
    <div className="stack">{primary}{r.pass&&<button className="btn" onClick={a.startRound}>Play Again</button>}</div>
    <div className="tip"><strong>Pointer:</strong> {tip}</div>
    <h2 className="sub">What next?</h2>
    <div className="stack">{sugg.map(x=><button key={x.kind+x.id} className="sugg" onClick={()=>x.kind==='type'?a.chooseType(x.id):a.chooseBand(x.id)}><strong>{x.t}</strong><span>{x.d}</span></button>)}</div>
    <div className="navrow"><button className="btn" onClick={()=>a.go('rounds')}>All rounds</button><button className="btn" onClick={()=>a.go('cats')}>Puzzle types</button><button className="btn" onClick={a.home}>Age range</button><button className="btn" onClick={()=>a.go('board')}>Leaderboard</button></div></section>;
}
