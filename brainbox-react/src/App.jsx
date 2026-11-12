/* Brainbox Ninja: one screen at a time. To add a screen: write it in src/screens, add it to SCREENS below,
   and open it with a.go('name'). */
import {useEffect} from 'react';
import {useGame} from './game/useGame.js';
import {Background} from './components/Common.jsx';
import {Welcome,Players,HowTo,Home,Types,Levels,Rounds} from './screens/Menus.jsx';
import {PLAYERS} from './services/players.js';
import {Ready,Play,Result} from './screens/Round.jsx';
import {Board} from './screens/Board.jsx';

const SCREENS={welcome:Welcome,players:Players,howto:HowTo,home:Home,cats:Types,hub:Levels,rounds:Rounds,ready:Ready,play:Play,result:Result,board:Board};
const BAND_SCREENS=['cats','hub','rounds','ready','play','result'];   /* screens shown in the band's colours */

export default function App(){
  const {s,band,actions}=useGame();
  const b=s.band&&BAND_SCREENS.includes(s.screen)?band():null;
  /* Candy Brain palette for 4-10, Naija Green for everyone else */
  const lp=s.screen==='welcome'?PLAYERS.last():null;   /* a 4-10 player is welcomed back in their own colours */
  useEffect(()=>{document.documentElement.dataset.pal=(b&&b.id==='kids')||(lp&&lp.ageBand==='kids')?'candy':'naija'});
  const Screen=SCREENS[s.screen]||Welcome;
  /* key changes on every screen change and every new question, which replays the "slide in" animation */
  return <>
    <Background/>
    <main key={s.nav} className={'app enter'+(b&&b.cls?' '+b.cls:'')} style={b?{'--c':`var(--${b.id})`,'--cbg':`var(--${b.id}-bg)`}:undefined}>
      <Screen s={s} a={actions} band={band}/>
    </main>
    <noscript><p style={{padding:24}}>Brainbox Ninja needs JavaScript to run. Please enable it in your browser.</p></noscript>
  </>;
}
