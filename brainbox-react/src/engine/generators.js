/* Brainbox Ninja question makers. Each G.name(...settings) returns one multiple-choice question:
   {q, opts, ans (index of the right option), show (big text), why (explanation), memo (memory list)}.
   Copied from the old game (content.js + bank.js) without changes, so questions are exactly as before.
   The data they use lives in src/data. To add a new kind of question, add G.myMaker=... here and list
   ['myMaker', ...settings] in src/data/puzzles.js. */
import {rnd,pick,shuffle,fmt,near,mc} from './helpers.js';
import {PROVERBS} from '../data/proverbs.js';
import {RIDDLES} from '../data/riddles.js';
import {LOGIC} from '../data/logic.js';
import {WORDS} from '../data/words.js';
import {FR,GROUPS,POOL,NAMES,QUAL,ORD,DAYS,ITEMS,COSTS,GOODS} from '../data/lists.js';

const scr=w=>{let s=w;for(let i=0;i<20&&s===w;i++)s=shuffle(w.split('')).join('');return s};
const wordPool=(lo,hi)=>{const p=WORDS.filter(([w])=>w.length>=lo&&w.length<=hi);return p.length?p:WORDS};
const cap=w=>w[0]+w.slice(1).toLowerCase();
export const G={
 /* kids */
 count:m=>{const n=rnd(1,m),f=pick(FR);return mc('How many can you count?',n,near(n),{show:Array(n).fill(f).join(' '),why:'Count them one by one.'})},
 bigger:m=>{let a=rnd(1,m),b=rnd(1,m);while(b===a)b=rnd(1,m);return mc('Which number is bigger?',Math.max(a,b),[Math.min(a,b)],{show:a+'  or  '+b,why:`${Math.max(a,b)} is more than ${Math.min(a,b)}.`})},
 nextNum:()=>{const s=rnd(1,20);return mc('What number comes next?',s+3,near(s+3,[-1,1,2,-2,3]),{show:`${s}, ${s+1}, ${s+2}, ?`,why:'Each number is one more.'})},
 addE:m=>{const a=rnd(1,m-1),b=rnd(1,m-a),f=pick(FR);return mc('How many in all?',a+b,near(a+b),{show:Array(a).fill(f).join(' ')+'  +  '+Array(b).fill(f).join(' '),why:`${a} + ${b} = ${a+b}`})},
 add:m=>{const a=rnd(2,m-3),b=rnd(2,m-a);return mc('Add them up',a+b,near(a+b),{show:`${a} + ${b} = ?`,why:`${a} + ${b} = ${a+b}`})},
 sub:m=>{const a=rnd(5,m),b=rnd(1,a-1);return mc('Take away',a-b,near(a-b),{show:`${a} − ${b} = ?`,why:`${a} − ${b} = ${a-b}`})},
 pattern:kind=>{const [A,B,C,D]=shuffle(FR);const M={AB:[[A,B,A,B,A],B],AAB:[[A,A,B,A,A],B],ABB:[[A,B,B,A,B],B],AABB:[[A,A,B,B,A],A],ABC:[[A,B,C,A,B],C]};const [seq,nx]=M[kind];return mc('Which one comes next?',nx,[A,B,C,D].filter(x=>x!==nx),{show:seq.join(' ')+' ?',why:'The pattern repeats.'})},
 skip:step=>{const s=step*rnd(1,6);return mc(`Count in ${step}s. What comes next?`,s+3*step,near(s+3*step,[-step,step,-1,1,2*step]),{show:`${s}, ${s+step}, ${s+2*step}, ?`,why:`Add ${step} each time.`})},
 missing:step=>{const s=rnd(1,6)*step;return mc('Find the missing number',s+2*step,near(s+2*step,[-1,1,-step,step,2]),{show:`${s}, ${s+step}, ?, ${s+3*step}`,why:`Add ${step} each time.`})},
 oddOne:lv=>{
   if(lv===1){const [g1,g2]=shuffle(Object.keys(GROUPS)),items=shuffle(GROUPS[g1]).slice(0,3),odd=pick(GROUPS[g2]);return mc('Which one does not belong?',odd,items,{show:shuffle([...items,odd]).join(' '),why:`The others are all ${g1}.`})}
   const type=lv===2?pick(['even','odd']):pick(['five','ten','even','odd']);
   const sets={even:[[2,4,6,8,10,12,14,16,18,20],[3,5,7,9,11,13,15,17],'The others are even numbers.'],odd:[[1,3,5,7,9,11,13,15],[2,4,6,8,10,12,14],'The others are odd numbers.'],five:[[5,10,15,20,25,30,35,40],[12,18,22,27,33,37],'The others are in the 5 times table.'],ten:[[10,20,30,40,50,60,70,80],[15,25,35,45,55,65],'The others are in the 10 times table.']};
   const [ok,no,why]=sets[type],items=shuffle(ok).slice(0,3),odd=pick(no);
   return mc('Which number does not belong?',odd,items,{show:shuffle([...items,odd]).join(',  '),why});
 },
 /* maths */
 mult:(lo,hi)=>{const a=rnd(lo,hi),b=rnd(lo,hi),c=a*b;return mc('Times tables',c,[c+a,c-a,c+b,c-b,c+10,c-10].filter(x=>x>0),{show:`${a} × ${b} = ?`,why:`${a} × ${b} = ${c}`})},
 bigAdd:(lo,hi)=>{const a=rnd(lo,hi),b=rnd(lo,hi),c=a+b;return mc('Add in your head',c,near(c,[-10,10,-1,1,2,-2,20]),{show:`${a} + ${b} = ?`,why:`${a} + ${b} = ${c}`})},
 bigSub:(lo,hi)=>{const a=rnd(lo,hi),b=rnd(Math.floor(lo/2),a-1),c=a-b;return mc('Take away in your head',c,near(c,[-10,10,-1,1,2,-2,20]),{show:`${a} − ${b} = ?`,why:`${a} − ${b} = ${c}`})},
 percent:ps=>{const p=pick(ps),b=pick([40,80,120,200,300,400,500,600,800]),c=b*p/100;return mc(`What is ${p}% of ${b}?`,c,[c+10,c-10,c*2,Math.round(c/2),c+5,c-5].filter(x=>x>0),{why:`${b} × ${p} ÷ 100 = ${c}`})},
 algebra:()=>{const x=rnd(2,9),a=rnd(2,6),b=rnd(1,12),c=a*x+b;return mc(`Solve for x: ${a}x + ${b} = ${c}`,x,near(x,[1,-1,2,-2,3]),{why:`Take away ${b}: ${a}x = ${c-b}. Then divide by ${a}.`})},
 avg:()=>{const m=rnd(10,60),d1=rnd(1,9),d2=rnd(10,15),n=shuffle([m-d1,m+d1,m-d2,m+d2]);return mc('What is the average of these four numbers?',m,near(m,[-2,-1,1,2,3,5]),{show:n.join(',  '),why:`The numbers add up to ${4*m}. ${4*m} ÷ 4 = ${m}.`})},
 /* sequences */
 seqA:steps=>{const st=pick(steps),s=rnd(1,20),t=[0,1,2,3].map(k=>s+k*st),c=s+4*st;return mc('What number comes next?',c,near(c,[-1,1,-st,st,2,-2]),{show:t.join(', ')+', ?',why:`Add ${st} each time.`})},
 seqGrow:()=>{const s=rnd(1,10),d=rnd(1,3),k=rnd(1,2),t=[s];for(let i=0;i<4;i++)t.push(t[i]+d+i*k);const c=t[4];return mc('What number comes next?',c,near(c,[-2,-1,1,2,3,-3,4]),{show:t.slice(0,4).join(', ')+', ?',why:`The gaps grow: ${t[1]-t[0]}, ${t[2]-t[1]}, ${t[3]-t[2]}, so the next gap is ${c-t[3]}.`})},
 seqGeo:()=>{const s=rnd(1,4),r=pick([2,3]),t=[s];for(let i=0;i<4;i++)t.push(t[i]*r);const c=t[4];return mc('What number comes next?',c,[c+r,c-r,c+s,t[3]+t[2],c*2].filter(x=>x>0),{show:t.slice(0,4).join(', ')+', ?',why:`Multiply by ${r} each time.`})},
 seqFib:()=>{const t=[rnd(1,4),rnd(2,6)];for(let i=2;i<6;i++)t.push(t[i-1]+t[i-2]);const c=t[5];return mc('What number comes next?',c,near(c,[-2,-1,1,2,3,-3,5]),{show:t.slice(0,5).join(', ')+', ?',why:'Each number is the sum of the two before it.'})},
 seqSq:()=>{const n=rnd(1,4),c0=rnd(1,5),t=[0,1,2,3].map(k=>(n+k)**2+c0),c=(n+4)**2+c0;return mc('What number comes next?',c,near(c,[-2,-1,1,2,3,-3,4]),{show:t.join(', ')+', ?',why:`Square numbers (${n}², ${n+1}², …) plus ${c0}.`})},
 /* words, money, logic, memory */
 scramble:(lo,hi)=>{const [w,cat]=pick(wordPool(lo,hi)),others=WORDS.map(x=>x[0]).filter(x=>x!==w),close=shuffle(others.filter(x=>Math.abs(x.length-w.length)<=1));return mc('Unscramble the letters',w,close.concat(shuffle(others)),{show:scr(w).split('').join(' '),why:`${cap(w)} is a Nigerian ${cat}.`})},
 missingLetter:(lo,hi)=>{const [w,cat]=pick(wordPool(lo,hi)),i=rnd(0,w.length-1),L='ABCDEFGHIJKLMNOPRSTUWYZ'.split('').filter(x=>x!==w[i]);return mc('Which letter is missing?',w[i],shuffle(L),{show:w.split('').map((c,k)=>k===i?'_':c).join(' '),why:`${cap(w)} is a Nigerian ${cat}.`})},
 change:pay=>{pay=pay||pick([500,1000,2000]);const item=pick(['bread','suya','garri','a notebook','a bottle of water','plantain']),price=50*rnd(Math.max(2,Math.floor(pay*.1/50)),Math.floor(pay*.9/50)),c=pay-price;return mc(`You buy ${item} for ${fmt(price)} and pay with ${fmt(pay)}. What is your change?`,fmt(c),[c+50,c-50,c+100,c-100,c+200].filter(x=>x>0).map(fmt),{why:`${fmt(pay)} − ${fmt(price)} = ${fmt(c)}`})},
 discount:ps=>{const price=pick([4000,5000,8000,12500,15000,20000]),p=pick(ps||[10,20,25]),off=price*p/100,pay=price-off;return mc(`A pair of shoes costs ${fmt(price)}. The shop gives ${p}% off. How much do you pay?`,fmt(pay),[off,price+off,pay+500,pay-500].map(fmt),{why:`${p}% off is ${fmt(off)}, so you pay ${fmt(price)} − ${fmt(off)} = ${fmt(pay)}.`})},
 profit:()=>{const cost=pick([20000,40000,60000,80000]),p=pick([10,20,25,50]),gain=cost*p/100,sell=cost+gain;return mc(`A trader buys a bag of rice for ${fmt(cost)} and sells it at ${p}% profit. What is the selling price?`,fmt(sell),[gain,cost-gain,sell+5000,sell-5000].map(fmt),{why:`${p}% of ${fmt(cost)} is ${fmt(gain)}. Add it to the cost: ${fmt(sell)}.`})},
 loss:()=>{const cost=pick([20000,40000,60000,80000]),p=pick([10,20,25]),lost=cost*p/100,sell=cost-lost;return mc(`A trader buys a sack of garri for ${fmt(cost)} but sells it at a ${p}% loss. What is the selling price?`,fmt(sell),[lost,cost+lost,sell+5000,sell-5000].map(fmt),{why:`${p}% of ${fmt(cost)} is ${fmt(lost)}. Take it off the cost: ${fmt(sell)}.`})},
 logic:(lo,hi)=>{const x=pick(LOGIC.filter(l=>l.lv>=lo&&l.lv<=hi));return mc(x.q,x.a,x.w,{why:x.why})},
 riddle:(lo,hi)=>{const x=pick(RIDDLES.filter(l=>l.lv>=lo&&l.lv<=hi));return mc(x.q,x.a,x.w,{why:x.why})},
 proverb:lv=>{
   if(lv===3){const x=pick(PROVERBS),others=shuffle(PROVERBS.filter(p=>p!==x)).map(p=>p.m);return mc('What does this proverb teach?',x.m,others,{show:'“'+x.t.replace('___',x.a)+'”',why:'Proverb: '+x.t.replace('___',x.a)})}
   const x=pick(lv===1?PROVERBS.filter(p=>p.e):PROVERBS);return mc('Complete the African proverb',x.a,x.w,{show:'“'+x.t+'”',why:x.m})},
 memory:n=>{const items=shuffle(POOL).slice(0,n),rest=POOL.filter(p=>!items.includes(p)),not=n>=5&&Math.random()<.5;
   return not?mc('Which item was NOT on the list?',pick(rest),items,{memo:items.join(', '),why:'It was not in the list you saw.'})
             :mc('Which item was on the list?',pick(items),rest,{memo:items.join(', '),why:'It was in the list you saw.'})}
};


