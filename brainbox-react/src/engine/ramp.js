/* Difficulty ramp within a level (unchanged from the old game). Each question maker gets a rough difficulty
   score (DIFF, higher = harder). Rounds 1-3 draw from the easier half of a level's makers, rounds 4-7 from all,
   rounds 8-10 mostly (70%) from the harder half; Hard rounds 8-10 also use bigger numbers (BOOST).
   The round limits and the 70% are in src/config/gameConfig.js (RAMP). */
import {pick} from './helpers.js';
import {RAMP} from '../config/gameConfig.js';
/* ---------- difficulty ramp within a level ----------
   Each question type gets a rough difficulty score (higher = harder). Within a level:
   rounds 1-3 draw from the easier half of the level's types, rounds 4-7 from all of them,
   rounds 8-10 mostly (70%) from the harder half. On Hard, rounds 8-10 also use slightly bigger numbers.
   Levels with a single question type only ramp through those bigger numbers. */
const SKIPD=s=>s===2||s===5||s===10?2:s<=4?3:4;
export const DIFF={
 nextNum:()=>1,bigger:m=>1+(m>=100?1:0),count:m=>1.5+m/10,addE:m=>2+m/10,add:m=>2.5+m/20,sub:m=>3+m/20,
 pattern:k=>({AB:1,AAB:2,ABB:2,AABB:3,ABC:3})[k]||2,skip:SKIPD,missing:s=>SKIPD(s)+1,back:s=>SKIPD(s)+1,oddOne:lv=>lv,
 mult:(lo,hi)=>1+hi/8,bigAdd:(lo,hi)=>1+Math.log10(hi),bigSub:(lo,hi)=>1.5+Math.log10(hi),percent:ps=>ps.some(p=>p%10&&p!==25)?3.5:ps.some(p=>p!==10&&p!==50)?3:2,
 algebra:()=>4,avg:()=>4,seqA:st=>st.some(x=>x>8)?2.5:2,seqGrow:()=>3,seqGeo:()=>3,seqFib:()=>4,seqSq:()=>4.5,
 scramble:(lo,hi)=>1.5+hi/4,missingLetter:(lo,hi)=>1+hi/4,change:p=>2+(p>=2000?1:p>=1000?.5:0),discount:ps=>ps&&ps.some(p=>p%10&&p!==25)?3.5:2.5,
 profit:()=>4,loss:()=>4,logic:(lo,hi)=>hi+.5,riddle:(lo,hi)=>hi,proverb:lv=>lv,proverbRev:lv=>lv+.5,memory:n=>n/2,
 order:lv=>lv+1,day:()=>2.5,age:()=>3,share:()=>2.5,ratio:()=>4
};
export const diffOf=sp=>{const f=DIFF[sp[0]];try{return f?+f(...sp.slice(1))||2:2}catch(e){return 2}};
/* Hard level, rounds 8-10: slightly bigger numbers for the types that have a size */
const BOOST={
 count:m=>[m+5],bigger:m=>[m*2],add:m=>[m+10],sub:m=>[m+10],addE:m=>[m+2],mult:(lo,hi)=>[lo,hi+6],
 bigAdd:(lo,hi)=>[lo,Math.round(hi*1.5)],bigSub:(lo,hi)=>[lo,Math.round(hi*1.5)],memory:n=>[n+1],
 scramble:(lo,hi)=>[lo,hi+2],missingLetter:(lo,hi)=>[lo,hi+2],change:p=>[p?p*2:pick([2000,5000])]
};
export function rampPicker(specs,l,round){
  const boost=l===2&&round>=RAMP.mixUntil,up=sp=>boost&&BOOST[sp[0]]?[sp[0],...BOOST[sp[0]](...sp.slice(1))]:sp;
  const n=specs.length;
  if(n<2||round==null)return ()=>up(pick(specs));
  const s=specs.slice().sort((a,b)=>diffOf(a)-diffOf(b)),half=Math.ceil(n/2),easy=s.slice(0,half),hard=s.slice(n-half);
  if(round<RAMP.easyUntil)return ()=>up(pick(easy));
  if(round<RAMP.mixUntil)return ()=>up(pick(specs));
  return ()=>up(Math.random()<RAMP.hardShare?pick(hard):pick(specs));
}
/* Naira Maths makers (from bank.js) */
Object.assign(DIFF,{nBasket:k=>1.5+k*.5,nChange:()=>3,nUnit:()=>3.5,nVat:()=>3.5,nInterest:()=>3.5,nSplit:()=>3,nPct:()=>3.5,
  nProfitPct:()=>4.5,nReverse:()=>4.5,nSuccessive:()=>4,nCompound:()=>4.5,nInstal:()=>4,nBreakEven:()=>4});
