/* More question makers (Nov 2026): shapes and two-step sums for 4-10, fractions and harder sequences for 11-17,
   multi-step mental arithmetic, estimation and ratios for 18-59, memory-friendly arithmetic and shape patterns for 60+.
   Each adds G.name(...settings) like the makers in generators.js. Wrong options are the usual slips (adding instead of
   taking away, working left to right, rounding the wrong way...), not random numbers. */
import {G} from './generators.js';
import {rnd,pick,shuffle,near,mc,fmt} from './helpers.js';

const nf=n=>Number(n).toLocaleString('en-NG');
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const frac=(n,d)=>{const g=gcd(n,d);n/=g;d/=g;return d===1?String(n):n+'/'+d};

/* ---------- 4-10: shapes ---------- */
const SH=[{n:'Circle',sides:0,g:'●'},{n:'Triangle',sides:3,g:'▲'},{n:'Square',sides:4,g:'■'},{n:'Rectangle',sides:4,g:'▬'},
  {n:'Pentagon',sides:5},{n:'Hexagon',sides:6},{n:'Octagon',sides:8}];
const drawn=SH.filter(s=>s.g);
G.shapes=lv=>{
  if(lv===1){
    const r=Math.random();
    if(r<.4){   /* count one shape in a mixed row */
      const t=pick(drawn),n=rnd(2,5),row=shuffle(Array(n).fill(t.g).concat(Array(rnd(2,4)).fill(0).map(()=>pick(drawn.filter(x=>x!==t)).g)));
      return mc(`How many ${t.n.toLowerCase()}s can you see?`,n,[n-1,n+1,n+2,row.length].filter(x=>x>0),{show:row.join(' '),why:`Count only the ${t.n.toLowerCase()}s: there are ${n}.`});
    }
    if(r<.7){const s=pick(drawn);return mc('What is the name of this shape?',s.n,shuffle(drawn.filter(x=>x!==s)).map(x=>x.n),{show:s.g,why:s.sides?`A ${s.n.toLowerCase()} has ${s.sides} sides.`:'A circle is round, with no sides or corners.'})}
    const s=pick(drawn.filter(x=>x.sides));return mc('How many sides does this shape have?',s.sides,[s.sides-1,s.sides+1,s.sides+2,0].filter(x=>x>=0),{show:s.g,why:`Count the straight edges: a ${s.n.toLowerCase()} has ${s.sides}.`});
  }
  if(lv===2){
    if(Math.random()<.4){   /* add up the sides of the shapes shown */
      const row=Array(rnd(2,4)).fill(0).map(()=>pick(drawn.filter(x=>x.sides))),tot=row.reduce((a,x)=>a+x.sides,0);
      return mc('How many sides do these shapes have altogether?',tot,[tot-1,tot+1,tot+3,tot-3,row.length].filter(x=>x>0),{show:row.map(x=>x.g).join(' '),why:row.map(x=>x.sides).join(' + ')+` = ${tot}.`});
    }
    const s=pick(SH.filter(x=>x.sides>=3));
    if(Math.random()<.5)return mc(`A shape has ${s.sides} straight sides. Which shape could it be?`,s.n,SH.filter(x=>x.sides!==s.sides).map(x=>x.n),{why:`A ${s.n.toLowerCase()} has ${s.sides} sides.`});
    const k=rnd(2,3),t=pick(SH.filter(x=>x.sides>=3&&x.sides<=6)),tot=k*t.sides;
    return mc(`How many sides do ${k} ${t.n.toLowerCase()}s have altogether?`,tot,[tot+t.sides,tot-t.sides,k+t.sides,tot+1].filter(x=>x>0),{show:t.g?Array(k).fill(t.g).join(' '):'',why:`${k} × ${t.sides} = ${tot}.`});
  }
  const a=pick(SH.filter(x=>x.sides>=3)),b=pick(SH.filter(x=>x.sides>=3&&x.n!==a.n)),ka=rnd(2,3),kb=rnd(1,3),tot=ka*a.sides+kb*b.sides;
  return mc(`How many sides do ${ka} ${a.n.toLowerCase()}s and ${kb} ${b.n.toLowerCase()}${kb>1?'s':''} have in all?`,tot,[tot-b.sides,tot+a.sides,ka*a.sides,tot+1,tot-1].filter(x=>x>0),{why:`${ka} × ${a.sides} = ${ka*a.sides}, ${kb} × ${b.sides} = ${kb*b.sides}, and ${ka*a.sides} + ${kb*b.sides} = ${tot}.`});
};
/* shape patterns (4-10 Patterns, 60+ Number Puzzles) */
G.shapePattern=kind=>{
  const [A,B,C,D]=shuffle(['▲','●','■','◆','★']);
  const M={AB:[[A,B,A,B,A],B],ABB:[[A,B,B,A,B],B],ABC:[[A,B,C,A,B],C],AABB:[[A,A,B,B,A],A],ABCB:[[A,B,C,B,A],B]};
  const unit=M[kind][0].slice(0,{AB:2,ABB:3,ABC:3,AABB:4,ABCB:4}[kind]),len=rnd(unit.length+2,unit.length*2+3),
    seq=Array(len).fill(0).map((_,i)=>unit[i%unit.length]),nx=unit[len%unit.length];
  return mc('Which shape comes next?',nx,[A,B,C,D].filter(x=>x!==nx),{show:seq.join(' ')+' ?',why:'The shapes repeat in the same order: '+unit.join(' ')+'.'});
};