/* ---------- more variety in the generators ---------- */
G.nextNum=()=>{const s=rnd(1,40);return mc('What number comes next?',s+3,near(s+3,[-1,1,2,-2,3]),{show:`${s}, ${s+1}, ${s+2}, ?`,why:'Each number is one more.'})};
G.skip=step=>{const s=step*rnd(0,12);return mc(`Count in ${step}s. What comes next?`,s+3*step,near(s+3*step,[-step,step,-1,1,2*step]),{show:`${s}, ${s+step}, ${s+2*step}, ?`,why:`Add ${step} each time.`})};
G.missing=step=>{const s=rnd(1,12)*step;return mc('Find the missing number',s+2*step,near(s+2*step,[-1,1,-step,step,2]),{show:`${s}, ${s+step}, ?, ${s+3*step}`,why:`Add ${step} each time.`})};
G.seqA=steps=>{const st=pick(steps),s=rnd(1,60),t=[0,1,2,3].map(k=>s+k*st),c=s+4*st;return mc('What number comes next?',c,near(c,[-1,1,-st,st,2,-2]),{show:t.join(', ')+', ?',why:`Add ${st} each time.`})};
G.bigger=m=>{let a=rnd(1,m),b=rnd(1,m);while(b===a)b=rnd(1,m);const hi=Math.max(a,b),lo=Math.min(a,b),q=Math.random()<.5;return mc(q?'Which number is bigger?':'Which number is smaller?',q?hi:lo,[q?lo:hi],{show:a+'  or  '+b,why:q?`${hi} is more than ${lo}.`:`${lo} is less than ${hi}.`})};
G.profit=()=>{const cost=pick(COSTS),p=pick([5,10,15,20,25,30,40,50]),gain=cost*p/100,sell=cost+gain,it=pick(ITEMS);return mc(`A trader buys ${it} for ${fmt(cost)} and sells it at ${p}% profit. What is the selling price?`,fmt(sell),[gain,cost-gain,sell+5000,sell-5000].map(fmt),{why:`${p}% of ${fmt(cost)} is ${fmt(gain)}. Add it to the cost: ${fmt(sell)}.`})};
G.loss=()=>{const cost=pick(COSTS),p=pick([5,10,15,20,25,30,40]),lost=cost*p/100,sell=cost-lost,it=pick(ITEMS);return mc(`A trader buys ${it} for ${fmt(cost)} but sells it at a ${p}% loss. What is the selling price?`,fmt(sell),[lost,cost+lost,sell+5000,sell-5000].map(fmt),{why:`${p}% of ${fmt(cost)} is ${fmt(lost)}. Take it off: ${fmt(sell)}.`})};
G.discount=ps=>{const price=pick([3000,4000,5000,6500,8000,9000,12500,15000,18000,20000,25000,35000]),p=pick(ps||[10,20,25]),off=price*p/100,pay=price-off,it=pick(['a pair of shoes','a school bag','a shirt','a wristwatch','a bedsheet','a pair of sandals','a handbag','a standing fan']);return mc(`${it[0].toUpperCase()+it.slice(1)} costs ${fmt(price)}. The shop gives ${p}% off. How much do you pay?`,fmt(pay),[off,price+off,pay+500,pay-500].map(fmt),{why:`${p}% off is ${fmt(off)}, so you pay ${fmt(price)} − ${fmt(off)} = ${fmt(pay)}.`})};

