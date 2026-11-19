/* Naija Knowledge questions (Nov 2026): the band's own fact list (src/data/bands/), shared easy facts
   (src/data/naija/common.js) and questions made from
   the states, towns and places lists (src/data/naija/states.js). Each question is { id, lv, q, a, w, why }.
   Wrong options for state questions come from the same geopolitical zone, so they are believable. */
import {shuffle} from './helpers.js';
import {STATES,TOWNS,PLACES,ZONES} from '../data/naija/states.js';
import {NAIJA_TEENS} from '../data/bands/teens.js';
import {NAIJA_ADULTS} from '../data/bands/adults.js';
import {NAIJA_ELDERS} from '../data/bands/elders.js';
import {NAIJA_COMMON} from '../data/naija/common.js';

export const NAIJA_FACTS={teens:NAIJA_TEENS,adults:NAIJA_ADULTS,elders:NAIJA_ELDERS};
const byState=Object.fromEntries(STATES.map(s=>[s.state,s]));
/* three wrong options: same zone first, then any others */
const wrongs=(right,sameZone,all)=>shuffle(sameZone.filter(x=>x!==right)).concat(shuffle(all.filter(x=>x!==right&&!sameZone.includes(x)))).slice(0,3);
const zoneStates=z=>STATES.filter(s=>s.zone===z).map(s=>s.state);
const zoneCaps=z=>STATES.filter(s=>s.zone===z).map(s=>s.capital);
const allStates=STATES.map(s=>s.state),allCaps=STATES.map(s=>s.capital);

/* every templated question, made fresh each time (wrong options are shuffled) */
export function stateQuestions(){
  const out=[];
  for(const s of STATES){
    out.push({id:'ns-cap-'+s.state,lv:s.tier,q:`What is the capital of ${s.state} State?`,a:s.capital,
      w:wrongs(s.capital,zoneCaps(s.zone),allCaps),why:`${s.capital} is the capital of ${s.state} State (${s.zone}).`});
    if(s.capital!==s.state)out.push({id:'ns-rev-'+s.state,lv:s.tier,q:`${s.capital} is the capital of which state?`,a:s.state,
      w:wrongs(s.state,zoneStates(s.zone),allStates),why:`${s.capital} is the capital of ${s.state} State.`});
    out.push({id:'ns-zone-'+s.state,lv:s.tier===1?2:3,q:`Which geopolitical zone is ${s.state} State in?`,a:s.zone,
      w:shuffle(ZONES.filter(z=>z!==s.zone)).slice(0,3),why:`${s.state} State is in the ${s.zone} zone.`});
  }
  /* two steps: capital -> state -> zone */
  for(const s of STATES)if(s.capital!==s.state)out.push({id:'ns-capzone-'+s.state,lv:Math.min(3,s.tier+1),q:`${s.capital} is the capital of a state in which zone?`,a:s.zone,
    w:shuffle(ZONES.filter(z=>z!==s.zone)).slice(0,3),why:`${s.capital} is the capital of ${s.state} State, in the ${s.zone} zone.`});
  for(const z of ZONES){const n=STATES.filter(s=>s.zone===z).length;
    out.push({id:'ns-count-'+z,lv:3,q:`How many states are in the ${z} zone?`,a:String(n),w:shuffle([4,5,6,7,8].filter(x=>x!==n)).slice(0,3).map(String),
      why:`The ${z} zone has ${n} states${z==='North Central'?' plus the FCT':''}.`})}
  for(const t of TOWNS){const z=byState[t.state].zone;
    out.push({id:'ns-town-'+t.name,lv:t.lv,q:`In which state is the town of ${t.name}?`,a:t.state,
      w:wrongs(t.state,zoneStates(z),allStates),why:`${t.name} is in ${t.state} State.`})}
  for(const p of PLACES){const z=byState[p.state].zone,name=p.name[0].toUpperCase()+p.name.slice(1);
    out.push({id:'ns-place-'+p.name,lv:p.lv,q:`In which state is ${p.name}?`,a:p.state,
      w:wrongs(p.state,zoneStates(z),allStates),why:`${name} is in ${p.state} State.`})}
  return out;
}
/* all Naija Knowledge questions for a band at one level (1-3) */
export const naijaFor=(band,lv)=>(NAIJA_FACTS[band]||[]).concat(NAIJA_COMMON).filter(x=>x.lv===lv).concat(stateQuestions().filter(x=>x.lv===lv));
