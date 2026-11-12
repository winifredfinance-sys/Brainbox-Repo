/* Menu screens: welcome, how to play, home (name + age band), puzzle types, levels, rounds */
import {useEffect,useRef,useState} from 'react';
import {BANDS,LEVELS,ROUNDS_PER_LEVEL,QUESTIONS_PER_ROUND,PASS_MARK,TIMER_SECONDS,SPEED,LEVEL_MULTIPLIER,NICKNAME_MAX} from '../config/gameConfig.js';
import {typesFor,typeOf} from '../engine/questions.js';
import {dailyState} from '../engine/daily.js';
import {pick,rnd,fmtN} from '../engine/helpers.js';
import {ADJ,NOUN} from '../data/names.js';
import {LEVEL_NOTE} from '../data/copy.js';
import * as P from '../services/progress.js';
import * as LB from '../services/leaderboard.js';
import {Mascot,Stars,FxPanel,Back} from '../components/Common.jsx';
import {MiniBoard} from './Board.jsx';

export function Welcome({s,a}){
  const t=P.totals(s.nick);
  return <section className="welcome"><Mascot/><h1 className="wtitle">Brainbox <em>Ninja</em></h1>
    <p className="wsub">{s.nick&&t.total>0?`Welcome back, ${s.nick}. Ready for another round?`:'The timed puzzle game for every age.'}</p>
    <div className="wfeat"><span>Ages 4 to 60+</span><span>Maths, words, proverbs, riddles</span><span>Beat the clock</span></div>
    <button className="btn primary big" onClick={()=>a.go('home')}>Start Game</button>
    <button className="btn" onClick={()=>a.go('howto')}>How to play</button>
    <button className="link" onClick={()=>a.go('board')}>View the leaderboard</button>
    <p className="foot">Free to play. No ads. We collect anonymous gameplay stats and ninja names to improve the game, never real names or personal details.</p></section>;
}

export function HowTo({a}){
  return <>
    <Back onClick={a.backFromHowto}>Back</Back>
    <header className="top"><h1>How to play</h1><p className="lead">Four quick steps. A round takes about two minutes.</p></header>
    <ol className="steps">
      <li><strong>Choose your ninja name</strong><span>This is the name shown on the global leaderboard, up to {NICKNAME_MAX} letters. Use a nickname, not your real full name. Tap Shuffle for a new one, or type your own.</span></li>
      <li><strong>Pick your age range</strong><span>You get puzzles made for your age: {BANDS.map(b=>b.range).join(', ').replace(/, ([^,]*)$/,' or $1')}.</span></li>
      <li><strong>Choose a puzzle type</strong><span>Maths, words, proverbs, riddles, memory and more. Start at Beginner and work up to Hard.</span></li>
      <li><strong>Answer before the timer runs out</strong><span>Each round has {QUESTIONS_PER_ROUND} questions. Tap an answer, or press A to D on a keyboard. A quick right answer earns {SPEED.max} points, falling to {SPEED.min} as the clock runs down.</span></li>
    </ol>
    <section className="panel"><h2 className="sub">Scoring and levels</h2><ul className="rules">
      <li>Score {PASS_MARK} out of {QUESTIONS_PER_ROUND} to pass a round and open the next one.</li>
      <li>Pick any level: Beginner, Medium or Hard. Every level has {ROUNDS_PER_LEVEL} rounds, and they open one by one.</li>
      <li>Answer fast: a right answer is worth {SPEED.max} points at once and {SPEED.min} at the buzzer.</li>
      <li>Medium levels score {LEVEL_MULTIPLIER[1]}× points and Hard levels score {LEVEL_MULTIPLIER[2]===2?'double':LEVEL_MULTIPLIER[2]+'×'}.</li>
      <li>Rounds get harder as you go: Round {ROUNDS_PER_LEVEL} is tougher than Round 1.</li>
      <li>Hit your daily points target every day to build a streak.</li>
      <li>Your best score in each round counts on the leaderboard.</li></ul></section>
    <button className="btn primary" onClick={()=>a.go('home')}>Start Game</button>
  </>;
}

/* ninja names: Adjective + Noun + 3-4 digits, avoiding names already used here, on the board and online */
function freshName(){
  const used=new Set(Object.keys(P.allProfiles()).concat((LB.getTopScores().rows||[]).map(r=>r.player_name)).map(n=>String(n).toLowerCase()));
  let n='';for(let i=0;i<50;i++){n=pick(ADJ)+pick(NOUN)+rnd(100,9999);if(n.length<=NICKNAME_MAX&&!used.has(n.toLowerCase()))break}
  return n;
}

