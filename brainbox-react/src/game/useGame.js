/* The game's state and actions in one place. Screens read `s` and call the actions; they never touch
   storage, the question builder or the leaderboard directly.

   The live round state is kept in one object (like the old game), and the hook re-renders after each change.
   This keeps the timer simple and exact. */
import {useReducer,useRef,useSyncExternalStore} from 'react';
import {BANDS,TIMER_SECONDS,PASS_MARK,QUESTIONS_PER_ROUND,TICK_LAST_SECONDS} from '../config/gameConfig.js';
import {buildRound,poolKey} from '../engine/questions.js';
import {ptsFor,passed,starsFor} from '../engine/scoring.js';
import {decide} from '../engine/adaptive.js';
import {addDaily,dailyState} from '../engine/daily.js';
import * as P from '../services/progress.js';
import * as LB from '../services/leaderboard.js';
import {TRACK} from '../services/track.js';
import {FX} from '../services/sound.js';
import {CLEARED,PERFECT,SHOUTS,TRY} from '../data/copy.js';
import {pick} from '../engine/helpers.js';

/* stats and sound can never stop or slow the game */
export const tr=(f,a)=>{try{TRACK[f](a)}catch(e){}};
export const fx=n=>{try{FX.play(n)}catch(e){}};

/* start the leaderboard and stats once, when the game loads */
let started=false;
function startServices(getNick){
  if(started)return;started=true;
  tr('init',getNick);
  LB.start(()=>{const n=getNick();return {nick:n,total:P.totalsOf(P.profileOf(n)).total}});
}