/* ---------- 4-10: two-step sums and missing numbers ---------- */
G.sum3=m=>{const a=rnd(5,m-10),b=rnd(2,Math.min(15,m-a)),c=rnd(1,a+b-1),r=a+b-c;
  return mc('Work it out from left to right',r,[a+b+c,a-b+c,r+1,r-1,r+10].filter(x=>x>=0),{show:`${a} + ${b} − ${c} = ?`,why:`${a} + ${b} = ${a+b}, then ${a+b} − ${c} = ${r}.`})};
G.missingAdd=m=>{const b=rnd(2,Math.floor(m/2)),r=rnd(b+1,m),a=r-b;
  return mc('Which number is missing?',a,[r+b,b,a+1,a-1].filter(x=>x>=0),{show:`? + ${b} = ${r}`,why:`${r} − ${b} = ${a}, so ${a} + ${b} = ${r}.`})};

/* ---------- 11-17: fractions ---------- */
G.fraction=lv=>{
  if(lv===1){const d=pick([2,3,4,5,10]),k=rnd(2,12),n=d*k;
    return mc(`What is 1/${d} of ${n}?`,k,[n-k,k*2,d,n/2,k+1,k-1,n+d].filter(x=>x>0&&x!==k&&Number.isInteger(x)),{why:`Divide by ${d}: ${n} ÷ ${d} = ${k}.`})}
  if(lv===2){
    if(Math.random()<.5){const d=pick([3,4,5,6,8,10]),a=rnd(2,d-1),k=rnd(2,12),n=d*k;
      if(gcd(a,d)>1&&Math.random()<.5)return G.fraction(2);
      return mc(`What is ${a}/${d} of ${n}?`,a*k,[k,n-a*k,a*k+k,a*k-k,a*k+a,n].filter(x=>x>0&&x!==a*k),{why:`1/${d} of ${n} is ${k}, so ${a}/${d} is ${a} × ${k} = ${a*k}.`})}
    const a=rnd(1,4),b=rnd(a+1,6),m=rnd(2,4);
    if(gcd(a,b)>1)return G.fraction(2);
    return mc(`Which fraction is equal to ${a}/${b}?`,`${a*m}/${b*m}`,[`${a*m}/${b}`,`${a}/${b*m}`,`${a+m}/${b+m}`,`${b*m}/${a*m}`],{why:`Multiply the top and the bottom by ${m}: ${a}/${b} = ${a*m}/${b*m}.`});
  }
  /* Hard: add or take away fractions with different bottoms */
  const ds=pick([[2,3],[3,4],[2,5],[3,5],[4,5],[5,6],[3,8],[4,6],[2,7]]),[b,d]=shuffle(ds),a=rnd(1,b-1),c=rnd(1,d-1),plus=Math.random()<.6;
  const top=plus?a*d+c*b:a*d-c*b;if(top<=0)return G.fraction(3);
  const ans=frac(top,b*d);
  return mc(`Work out ${a}/${b} ${plus?'+':'−'} ${c}/${d}. Give the simplest answer.`,ans,[`${plus?a+c:Math.abs(a-c)}/${b+d}`,frac(plus?a+c:Math.max(1,Math.abs(a-c)),b*d),frac(top+1,b*d),frac(Math.max(1,top-1),b*d),`${top}/${b+d}`,frac(a*c,b*d),frac(top+2,b*d)].filter(f=>{const[x,y=1]=f.split('/').map(Number);return Math.abs(x/y-top/(b*d))>1e-9}),
    {why:`Use ${b*d} as the bottom: ${a}/${b} = ${a*d}/${b*d} and ${c}/${d} = ${c*b}/${b*d}. ${a*d} ${plus?'+':'−'} ${c*b} = ${top}, so ${top}/${b*d}${frac(top,b*d)!==top+'/'+b*d?' = '+ans:''}.`});
};