function DailyCard({nick}){
  if(!nick||nick.length<2)return <><h2 className="sub">Daily challenge</h2><p className="lead">Pick a ninja name to start today’s challenge.</p></>;
  const d=dailyState(P.dailyData(nick),null),fire=d.streak?<span className="streak">🔥 {d.streak}-day streak</span>:null;
  if(!d.target)return <><div className="mh"><h2 className="sub">Daily challenge</h2>{fire}</div><p className="lead">Play a round to see today’s points target for your age range.</p></>;
  const pct=Math.min(100,Math.round(100*d.pts/d.target)),b=BANDS.find(x=>x.id===d.band);
  return <><div className="mh"><h2 className="sub">Daily challenge</h2>{fire}</div>
    <p className="dnum"><b>{fmtN(d.pts)} / {fmtN(d.target)}</b> points today{d.hit&&<> <span className="dok">✓ target reached</span></>}</p>
    <div className="dbar" role="progressbar" aria-label="Daily target" aria-valuemin="0" aria-valuemax={d.target} aria-valuenow={Math.min(d.pts,d.target)}><i style={{width:pct+'%'}}/></div>
    <p className="foot">{d.hit?'Come back tomorrow to keep your streak going.':d.keepUp?'Reach the target today to keep your streak.':'Reach the target every day to build a streak.'} Target for ages {b?b.range:''}.</p></>;
}

export function Home({s,a}){
  const t=P.totals(s.nick),[msg,setMsg]=useState(''),[note,setNote]=useState(''),[draft,setDraft]=useState(s.nick);
  const seq=useRef(0),timer=useRef(null),input=useRef(null);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const use=(n,typed)=>{a.setNick(n);if(!typed)setDraft(P.cleanNick(n))};
  async function shuffle(){
    const my=++seq.current;let n=freshName();use(n);setNote('');setMsg('');
    for(let k=0;k<4;k++){const taken=await LB.nameTaken(n);if(my!==seq.current)return;if(taken!==true)break;n=freshName();use(n)}
  }
  function typed(v){
    setDraft(v);use(v,true);clearTimeout(timer.current);const n=P.cleanNick(v),my=++seq.current;setNote('');
    if(n.length<2)return;
    timer.current=setTimeout(async()=>{const taken=await LB.nameTaken(n);if(my===seq.current&&taken===true)setNote('Another player already uses this name. You can keep it, or tap Shuffle for one of your own.')},700);
  }
  function chooseBand(id){
    if(s.nick.length<2){setMsg('Pick a ninja name first. Use at least 2 letters, or tap Shuffle.');input.current&&input.current.focus();return}
    a.chooseBand(id);
  }
  return <>
    <Back onClick={()=>a.go('welcome')}>Title screen</Back>
    <header className="hero"><Mascot/><div className="top"><h1>Get ready</h1><p className="lead">Pick a ninja name and your age range. <button className="link inline" onClick={()=>a.go('howto')}>How to play</button></p></div></header>
    <section className="panel"><label htmlFor="nick">Your ninja name</label>
      <div className="row"><input id="nick" ref={input} maxLength={NICKNAME_MAX} autoComplete="off" placeholder="e.g. BraveMango4821" value={draft} onChange={e=>typed(e.target.value)}/><button className="btn" type="button" onClick={shuffle}>Shuffle</button></div>
      <p id="msg" className="msg" role="alert">{msg}</p><p id="nmsg" className="foot" role="status">{note}</p>
      <FxPanel onSound={a.toggleSound} onVibe={a.toggleVibe}/></section>
    <section id="daily" className="panel daily"><DailyCard nick={s.nick}/></section>
    <h2 className="sub">Choose your age range</h2>
    <div className="grid ages">{BANDS.map(b=><button key={b.id} className="card" style={{'--c':`var(--${b.id})`,'--cbg':`var(--${b.id}-bg)`}} onClick={()=>chooseBand(b.id)}><span className="rng">{b.range}</span><span className="nm">{b.name}</span><span className="bl">{b.blurb}</span><span className="pr">{t[b.id].toLocaleString('en-NG')} pts</span></button>)}</div>
    <section id="mini" className="panel"><MiniBoard s={s} a={a}/></section>
    <p className="foot">No ads and no videos. Your progress saves on this device and your total goes on the global leaderboard. No sign-up needed.</p>
  </>;
}