/* proverbs the other way round: pick the proverb that matches a meaning (doubles the proverb questions) */
G.proverbRev=lv=>{const pool=lv===1?PROVERBS.filter(p=>p.e):PROVERBS,x=pick(pool),full=p=>'“'+p.t.replace('___',p.a)+'”',others=shuffle(PROVERBS.filter(p=>p!==x&&p.m!==x.m)).map(full);return mc('Which proverb has this meaning?',full(x),others,{show:x.m,why:'Proverb: '+full(x)})};


/* ---------- endless logic and counting puzzles (names, numbers and days change every time) ---------- */
G.order=lv=>{
  const n=lv===1?3:4,names=shuffle(NAMES).slice(0,n),[cmp,top,bot]=pick(QUAL);
  const rel=names.slice(0,-1).map((x,i)=>`${x} is ${cmp} than ${names[i+1]}.`);
  const text=(lv>=3?shuffle(rel):rel).join(' ');
  if(lv===1){const ask=Math.random()<.5;return mc(`${text} Who is the ${ask?top:bot}?`,ask?names[0]:names[n-1],names.filter((_,i)=>i!==(ask?0:n-1)),{why:`The order from ${top} to ${bot} is ${names.join(', ')}.`})}
  const k=rnd(1,n-2);
  return mc(`${text} Who is ${ORD[k]} from the ${top} end?`,names[k],names.filter((_,i)=>i!==k),{why:`The order from ${top} to ${bot} is ${names.join(', ')}.`});
};
G.day=()=>{
  const d=rnd(0,6),n=rnd(2,20),fwd=Math.random()<.6,r=((fwd?d+n:d-n)%7+7)%7,w=DAYS.filter((_,i)=>i!==r),wk=Math.floor(n/7),rem=n%7;
  const q=fwd?`Today is ${DAYS[d]}. What day will it be in ${n} days?`:`Today is ${DAYS[d]}. What day was it ${n} days ago?`;
  const why=rem===0?`${n} days is exactly ${wk} weeks, so it is the same day: ${DAYS[r]}.`:`${n} days is ${wk} week${wk===1?'':'s'} and ${rem} day${rem===1?'':'s'}. Count ${rem} ${fwd?'forward from':'back from'} ${DAYS[d]}.`;
  return mc(q,DAYS[r],shuffle(w).slice(0,3),{why});
};
G.age=lv=>{
  const [a,b]=shuffle(NAMES).slice(0,2),gap=rnd(2,12),bAge=rnd(6,40),y=rnd(2,10),ans=bAge+gap+y;
  return mc(`${a} is ${gap} years older than ${b}. ${b} is ${bAge}. How old will ${a} be in ${y} years?`,String(ans),near(ans,[-2,-1,1,2,gap,-gap]).map(String),{why:`${a} is ${bAge+gap} now, so in ${y} years ${a} will be ${ans}.`});
};
G.share=()=>{
  const k=pick([3,4,5,6,8]),each=pick([150,200,250,300,500,750,1200,1500]),tot=k*each,[a]=shuffle(NAMES);
  return mc(`${a} shares ${fmt(tot)} equally among ${k} children. How much does each child get?`,fmt(each),[each+50,each-50,each*2,Math.round(each/2),each+100].filter(x=>x>0).map(fmt),{why:`${fmt(tot)} ÷ ${k} = ${fmt(each)}.`});
};
G.ratio=()=>{
  const [a,b]=pick([[1,2],[1,3],[2,3],[3,4],[2,5],[1,4]]),unit=pick([500,1000,1500,2000,2500]),tot=(a+b)*unit,[x,y]=shuffle(NAMES).slice(0,2),first=Math.random()<.5,get=(first?a:b)*unit;
  return mc(`${x} and ${y} share ${fmt(tot)} in the ratio ${a} : ${b}. How much does ${first?x:y} get?`,fmt(get),[a*unit,b*unit,tot/2,(a+b)*unit/3].filter(v=>v!==get&&v>0).map(fmt).concat([fmt(get+unit),fmt(get+2*unit)]),{why:`There are ${a+b} parts. One part is ${fmt(unit)}, so ${first?a:b} part${(first?a:b)>1?'s are':' is'} ${fmt(get)}.`});
};
G.back=step=>{const s=step*rnd(4,25);return mc(`Count back in ${step}s. What comes next?`,s-3*step,near(s-3*step,[-step,step,-1,1,2*step]),{show:`${s}, ${s-step}, ${s-2*step}, ?`,why:`Take away ${step} each time.`})};
G.skip=step=>{const s=step*rnd(0,20);return mc(`Count in ${step}s. What comes next?`,s+3*step,near(s+3*step,[-step,step,-1,1,2*step]),{show:`${s}, ${s+step}, ${s+2*step}, ?`,why:`Add ${step} each time.`})};


