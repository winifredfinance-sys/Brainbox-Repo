/* Small helpers shared by the question makers and the game. Unchanged from the old game. */
export const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
export const pick=a=>a[rnd(0,a.length-1)];
export const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
export const fmt=n=>'₦'+Number(n).toLocaleString('en-NG');
export const near=(n,sp=[-2,-1,1,2,3,-3,10,-10])=>shuffle(sp).map(d=>n+d).filter(x=>x>0);
export const mmss=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
export const fmtN=n=>(+n||0).toLocaleString('en-NG');
/* short hash used as a question's id (same formula as the old game, so its "already seen" lists still work) */
export const hq=s=>{let x=5381;for(let i=0;i<s.length;i++)x=((x<<5)+x+s.charCodeAt(i))|0;return (x>>>0).toString(36)};
export const qid=q=>hq(q.q+'|'+(q.show||'')+'|'+(q.memo||''));
/* a multiple-choice question: the right answer plus up to 3 different wrong ones, shuffled */
export function mc(q,correct,wrongs,o={}){
  const c=String(correct),seen=new Set([c]),w=[];
  for(const x of wrongs){const s=String(x);if(!seen.has(s)){seen.add(s);w.push(s)}}
  const opts=shuffle([c,...w.slice(0,3)]);
  return Object.assign({q,opts,ans:opts.indexOf(c),show:''},o);
}