/* ---------- sequences that need more thought (11-17 and 18-59 Medium/Hard) ---------- */
G.seqAlt=()=>{const s=rnd(3,30),u=rnd(4,12),d=rnd(2,u-1),t=[s];for(let i=1;i<6;i++)t.push(i%2?t[i-1]+u:t[i-1]-d);const c=t[5];
  return mc('What number comes next?',c,[t[4]-d,c+d,c-u,t[4]+d].filter(x=>x>0&&x!==c),{show:t.slice(0,5).join(', ')+', ?',why:`The rule takes turns: add ${u}, then take away ${d}.`})};
G.seqMul=()=>{const m=pick([2,3]),k=pick([1,2,-1]),s=rnd(k<0?3:1,6),t=[s];for(let i=1;i<5;i++)t.push(t[i-1]*m+k);const c=t[4]*m+k;
  return mc('What number comes next?',c,[t[4]*m,c+k*2,t[4]+(t[4]-t[3]),c+m,c-m].filter(x=>x>0&&x!==c),{show:t.join(', ')+', ?',why:`Multiply by ${m}, then ${k>0?'add '+k:'take away '+(-k)}.`})};
G.seqTri=()=>{const o=rnd(0,6),n=rnd(1,4),t=[0,1,2,3,4].map(i=>(n+i)*(n+i+1)/2+o),c=(n+5)*(n+6)/2+o,g=t[4]-t[3];
  return mc('What number comes next?',c,[t[4]+g,c+1,c-1,t[4]+g-1].filter(x=>x!==c),{show:t.join(', ')+', ?',why:`The gaps grow by 1 each time: ${t[1]-t[0]}, ${t[2]-t[1]}, ${t[3]-t[2]}, ${g}, so the next gap is ${g+1}.`})};

