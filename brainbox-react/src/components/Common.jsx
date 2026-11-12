/* Small pieces shared by several screens */
import {useMemo} from 'react';
import {rnd} from '../engine/helpers.js';
import {FX} from '../services/sound.js';

export function Mascot(){
  return <svg className="mascot" viewBox="0 0 120 120" role="img" aria-label="Brainbox Ninja mascot"><g className="bob"><circle cx="60" cy="64" r="44" fill="#2A2017"/><rect x="22" y="48" width="76" height="30" rx="15" fill="#F5D9B5"/><g className="eyes"><circle cx="46" cy="63" r="6" fill="#fff"/><circle cx="74" cy="63" r="6" fill="#fff"/><circle cx="47" cy="64" r="3" fill="#2A2017"/><circle cx="75" cy="64" r="3" fill="#2A2017"/></g><rect x="16" y="36" width="88" height="11" rx="5" style={{fill:'var(--red)'}}/><g className="tail"><path d="M100 41 L118 30 L114 44 L119 56 L100 46Z" style={{fill:'var(--red)'}}/></g><rect x="50" y="37.5" width="20" height="8" rx="2" fill="#FBF3E6"/><text x="60" y="44.2" fontSize="7.5" textAnchor="middle" fill="#2A2017" fontWeight="800" fontFamily="Trebuchet MS,sans-serif">BRAIN</text></g></svg>;
}
/* drifting puzzle glyphs behind everything (positions fixed for the visit) */
export function Background(){
  const g=['+','×','÷','?','=','7','3','Aa','π','%','2','9','−','?','5','₦'];
  const spans=useMemo(()=>g.map((c,i)=>({c,style:{'--x':(i*37+8)%94+'%','--y':(i*53+6)%92+'%','--s':rnd(30,64)+'px','--t':rnd(14,26)+'s','--dl':'-'+rnd(0,14)+'s','--r0':rnd(-25,25)+'deg','--r1':rnd(-40,40)+'deg','--dx':rnd(-40,40)+'px','--dy':rnd(-60,60)+'px'}})),[]);
  return <div className="bg" aria-hidden="true">{spans.map((x,i)=><span key={i} style={x.style}>{x.c}</span>)}</div>;
}
export const Stars=({n})=><span role="img" aria-label={`${n} of 3 stars`}>{[0,1,2].map(i=><span key={i} style={{'--i':i}} className={i<n?'on':'off'}>★</span>)}</span>;
export function Confetti(){
  const cols=['var(--red)','var(--gold)','var(--good)','var(--teens)'];
  const bits=useMemo(()=>Array.from({length:30},(_,i)=>({left:rnd(2,96)+'%',background:cols[i%4],'--d':(Math.random()*.9).toFixed(2)+'s'})),[]);
  return <>{bits.map((st,i)=><i key={i} className="cf" style={st}/>)}</>;
}
export function Ring({score,n,pass}){
  const C=2*Math.PI*52;
  return <div className="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle className="rtrack" cx="60" cy="60" r="52"/><circle className={'rfill'+(pass?'':' fail')} cx="60" cy="60" r="52" style={{'--c2':C.toFixed(1),'--off':(C*(1-score/n)).toFixed(1)}}/></svg><div className="rtxt"><b>{score}</b><span>out of {n}</span></div></div>;
}
export function MuteButton({onToggle}){
  if(!FX.canSound)return null;
  const on=FX.sound();
  return <button className="mute" type="button" aria-pressed={!on} aria-label={on?'Sound on. Tap to mute':'Sound off. Tap to turn on'} onClick={onToggle}>{on?'🔊':'🔇'}</button>;
}
export function FxPanel({onSound,onVibe}){
  if(!FX.canSound&&!FX.canVibe)return null;
  const sw=(label,on,fn)=><button className="tog" type="button" aria-pressed={on} onClick={fn}><span className="tk" aria-hidden="true"></span>{label}: <b>{on?'On':'Off'}</b></button>;
  return <div className="fxset" role="group" aria-label="Sound and vibration">{FX.canSound&&sw('Sound',FX.sound(),onSound)}{FX.canVibe&&sw('Vibration',FX.vibe(),onVibe)}</div>;
}
export const Back=({onClick,children})=><button className="link" onClick={onClick}>← {children}</button>;
