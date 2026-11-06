/* Brainbox Ninja: sound effects and vibration (Nov 2026).
   - Sounds are made in the browser with the Web Audio API: no sound files to download, works offline and from a file.
   - Vibration uses navigator.vibrate (most Android phones; iPhones do not allow it, so they get sound only).
   - Both on by default; players switch them off on the home screen or with the speaker button during play.
     Choices are saved through ls: bn-sound / bn-vibe ('on' | 'off'). Vibration starts off for players whose
     device asks for reduced motion.
   - Browsers only allow sound after the player taps something, so nothing plays when the page opens.
   - Never breaks or slows the game: every call is wrapped and does nothing if audio or vibration is missing.
   Needs js/content.js (ls). Loaded before js/app.js. */
const FX=(()=>{
  const AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
  const canVibe=typeof navigator!=='undefined'&&typeof navigator.vibrate==='function';
  let reduce=false;try{reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  let sound=ls.get('bn-sound')!=='off';
  const v=ls.get('bn-vibe');let vibe=v==='on'||(v!=='off'&&!reduce);
  let ctx=null;

  /* create or wake the audio engine; called on every tap so it is ready before the first sound */
  function wake(){
    if(!AC||!sound)return null;
    try{if(!ctx)ctx=new AC();if(ctx.state==='suspended')ctx.resume();return ctx}catch(e){return null}
  }
  /* one short note with a quick fade in and out (no clicks) */
  function tone(f,at,dur,type,vol,to){
    const c=wake();if(!c||c.state!=='running'&&c.state!=='suspended')return;
    const t=c.currentTime+at,o=c.createOscillator(),g=c.createGain();
    o.type=type||'triangle';o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.15,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.03);
  }
  /* browsers refuse vibration until the person has tapped the page; skip it until then (no console warnings) */
  const tapped=()=>{try{const u=navigator.userActivation;return !u||u.hasBeenActive}catch(e){return true}};
  const buzz=p=>{if(vibe&&canVibe&&tapped())try{navigator.vibrate(p)}catch(e){}};
  const notes=(fs,gap,dur,vol)=>fs.forEach((f,i)=>tone(f,i*gap,dur,'triangle',vol));

  const SOUNDS={
    right:  ()=>{notes([660,990],.08,.16,.16);buzz(25)},                    /* bright two-note chime, one tap */
    wrong:  ()=>{tone(240,0,.24,'sine',.2,150);buzz([40,60,40])},           /* soft low "bonk", two pulses */
    timeout:()=>{tone(320,0,.4,'sine',.18,140);buzz(180)},                  /* falling tone, one long pulse */
    tick:   ()=>tone(1100,0,.05,'sine',.05),                                 /* quiet tick in the last 5 seconds */
    pass:   ()=>{notes([523,659,784,1047],.1,.22,.14);buzz([30,50,30])},   /* round passed */
    fail:   ()=>{notes([392,330],.18,.3,.11)},                               /* gentle "try again" */
    big:    ()=>{notes([523,659,784,1047,1319],.09,.26,.14);tone(1568,.5,.55,'triangle',.11);buzz([40,40,40,40,120])} /* daily target, level cleared */
  };
  function play(name){try{const f=SOUNDS[name];if(f)f()}catch(e){}}
  function setSound(on){sound=!!on;ls.set('bn-sound',sound?'on':'off');if(sound)wake()}
  function setVibe(on){vibe=!!on;ls.set('bn-vibe',vibe?'on':'off');if(vibe)buzz(25)}
  try{document.addEventListener('pointerdown',wake,{passive:true});document.addEventListener('keydown',wake)}catch(e){}
  return {play,setSound,setVibe,sound:()=>sound,vibe:()=>vibe,canVibe,canSound:!!AC};
})();