/* ---------- Naira Maths (18-59 only): harder, multi-step money questions (Nov 2026) ----------
   Beginner: market baskets, change from big notes, best buy. Medium: 3-item baskets, 7.5% VAT, simple interest,
   splitting a bill, percentage change. Hard: profit %, price before a discount, a rise then a fall,
   compound interest, instalments, break-even. Wrong answers are the usual slips. 60+ Number Puzzles keep
   the gentle change and discount questions above. */
const basket=k=>shuffle(GOODS).slice(0,k).map(([one,many,ps])=>{const n=rnd(2,5),p=pick(ps);return {n,p,txt:`${n} ${many} at ${fmt(p)} each`}});
const listTxt=a=>a.length<3?a.join(' and '):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const nn=(v,list)=>list.filter(x=>x>0&&x!==v);
G.nBasket=k=>{
  const b=basket(k),tot=b.reduce((a,x)=>a+x.n*x.p,0),last=b[b.length-1];
  return mc(`At the market you buy ${listTxt(b.map(x=>x.txt))}. How much do you spend?`,fmt(tot),
    nn(tot,[tot-last.n*last.p+last.p,tot+b[0].p,tot-b[0].p,tot+100,tot-100,b.reduce((a,x)=>a+x.p,0)*b.reduce((a,x)=>a+x.n,0)]).map(fmt),
    {why:b.map(x=>`${x.n} × ${fmt(x.p)} = ${fmt(x.n*x.p)}`).join('; ')+`. Total ${fmt(tot)}.`});
};
G.nChange=()=>{
  const b=basket(2),tot=b.reduce((a,x)=>a+x.n*x.p,0),pay=[5000,10000,20000,50000].find(v=>v>tot+300)||50000,c=pay-tot;
  return mc(`You buy ${listTxt(b.map(x=>x.txt))} and pay with ${fmt(pay)}. What is your change?`,fmt(c),
    nn(c,[c+b[1].p,c-b[1].p,c+100,c-100,c+1000,pay-b[0].n*b[0].p]).map(fmt),
    {why:`Total ${fmt(b[0].n*b[0].p)} + ${fmt(b[1].n*b[1].p)} = ${fmt(tot)}. ${fmt(pay)} − ${fmt(tot)} = ${fmt(c)}.`});
};
G.nUnit=()=>{
  const item=pick([['sachets of water','sachet'],['packs of noodles','pack'],['tins of tomato paste','tin'],['bars of soap','bar']]);
  const u0=pick([60,80,100,120,150,200,250]),units=shuffle([u0,u0+10,u0+20,u0+30]).slice(0,3),qs=shuffle([6,8,10,12,15,20,24]).slice(0,3);
  const offers=units.map((u,i)=>({q:qs[i],u,t:qs[i]*u})),best=offers.reduce((a,x)=>x.u<a.u?x:a),txt=o=>`${o.q} for ${fmt(o.t)}`;
  return mc(`Three shops sell ${item[0]}. Which is the best buy (cheapest per ${item[1]})?`,txt(best),offers.filter(o=>o!==best).map(txt).concat(['They all cost the same']),
    {show:offers.map(txt).join('   ·   '),why:offers.map(o=>`${txt(o)} is ${fmt(o.u)} per ${item[1]}`).join('; ')+'.'});
};
G.nVat=()=>{
  const it=pick(['A blender','A phone','A standing fan','A pressing iron','A school bag','A pair of shoes','A rechargeable lamp']),p=4000*rnd(2,30),v=p*0.075,t=p+v;
  return mc(`${it} costs ${fmt(p)} before 7.5% VAT. What is the price with VAT?`,fmt(t),nn(t,[p+p*0.75,p*1.05,p+750,p+p*0.0075,p-v,p*1.1]).map(x=>fmt(Math.round(x))),
    {why:`7.5% of ${fmt(p)} is ${fmt(v)} (10% is ${fmt(p/10)}, take away a quarter of that). ${fmt(p)} + ${fmt(v)} = ${fmt(t)}.`});
};
G.nInterest=()=>{
  const P=10000*rnd(2,20),r=pick([5,8,10,12,15]),y=pick([2,3]),i=P*r*y/100,t=P+i;
  return mc(`You save ${fmt(P)} at ${r}% simple interest a year. How much do you have after ${y} years?`,fmt(t),
    nn(t,[i,P+P*r/100,Math.round(P*Math.pow(1+r/100,y)),t+P*r/100,P*r*y]).map(fmt),
    {why:`Interest each year is ${r}% of ${fmt(P)} = ${fmt(P*r/100)}. Over ${y} years: ${fmt(i)}. Total ${fmt(P)} + ${fmt(i)} = ${fmt(t)}.`});
};
G.nSplit=()=>{
  const n=pick([3,4,5,6]),each=100*rnd(25,90),tip=100*rnd(5,30),bill=each*n-tip;
  return mc(`${n} friends share a restaurant bill of ${fmt(bill)} and add a ${fmt(tip)} tip. If they split it equally, how much does each pay?`,fmt(each),
    nn(each,[Math.round(bill/n/10)*10,Math.round((bill+tip)/(n+1)/10)*10,each+100,each-100,each+tip]).map(fmt),
    {why:`${fmt(bill)} + ${fmt(tip)} = ${fmt(bill+tip)}. ${fmt(bill+tip)} ÷ ${n} = ${fmt(each)}.`});
};
G.nPct=()=>{
  const p=pick([5,10,15,20,25,40,50]),up=Math.random()<.6,old=pick([400,800,1200,1600,2000,2400,4000,6000,8000]),nw=old*(1+(up?p:-p)/100),d=Math.abs(nw-old);
  const wrongPct=Math.round(1000*d/nw)/10,it=pick(['A bag of garri','A litre of fuel','A crate of eggs','A bus fare','A bag of cement']);
  return mc(`${it} ${up?'rises':'falls'} from ${fmt(old)} to ${fmt(Math.round(nw))}. What is the percentage ${up?'increase':'decrease'}?`,p+'%',
    [wrongPct+'%',(p+5)+'%',(p>5?p-5:p+10)+'%',(d/100)+'%',(p*2)+'%',(p+15)+'%'],
    {why:`The change is ${fmt(d)}. Compare it with the OLD price: ${fmt(d)} ÷ ${fmt(old)} = ${p}%.`});
};
G.nProfitPct=()=>{
  const c=pick([20000,24000,30000,36000,40000,45000,48000,60000,72000,80000]),p=pick([10,12.5,15,20,25,30,40,50]),s=c*(1+p/100);
  if(s%100)return G.nProfitPct();
  const onSell=Math.round(1000*(s-c)/s)/10;
  return mc(`A trader buys ${pick(['a sewing machine','a generator','a bundle of ankara','a crate of drinks','a bag of rice','a used laptop'])} for ${fmt(c)} and sells it for ${fmt(s)}. What is the profit as a percentage of the cost price?`,p+'%',
    [onSell+'%',(p+5)+'%',((s-c)/1000)+'%',(p*2)+'%'],{why:`Profit ${fmt(s-c)}. ${fmt(s-c)} ÷ ${fmt(c)} = ${p}%. (Dividing by the selling price instead gives ${onSell}%, a common slip.)`});
};
G.nReverse=()=>{
  const p=pick([10,20,25,40,50]),orig=pick([8000,10000,12000,16000,20000,24000,30000,40000]),sale=orig*(1-p/100),it=pick(['a school bag','a wristwatch','a pair of shoes','a blender','a bedsheet set']);
  return mc(`After a ${p}% discount, ${it} costs ${fmt(sale)}. What was the price before the discount?`,fmt(orig),
    nn(orig,[sale*(1+p/100),sale+p*100,sale/(1-p/100)+1000,orig-sale+sale*2,Math.round(sale*1.1)]).map(x=>fmt(Math.round(x))),
    {why:`${fmt(sale)} is ${100-p}% of the old price. ${fmt(sale)} ÷ ${100-p} × 100 = ${fmt(orig)}. (Adding ${p}% to ${fmt(sale)} is the common slip.)`});
};
G.nSuccessive=()=>{
  const p=pick([10,20,25,50]),base=pick([20000,40000,50000,60000,80000,100000]),upFirst=Math.random()<.5,mid=base*(1+(upFirst?p:-p)/100),fin=mid*(1+(upFirst?-p:p)/100);
  const it=pick(['a phone','a television','a bag of rice','a fridge','a motorcycle part']);
  return mc(`The price of ${it} is ${fmt(base)}. It ${upFirst?'rises':'falls'} by ${p}%, then the new price ${upFirst?'falls':'rises'} by ${p}%. What is the final price?`,fmt(fin),
    nn(fin,[base,base*(1-2*p/100),base*(1+p*p/10000),fin-base*p/100,mid]).map(x=>fmt(Math.round(x))),
    {why:`${fmt(base)} → ${fmt(mid)} → ${fmt(fin)}. The second ${p}% is of a different amount, so it does not cancel out.`});
};
G.nCompound=()=>{
  const P=10000*rnd(2,15),r=pick([10,20]),t=P*Math.pow(1+r/100,2);
  return mc(`You save ${fmt(P)} at ${r}% interest a year, added to your savings at the end of each year (compound interest). How much do you have after 2 years?`,fmt(Math.round(t)),
    nn(Math.round(t),[P+2*P*r/100,P*r*2/100,P+P*r/100,Math.round(t)+P*r/100]).map(x=>fmt(Math.round(x))),
    {why:`Year 1: ${fmt(P)} + ${r}% = ${fmt(P*(1+r/100))}. Year 2: ${fmt(P*(1+r/100))} + ${r}% = ${fmt(Math.round(t))}.`});
};
G.nInstal=()=>{
  const d=pick([20,25,50]),m=d===25?pick([3,6]):pick([3,4,6]),each=1000*rnd(15,60),price=each*m*100/(100-d),dep=price*d/100;
  return mc(`A television costs ${fmt(price)}. You pay a ${d}% deposit, then the rest in ${m} equal monthly payments. How much is each payment?`,fmt(each),
    nn(each,[Math.round(price/m),Math.round((price-dep)/(m+1)),dep,each+1000,each-1000]).map(fmt),
    {why:`Deposit ${d}% of ${fmt(price)} = ${fmt(dep)}. Left to pay ${fmt(price-dep)}. ${fmt(price-dep)} ÷ ${m} = ${fmt(each)}.`});
};
G.nBreakEven=()=>{
  const [what,unit]=pick([['suya','sticks of suya'],['puff-puff','packs of puff-puff'],['zobo','bottles of zobo'],['akara','plates of akara']]);
  const cost=pick([150,200,250,300,400]),gain=pick([100,150,200,250,300]),n=pick([40,50,60,80,90,100,120]),fixed=n*gain;
  return mc(`${/^[aeiou]/.test(what)?'An':'A'} ${what} seller pays ${fmt(fixed)} a day for the stand. Each of the ${unit} costs ${fmt(cost)} to make and sells for ${fmt(cost+gain)}. How many must be sold in a day to cover the stand?`,String(n),
    nn(n,[Math.round(fixed/(cost+gain)),Math.round(fixed/cost),n+10,n-10,n*2]).map(String),
    {why:`Each sale leaves ${fmt(cost+gain)} − ${fmt(cost)} = ${fmt(gain)}. ${fmt(fixed)} ÷ ${fmt(gain)} = ${n}.`});
};