export function useGame(){
  const [,rerender]=useReducer(x=>x+1,0);
  const ref=useRef(null);
  if(!ref.current)ref.current={screen:'welcome',from:'home',hfrom:'welcome',band:null,type:null,level:0,round:0,
    qs:[],i:0,score:0,pts:0,gain:0,totalMs:0,picked:null,memoDone:false,qStart:0,limit:0,rem:0,used:0,to:0,tickAt:0,
    adj:0,live:false,res:null,nick:P.getNick(),nav:0};
  const s=ref.current;
  startServices(()=>ref.current.nick);
  useSyncExternalStore(LB.subscribe,LB.getVersion);   /* re-render when the leaderboard changes */

  const band=()=>BANDS.find(b=>b.id===s.band);
  function go(screen){
    if(s.screen==='play'&&screen!=='play'&&s.live)tr('roundQuit');
    if(screen==='board'&&s.screen!=='board')s.from=s.screen;
    if(screen==='howto'&&s.screen!=='howto')s.hfrom=s.screen;
    s.screen=screen;s.nav++;rerender();
    if(screen==='board'||screen==='home')LB.refresh(s.nick);
    try{window.scrollTo(0,0)}catch(e){}
  }
  function setNick(n){s.nick=P.cleanNick(n);P.saveNick(s.nick);rerender()}
  function chooseBand(id){s.band=id;go('cats')}

  /* a round is built and shown on the "Get ready" card; the clock starts on "Start round" */
  function startRound(){
    s.live=false;
    s.adj=decide({history:P.skillHistory(s.nick,s.band,s.type),level:s.level,band:s.band});
    s.qs=buildRound({band:s.band,type:s.type,level:s.level,round:s.round,adj:s.adj,seenFor:k=>P.seenFor(s.nick,k)});
    const keys=[poolKey(s.band,s.type,s.level)];if(s.adj)keys.push(poolKey(s.band,s.type,s.level+s.adj));
    P.saveSeen(s.nick,keys);
    go('ready');
  }
  function beginRound(){
    if(s.screen!=='ready'||!s.qs.length)return;
    s.live=true;s.i=0;s.score=0;s.pts=0;s.totalMs=0;s.picked=null;s.memoDone=false;s.to=0;
    tr('roundStart',{band:s.band,cat:s.type,level:s.level,round:s.round,adj:s.adj,total:s.qs.length});
    go('play');if(!s.qs[0].memo)startQ();
  }
  function startQ(){s.tickAt=0;s.qStart=Date.now();s.limit=TIMER_SECONDS[s.band][s.level]*1000;rerender()}
  function memoDone(){s.memoDone=true;startQ()}
  /* called by the timer every 100 ms; returns the ms left */
  function tick(){
    if(s.screen!=='play'||s.picked!==null||!s.qStart)return 0;
    const rem=s.limit-(Date.now()-s.qStart);
    if(rem<=0){answer(-1);return 0}
    const sec=Math.ceil(rem/1000);if(sec<=TICK_LAST_SECONDS&&sec!==s.tickAt){s.tickAt=sec;fx('tick')}
    return rem;
  }
  /* k = option index, or -1 when the time ran out */
  function answer(k){
    if(s.picked!==null||s.screen!=='play')return;
    const q=s.qs[s.i],used=Math.min(s.limit,Date.now()-s.qStart);
    s.totalMs+=used;s.rem=Math.max(0,s.limit-used);s.used=used;s.picked=k;s.gain=0;
    if(k===q.ans){s.score++;s.gain=ptsFor(s.rem,s.limit,s.level);s.pts+=s.gain}
    if(k===-1)s.to++;
    fx(k===q.ans?'right':k===-1?'timeout':'wrong');
    tr('progress',{answered:s.i+1,score:s.score,points:s.pts,ms:s.totalMs,timeouts:s.to});
    rerender();
  }
  function next(){
    if(s.picked===null)return;
    if(s.i===s.qs.length-1)return finish();
    s.i++;s.picked=null;s.memoDone=false;s.qStart=0;s.nav++;rerender();
    try{window.scrollTo(0,0)}catch(e){}
    if(!s.qs[s.i].memo)startQ();
  }
  function finish(){
    if(!s.live)return;s.live=false;
    const n=s.qs.length,ratio=s.score/n,pass=passed(s.score,n),st=starsFor(s.score,n),pts=s.pts;
    const old=P.saveRound(s.nick,s.band,s.type,s.level,s.round,{stars:st,pts,ms:s.totalMs,pass});
    P.recordSkill(s.nick,s.band,s.type,ratio);
    LB.saveScore(s.nick,P.totals(s.nick).total);   /* the round is complete and its points are final */
    tr('roundEnd',{score:s.score,points:pts,ms:s.totalMs,passed:pass,timeouts:s.to});
    const d=addDaily(P.dailyData(s.nick),pts,s.band);P.saveDaily(s.nick,d.data);
    const dy=dailyState(d.data,s.band);
    if(d.justHit)tr('dailyHit',{band:s.band,points:dy.pts,target:dy.target,streak:dy.streak});
    const cleared=pass&&P.levelDone(s.nick,s.band,s.type,s.level);
    s.res={score:s.score,n,pts,ms:s.totalMs,stars:st,pass,newBest:pts>old.p,round:s.round,cleared,
      passed:P.passedRounds(s.nick,s.band,s.type,s.level),nextAdj:decide({history:P.skillHistory(s.nick,s.band,s.type),level:s.level,band:s.band}),dailyHit:d.justHit};
    fx(d.justHit||cleared?'big':pass?'pass':'fail');
    s.res.shout=d.justHit?'Daily target reached!':cleared?pick(CLEARED):pass?pick(st===3?PERFECT:SHOUTS):pick(TRY);
    go('result');
  }
  const actions={
    go,setNick,chooseBand,startRound,beginRound,answer,next,memoDone,tick,
    chooseType(id){s.type=id;go('hub')},
    chooseLevel(l){s.level=l;go('rounds')},
    playRound(r){s.round=r;startRound()},
    nextRound(){s.round++;startRound()},
    nextLevel(){s.level++;s.round=P.nextRoundOf(s.nick,s.band,s.type,s.level);startRound()},
    home(){s.band=null;go('home')},
    back(){go(s.from&&s.from!=='board'?s.from:'home')},
    backFromHowto(){go(s.hfrom&&s.hfrom!=='howto'?s.hfrom:'welcome')},
    toggleSound(){try{FX.setSound(!FX.sound())}catch(e){}rerender()},
    toggleVibe(){try{FX.setVibe(!FX.vibe())}catch(e){}rerender()},
    reload(){LB.refresh(s.nick,true)},
    rerender
  };
  return {s,band,actions};
}
export {QUESTIONS_PER_ROUND,PASS_MARK};
