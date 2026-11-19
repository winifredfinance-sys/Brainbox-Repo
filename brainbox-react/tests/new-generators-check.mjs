/* Checks the Nov 2026 question makers (moreGenerators.js): 4 options where possible, one right answer, worked sums
   that match the answer, no negative or fractional surprises. Run: node tests/new-generators-check.mjs */
import {G} from '../src/engine/generators.js';
import '../src/engine/moreGenerators.js';
const specs=[['shapes',1],['shapes',2],['shapes',3],['shapePattern','AB'],['shapePattern','ABB'],['shapePattern','ABC'],['shapePattern','AABB'],['sum3',50],['missingAdd',10],['missingAdd',30],
 ['fraction',1],['fraction',2],['fraction',3],['seqAlt'],['seqMul'],['seqTri'],['multiStep',1],['multiStep',2],['multiStep',3],['estimate',1],['estimate',2],['estimate',3],['ratioSimple'],['roundTo',1],['roundTo',2],['roundTo',3],['doubleHalf',1],['doubleHalf',2],['doubleHalf',3]];
const evalShow=s=>{const m=s.match(/^([\d ×÷+−()]+)= \?$/);if(!m)return null;return Function('return '+m[1].replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'))()};
let bad=0;
for(const sp of specs){const [fn,...a]=sp,ex=new Map();let few=0,err=[];
 for(let i=0;i<4000;i++){let q;try{q=G[fn](...a)}catch(e){err.push('THROW '+e.message);break}
  const txt=JSON.stringify(q);
  if(q.opts.length<4)few++;
  if(q.ans<0||new Set(q.opts).size!==q.opts.length||/NaN|undefined|Infinity|null|-\d/.test(q.opts.join('|')+q.q+(q.show||'')))err.push(txt);
  const v=evalShow(q.show||'');if(v!==null&&String(v)!==q.opts[q.ans])err.push('WRONG MATH '+txt);
  if(fn==='fraction'&&a[0]===3){const m=q.q.match(/(\d+)\/(\d+) ([+−]) (\d+)\/(\d+)/),A=+m[1]/+m[2],C=+m[4]/+m[5],r=m[3]==='+'?A+C:A-C,[n,d=1]=q.opts[q.ans].split('/').map(Number);if(Math.abs(n/d-r)>1e-9)err.push('WRONG FRACTION '+txt);
    if(q.opts.some((o,k)=>k!==q.ans&&(([x,y=1])=>Math.abs(x/y-r)<1e-9)(o.split('/').map(Number))))err.push('TWO RIGHT '+txt)}
  if(fn==='fraction'&&a[0]===2&&/equal to/.test(q.q)){const [x,y]=q.q.match(/(\d+)\/(\d+)\?/).slice(1).map(Number);const right=q.opts.filter(o=>{const[n,d]=o.split('/').map(Number);return n*y===d*x});if(right.length!==1)err.push('EQUIV '+txt)}
  if(!ex.has(fn+a))ex.set(fn+a,(q.show?'['+q.show+'] ':'')+q.q+' => '+q.opts[q.ans]+'   ('+q.opts.filter((_,k)=>k!==q.ans).join(' / ')+')');
 }
 if(err.length){bad++;console.log('PROBLEM',sp,err.length,err[0].slice(0,220))}
 console.log(JSON.stringify(sp).padEnd(22),few?`(${few} with <4 options) `:'',[...ex.values()][0].slice(0,150));
}
console.log(bad?bad+' makers with problems':'all new makers OK');
