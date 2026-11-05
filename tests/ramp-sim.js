/* Brainbox Ninja: difficulty-ramp simulation. Run: node tests/ramp-sim.js [rounds-per-cell]
   Builds real rounds with js/content.js + js/bank.js (the same build() the game uses) and plays them with a
   simulated player. It is a MODEL, not player data: the chance of a right answer depends only on each
   question's difficulty score (q.d, from DIFF in content.js) compared with the level's average.
     p(right) = BASE - SLOPE * (q.d - level average), clamped to 5%..98%
   BASE is a typical player's accuracy on the level's normal mix; SLOPE is how much one difficulty point matters.
   A round is passed with 6 or more right out of 10 (as in the game). Adaptive difficulty is left out (adj = 0). */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..'),N=+process.argv[2]||400,BASE=.66,SLOPE=.07;
const store={};
const ctx={console,Math,Date,JSON,Set,Map,Array,Object,String,Number,
  localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}};
vm.createContext(ctx);
for(const f of ['js/content.js','js/bank.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
const R=vm.runInContext(`(${function(N,BASE,SLOPE){
  const out={cells:[],single:[]};
  const clamp=x=>Math.max(.05,Math.min(.98,x));
  for(const b of BANDS)for(const c of catsFor(b.id))for(let l=0;l<3;l++){
    const specs=c.L[l],avg=specs.reduce((a,s)=>a+diffOf(s),0)/specs.length;
    if(new Set(specs.map(s=>s[0]+JSON.stringify(s.slice(1)))).size<2)out.single.push(b.id+'/'+c.id+'/'+LEVELS[l]);
    const pass=[],acc=[],dif=[];
    for(let r=0;r<10;r++){
      let p=0,a=0,d=0;
      for(let i=0;i<N;i++){
        for(const k in SEEN)SEEN[k].clear();               /* fresh player each time, so repeats do not skew it */
        const qs=build(b.id,c.id,l,0,r);let right=0;
        for(const q of qs){d+=q.d;const pr=clamp(BASE-SLOPE*(q.d-avg));a+=pr;if(Math.random()<pr)right++}
        if(right>=6)p++;
      }
      pass.push(p/N);acc.push(a/(N*10));dif.push(d/(N*10));
    }
    out.cells.push({band:b.id,cat:c.id,level:l,pass,acc,dif});
  }
  return out;
}})(${N},${BASE},${SLOPE})`,ctx);

const pct=x=>(100*x).toFixed(0).padStart(3)+'%';
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const row=(label,cells,k='pass')=>label.padEnd(22)+Array.from({length:10},(_,r)=>pct(mean(cells.map(c=>c[k][r])))).join(' ');
console.log(`Difficulty-ramp simulation: ${N} rounds per round number, per age band × puzzle type × level (${R.cells.length} cells).`);
console.log(`Model player: ${Math.round(BASE*100)}% right on a level's normal mix, ${Math.round(SLOPE*100)} points less per difficulty point above it. Pass = 6/10.\n`);
console.log('Pass rate by round'.padEnd(22)+Array.from({length:10},(_,r)=>('R'+(r+1)).padStart(4)).join(' '));
console.log(row('All levels',R.cells));
for(let l=0;l<3;l++)console.log(row(['Beginner','Medium','Hard'][l],R.cells.filter(c=>c.level===l)));
for(const b of ['kids','teens','adults','elders'])console.log(row('  '+b,R.cells.filter(c=>c.band===b)));
console.log('\n'+row('Avg difficulty score',R.cells,'dif').replace(/%/g,' ').replace(/(\d+) /g,(m,x)=>(x/100).toFixed(2)+' ').trim());
const flat=R.cells.filter(c=>Math.abs(c.pass[0]-c.pass[9])<.03).map(c=>c.band+'/'+c.cat+'/'+['Beginner','Medium','Hard'][c.level]);
console.log('\nLevels with a single question type ('+R.single.length+'), which ramp only through bigger numbers on Hard:\n  '+R.single.join(', '));
console.log('\nCells where Round 10 is within 3 points of Round 1 ('+flat.length+'):\n  '+flat.join(', '));
const hardest=R.cells.map(c=>({k:c.band+'/'+c.cat+'/'+['Beginner','Medium','Hard'][c.level],p:c.pass[9]})).sort((a,b)=>a.p-b.p).slice(0,5);
console.log('\nLowest Round 10 pass rates: '+hardest.map(x=>x.k+' '+pct(x.p).trim()).join(', '));
