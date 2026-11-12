/* Adaptive difficulty: the one place that decides whether a round mixes in harder or easier questions.
   Today's rule (unchanged from the old game): if the last ADAPTIVE.window rounds of this puzzle type
   averaged ADAPTIVE.stepUpAt or better, swap ADAPTIVE.swapQuestions questions for the level above; if they
   averaged ADAPTIVE.stepDownAt or worse, swap them for the level below. Pass marks and points do not change.

   To change the behaviour (see docs/ADAPTIVE-PROPOSAL.md), edit only decide(). It receives everything it
   needs and returns -1, 0 or +1, so the screens and the question builder do not need to change. */
import {ADAPTIVE} from '../config/gameConfig.js';

/* history: recent results for this player + band + puzzle type, oldest first: [{ratio, ms, timeouts, level}]
   (older saves only have ratio). Returns +1 (harder), -1 (easier) or 0. */
export function decide({history,level,band}){
  if(!ADAPTIVE.enabled)return 0;
  const a=(history||[]).slice(-ADAPTIVE.window);
  if(a.length<ADAPTIVE.window)return 0;
  const avg=a.reduce((s,x)=>s+(typeof x==='number'?x:x.ratio),0)/a.length;
  if(avg>=ADAPTIVE.stepUpAt&&level<2)return 1;
  if(avg<=ADAPTIVE.stepDownAt&&level>0)return -1;
  return 0;
}
export const adaptNote=adj=>adj>0?'Challenge boost: 3 harder questions this round':adj<0?'Warm-up mix: 3 easier questions this round':'';
