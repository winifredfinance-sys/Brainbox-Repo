/* Scoring rules (numbers in src/config/gameConfig.js) */
import {SPEED,LEVEL_MULTIPLIER,PASS_MARK,STARS,QUESTIONS_PER_ROUND} from '../config/gameConfig.js';
/* points for a right answer with `rem` ms left of `limit` ms, on level 0-2 */
export const ptsFor=(rem,limit,level)=>Math.round((SPEED.min+(SPEED.max-SPEED.min)*Math.max(0,Math.min(1,rem/limit)))*LEVEL_MULTIPLIER[level]);
export const passed=(score,n=QUESTIONS_PER_ROUND)=>score>=Math.ceil(n*PASS_MARK/QUESTIONS_PER_ROUND);
export const starsFor=(score,n=QUESTIONS_PER_ROUND)=>{const r=score/n;return r>=STARS[2]?3:r>=STARS[1]?2:r>=STARS[0]?1:0};