/* ---------- 18-59 (and 11-17 Hard): multi-step mental arithmetic ---------- */
G.multiStep=lv=>{
  if(lv===1){const a=rnd(3,9),b=rnd(4,12),c=rnd(10,60),r=a*b+c;
    return mc('Work it out (multiply first)',r,[a*(b+c),Math.abs(a*b-c),r+10,r-1,r+a].filter(x=>x>0&&x!==r),{show:`${a} × ${b} + ${c} = ?`,why:`${a} × ${b} = ${a*b}, then + ${c} = ${r}.`})}
  if(lv===2){
    if(Math.random()<.5){const a=rnd(6,15),b=rnd(4,12),c=rnd(3,9),d=rnd(2,9),r=a*b-c*d;if(r<5)return G.multiStep(2);
      return mc('Work it out (multiply first)',r,[(a*b-c)*d,a*(b-c)*d,r+c,r-d,r+d].filter(x=>x>0&&x!==r),{show:`${a} × ${b} − ${c} × ${d} = ?`,why:`${a} × ${b} = ${a*b} and ${c} × ${d} = ${c*d}; ${a*b} − ${c*d} = ${r}.`})}
    const a=rnd(12,48),b=rnd(7,29),c=rnd(3,9),r=(a+b)*c;
    return mc('Work it out (brackets first)',r,[a+b*c,a*c+b,r-c,r+10],{show:`(${a} + ${b}) × ${c} = ?`,why:`${a} + ${b} = ${a+b}, then × ${c} = ${r}.`});
  }
  const e=rnd(3,9),q=rnd(4,12),a=e*q,b=rnd(4,12),c=rnd(6,15),d=rnd(5,Math.min(40,q+b*c-5)),r=q+b*c-d,ltr=(q+b)*c-d;
  return mc('Work it out (divide and multiply before adding and taking away)',r,[ltr,q+b*(c-d),r+b,r-c,r+e].filter(x=>x>0&&x!==r),{show:`${a} ÷ ${e} + ${b} × ${c} − ${d} = ?`,why:`${a} ÷ ${e} = ${q} and ${b} × ${c} = ${b*c}; ${q} + ${b*c} − ${d} = ${r}. Working left to right gives ${ltr}, which is wrong.`});
};
/* estimation */
G.estimate=lv=>{
  if(lv===1){const x=rnd(2,9),y=rnd(2,9),a=x*10+pick([-1,1,-2,2]),b=y*10+pick([-1,1,2,-2]),r=x*y*100;
    return mc(`Which is the best estimate of ${a} × ${b}?`,nf(r),[nf(r/10),nf(r*10),nf(r*2),nf(r+x*10)],{why:`Round to ${x*10} × ${y*10} = ${nf(r)}. The exact answer is ${nf(a*b)}.`})}
  if(lv===2){const p=pick([10,20,25,50]),base=pick([2000,4000,5000,8000,10000,20000]),off=pick([-40,-20,20,30,50]),amt=base+off,pp=p+pick([-1,1]),r=base*p/100;
    return mc(`About how much is ${pp}% of ${fmt(amt)}?`,fmt(r),[fmt(r/10),fmt(r*2),fmt(base-r),fmt(r/2)].filter(x=>x!==fmt(r)),{why:`${pp}% is about ${p}%, and ${fmt(amt)} is about ${fmt(base)}. ${p}% of ${fmt(base)} = ${fmt(r)}.`})}
  const [what,unit,time,lo,hi]=pick([['A bus carries','passengers each trip','trips',3,6],['A baker sells','loaves a day','days',3,9],['A farmer plants','yam mounds in each row','rows',2,9],['A printer prints','pages a minute','minutes',3,9]]);
  const x=rnd(lo,hi),y=rnd(2,9),a=x*10+pick([-2,-1,1,2]),b=y*10+pick([-1,1]),r=x*y*100;
  return mc(`${what} ${a} ${unit}. About how many in ${b} ${time}?`,'About '+nf(r),['About '+nf(r/10),'About '+nf(r*10),'About '+nf(r+x*100),'About '+nf(a+b)].filter(s=>s!=='About '+nf(r)),{why:`${a} is about ${x*10} and ${b} is about ${y*10}; ${x*10} × ${y*10} = ${nf(r)}. Exactly: ${nf(a*b)}.`});
};
/* ratios */
G.ratioSimple=()=>{const [a,b]=pick([[2,3],[3,4],[2,5],[3,5],[4,5],[5,6],[1,3],[3,7],[5,8]]),k=rnd(2,9),A=a*k,B=b*k,h=k%2===0?2:k%3===0?3:0;
  return mc(`Write the ratio ${A} : ${B} in its simplest form`,`${a} : ${b}`,[`${b} : ${a}`,h?`${A/h} : ${B/h}`:`${a+1} : ${b+1}`,`${A-B<0?b-a:a-b} : ${a}`,`${a} : ${b+1}`].filter(s=>s!==`${a} : ${b}`),{why:`Divide both by ${k}: ${A} ÷ ${k} = ${a} and ${B} ÷ ${k} = ${b}.`})};

/* ---------- 60+: memory-friendly arithmetic ---------- */
G.roundTo=lv=>{
  const to=[10,100,1000][lv-1],n=rnd(to+1,to*99),r=Math.round(n/to)*to;if(n%to===0||n%to===to/2)return G.roundTo(lv);
  const down=Math.floor(n/to)*to,up=down+to;
  return mc(`Round ${nf(n)} to the nearest ${nf(to)}`,nf(r),[nf(r===down?up:down),nf(Math.round(n/(to*10))*to*10),nf(r+to),nf(r-to),nf(down-to),nf(up+to),nf(n)].filter(x=>x!=='0'&&x!==nf(r)),{why:`${nf(n)} is between ${nf(down)} and ${nf(up)}, and nearer to ${nf(r)}.`});
};
G.doubleHalf=lv=>{
  const top=[50,500,5000][lv-1],dbl=Math.random()<.5;
  if(dbl){const n=rnd(top/10,top),r=2*n;return mc(`What is double ${nf(n)}?`,nf(r),[nf(r-10),nf(r+10),nf(n+2),nf(n/2|0)].filter(x=>x!==nf(r)&&x!=='0'),{why:`${nf(n)} + ${nf(n)} = ${nf(r)}.`})}
  const n=2*rnd(Math.ceil(top/20),top/2),r=n/2;return mc(`What is half of ${nf(n)}?`,nf(r),[nf(r+10),nf(r-1),nf(n*2),nf(r+5)].filter(x=>x!==nf(r)&&x!=='0'),{why:`${nf(n)} ÷ 2 = ${nf(r)}.`});
};