export function Types({s,a,band}){
  const b=band();
  return <>
    <Back onClick={a.home}>Change age range</Back>
    <header className="top"><span className="chip">Ages {b.range}</span><h1>{b.name}</h1><p className="lead">Pick a puzzle type. Each has three levels, and every level has ten rounds of ten timed questions.</p></header>
    <div className="grid cats">{typesFor(b.id).map(c=>{const n=[0,1,2].reduce((x,l)=>x+P.passedRounds(s.nick,b.id,c.id,l),0);
      return <button key={c.id} className="card" onClick={()=>a.chooseType(c.id)}><span className="glyph">{c.glyph}</span><span className="nm">{c.name}</span><span className="bl">{c.blurb}</span><span className="pr">{n} of {3*ROUNDS_PER_LEVEL} rounds passed</span></button>})}</div>
    <button className="btn" onClick={()=>a.go('board')}>View leaderboard</button>
  </>;
}

export function Levels({s,a,band}){
  const b=band(),c=typeOf(b.id,s.type);
  const fresh=![0,1,2].some(l=>P.playedLevel(s.nick,b.id,s.type,l));
  return <>
    <Back onClick={()=>a.go('cats')}>{b.name}</Back>
    <header className="top"><span className="chip">Ages {b.range}</span><h1>{c.name}</h1><p className="lead">{c.blurb}</p></header>
    <p className="lead">Pick any level. Start with Beginner, or jump straight to Medium or Hard for tougher questions and more points.</p>
    <ol className="levels">{LEVELS.map((n,i)=>{
      const pr=P.passedRounds(s.nick,b.id,s.type,i),played=P.playedLevel(s.nick,b.id,s.type,i);
      const st=Array.from({length:ROUNDS_PER_LEVEL},(_,r)=>P.rec(s.nick,b.id,s.type,i,r).s).reduce((x,y)=>x+y,0);
      const info=`${LEVEL_NOTE[i]} · ${TIMER_SECONDS[b.id][i]} s per question`+(played?` · ${pr} of ${ROUNDS_PER_LEVEL} rounds passed · ${st} of ${ROUNDS_PER_LEVEL*3} stars`:'');
      return <li key={i}><button className="lvl" onClick={()=>a.chooseLevel(i)}><span className="ln"><small>Level {i+1}</small>{n}{fresh&&i===0&&<> <span className="badge-s">Start here</span></>}</span><span className="ls">{P.levelDone(s.nick,b.id,s.type,i)?'Cleared ✓':played?pr+'/'+ROUNDS_PER_LEVEL:'New'}</span><span className="lh">{info}</span></button></li>})}</ol>
    <p className="foot">Each level has {ROUNDS_PER_LEVEL} rounds of {QUESTIONS_PER_ROUND} timed questions. Pass a round with {PASS_MARK} out of {QUESTIONS_PER_ROUND} to open the next round in that level.</p>
  </>;
}

export function Rounds({s,a,band}){
  const b=band(),c=typeOf(b.id,s.type),l=s.level,next=P.nextRoundOf(s.nick,b.id,s.type,l),pr=P.passedRounds(s.nick,b.id,s.type,l);
  return <>
    <Back onClick={()=>a.go('hub')}>{c.name}</Back>
    <header className="top"><span className="chip">{LEVELS[l]} level</span><h1>{pr>=ROUNDS_PER_LEVEL?'Level cleared':'Round '+(next+1)+' is next'}</h1><p className="lead">{pr} of {ROUNDS_PER_LEVEL} rounds passed. Ten questions per round, {TIMER_SECONDS[b.id][l]} seconds each.</p></header>
    <button className="btn primary" onClick={()=>a.playRound(next)}>{pr>=ROUNDS_PER_LEVEL?'Play a round again':(pr?'Continue with Round '+(next+1):'Start Round 1')}</button>
    <div className="rgrid">{Array.from({length:ROUNDS_PER_LEVEL},(_,r)=>{const open=P.roundOpen(s.nick,b.id,s.type,l,r),x=P.rec(s.nick,b.id,s.type,l,r);
      return <button key={r} className={'rnd'+(x.s>=1?' done':'')} disabled={!open} onClick={()=>a.playRound(r)}><span className="rn">{r+1}</span><span className="rs">{open?<Stars n={x.s}/>:'Locked'}</span>{x.p?<span className="rp">{x.p} pts</span>:null}</button>})}</div>
    <p className="foot">Pass a round with {PASS_MARK} out of {QUESTIONS_PER_ROUND} to open the next one. Replay any round to beat your best points.</p>
  </>;
}
