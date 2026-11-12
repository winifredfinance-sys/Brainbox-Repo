/* The leaderboard screen and the small top-3 preview on the home screen. Data comes only from
   src/services/leaderboard.js, so the board can move to another database without changing this file. */
import {LEADERBOARD_SIZE,HOME_PREVIEW_SIZE} from '../config/gameConfig.js';
import {fmtN} from '../engine/helpers.js';
import * as P from '../services/progress.js';
import * as LB from '../services/leaderboard.js';
import {Back} from '../components/Common.jsx';

function Row({e,i,nick}){
  const me=LB.isMe(e,nick);
  return <li className={me?'me':''}><span className={'rk r'+(i<3?i+1:0)}>{i+1}</span><span className="pn">{e.player_name||'Ninja'}{me?' (you)':''}</span><span className="pt">{fmtN(e.score)}</span></li>;
}
function Rows({list,lim,nick,me}){
  const top=list.slice(0,lim),mi=list.findIndex(e=>LB.isMe(e,nick));
  return <ol className="rows">{top.map((e,i)=><Row key={e.user_id+'|'+e.player_name} e={e} i={i} nick={nick}/>)}
    {mi>=lim&&<Row e={list[mi]} i={mi} nick={nick}/>}
    {mi<0&&me&&me.rank&&<Row e={{user_id:LB.myId(),player_name:nick,score:me.score}} i={me.rank-1} nick={nick}/>}</ol>;
}
function message(st){
  if(st==='off')return 'The global leaderboard is not switched on yet. Your progress is still saved on this device.';
  if(st==='offline')return 'You are offline. Your progress is saved on this device, and your score will be sent when you are back online.';
  if(st==='error')return 'The leaderboard could not load just now. Check your connection and try again.';
  if(st!=='ok')return 'Loading the leaderboard…';
  return '';
}
const Empty=()=><p className="lead">No scores yet. Be the first ninja on the board.</p>;

export function MiniBoard({s,a}){
  const B=LB.getTopScores(),m=message(B.status);
  return <><div className="mh"><h2 className="sub">Leaderboard</h2><button className="link" onClick={()=>a.go('board')}>See all →</button></div>
    <div id="minibody">{!B.rows.length?(m?<><p className="lead" role="status">{m}</p>{B.status==='error'&&<button className="btn" onClick={a.reload}>Try again</button>}</>:<Empty/>):<Rows list={B.rows} lim={HOME_PREVIEW_SIZE} nick={s.nick}/>}</div></>;
}

function Chase({list,nick,me}){
  const mi=list.findIndex(e=>LB.isMe(e,nick)),t=P.totals(nick).total;
  if(mi>=0){const my=+list[mi].score,up=list[mi-1],dn=list[mi+1];
    return <p className="chase"><strong>You are #{mi+1} with {fmtN(my)} pts.</strong> {up?`${up.player_name} is ${fmtN(+up.score-my)} pts ahead of you. Catch up!`:'You are in front. Keep going!'} {dn?`${dn.player_name} is ${fmtN(my-(+dn.score))} pts behind you.`:''}</p>}
  if(me)return <p className="chase"><strong>Your best: {fmtN(me.score)} pts{me.rank?` (#${me.rank})`:''}.</strong> Keep playing to climb into the top {LEADERBOARD_SIZE}.</p>;
  if(nick&&t>0&&LB.online)return <p className="chase">Your {fmtN(t)} pts will show here once they reach the leaderboard.</p>;
  return <p className="chase">Play a round to join the board.</p>;
}

export function Board({s,a}){
  const B=LB.getTopScores(),list=B.rows,m=message(B.status),retry=B.status==='error'&&<button className="btn" onClick={a.reload}>Try again</button>;
  const local=(B.status==='error'||B.status==='offline')&&!list.length?LB.localTop():[];
  let body;
  if(!list.length)body=m?<><p className="chase" role="status">{m}</p>{retry}</>:<><Empty/><Chase list={list} nick={s.nick} me={B.me}/></>;
  else body=<>{m&&<><p className="note" role="status">{m}</p>{retry}</>}<Chase list={list} nick={s.nick} me={B.me}/><Rows list={list} lim={LEADERBOARD_SIZE} nick={s.nick} me={B.me}/></>;
  return <>
    <Back onClick={a.back}>Back</Back>
    <header className="top"><h1>Leaderboard</h1><p className="lead">{B.local?'Players on this device, ranked by total points. Hand the phone to a friend and let them play under their own name.':`The top ${LEADERBOARD_SIZE} ninjas everywhere.`} Your score is your total: your best points in every round you have played, added up.</p></header>
    <div id="gboard">{body}</div>
    {local.length>0&&<section className="panel"><h2 className="sub">On this device</h2><Rows list={local} lim={LEADERBOARD_SIZE} nick={s.nick}/></section>}
    {!B.local&&<button className="link" onClick={a.reload}>Refresh the leaderboard</button>}
    <p className="note">Names are nicknames chosen by players. Scores are sent from players’ own devices.</p>
  </>;
}
