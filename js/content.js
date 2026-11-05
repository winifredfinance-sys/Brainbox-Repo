/* Brainbox Ninja: puzzle content and question generators. Edit proverbs, riddles, words etc. here. */
/* helpers */
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[rnd(0,a.length-1)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=n=>'₦'+Number(n).toLocaleString('en-NG');
const near=(n,sp=[-2,-1,1,2,3,-3,10,-10])=>shuffle(sp).map(d=>n+d).filter(x=>x>0);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mmss=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function mc(q,correct,wrongs,o={}){
  const c=String(correct),seen=new Set([c]),w=[];
  for(const x of wrongs){const s=String(x);if(!seen.has(s)){seen.add(s);w.push(s)}}
  const opts=shuffle([c,...w.slice(0,3)]);
  return Object.assign({q,opts,ans:opts.indexOf(c),show:''},o);
}

/* ---------- content ---------- */
const FR=['🥭','🍊','🍌','🍍','🍉'];
const GROUPS={fruits:['🥭','🍊','🍌','🍍','🍉','🍎'],animals:['🐶','🐱','🐮','🐔','🐟','🐘'],vehicles:['🚗','🚌','✈️','🚲','🚂','⛵']};
const WORDS=[['KANO','city'],['LAGOS','city'],['ABUJA','city'],['ENUGU','city'],['BENIN','city'],['IBADAN','city'],['KADUNA','city'],['ILORIN','city'],['OSOGBO','city'],['CALABAR','city'],['ONITSHA','city'],['ABEOKUTA','city'],['MAIDUGURI','city'],['OWERRI','city'],['SOKOTO','city'],['AKURE','city'],['MINNA','city'],['LOKOJA','city'],['ASABA','city'],['BAUCHI','city'],['JOS','city'],['UYO','city'],['YOLA','city'],['IKEJA','city'],
 ['SUYA','food'],['AKARA','food'],['GARRI','food'],['EGUSI','food'],['AMALA','food'],['JOLLOF','food'],['MOIMOI','food'],['PLANTAIN','food'],['OGBONO','food'],['KILISHI','food'],['PUFFPUFF','food'],['CHINCHIN','food'],['NKWOBI','food'],['TUWO','food'],['OKRA','food'],['BEANS','food'],['EBA','food'],['DODO','food'],
 ['NIGER','river'],['BENUE','river'],['KAINJI','lake'],['ZUMA','landmark'],['YANKARI','landmark'],['OBUDU','landmark']];
const POOL=['Garri','Yam','Rice','Beans','Plantain','Palm oil','Onions','Tomatoes','Pepper','Bread','Sugar','Salt','Eggs','Milk','Fish','Ginger','Carrots','Maggi'];
const PROVERBS=[
 {e:1,t:'However long the night, the ___ will break.',a:'dawn',w:['drum','farm','road'],m:'Hard times do not last forever.'},
 {e:1,t:'It takes a village to raise a ___.',a:'child',w:['goat','yam','market'],m:'Raising a child is shared work.'},
 {e:1,t:'When spiders unite, they can tie down a ___.',a:'lion',w:['goat','hen','tree'],m:'Together, small people can do big things.'},
 {e:1,t:'Smooth seas do not make skilful ___.',a:'sailors',w:['farmers','traders','drummers'],m:'You grow skilled through hard times.'},
 {e:1,t:'No matter how hot your anger is, it cannot cook ___.',a:'yam',w:['rice','beans','fish'],m:'Anger solves nothing.'},
 {e:1,t:'Proverbs are the ___ with which words are eaten.',a:'palm oil',w:['salt','pepper','water'],m:'Proverbs make speech rich and tasty.'},
 {e:1,t:'When the music changes, so does the ___.',a:'dance',w:['drummer','village','song'],m:'When things change, we must adapt.'},
 {e:1,t:'Rain beats a leopard’s skin, but it does not wash out the ___.',a:'spots',w:['claws','colour','smell'],m:'Your true nature does not change easily.'},
 {e:1,t:'The axe forgets, but the ___ remembers.',a:'tree',w:['farmer','forest','river'],m:'The one who is hurt remembers longer than the one who hurts.'},
 {e:1,t:'Patience can cook a ___.',a:'stone',w:['fire','bell','drum'],m:'Patience can achieve almost anything.'},
 {e:1,t:'He who learns, ___.',a:'teaches',w:['forgets','travels','sleeps'],m:'Learning prepares you to teach others.'},
 {e:1,t:'He who asks questions cannot avoid the ___.',a:'answers',w:['teacher','trouble','road'],m:'Asking leads you to knowledge.'},
 {t:'Wisdom is like a baobab tree; no one person can ___ it.',a:'embrace',w:['buy','sell','paint'],m:'Nobody holds all the wisdom alone.'},
 {t:'Rain does not fall on one ___ alone.',a:'roof',w:['farm','road','town'],m:'Good and bad fortune reach everyone.'},
 {t:'Until the lion learns to write, every story will glorify the ___.',a:'hunter',w:['lion','farmer','king'],m:'Stories favour whoever tells them.'},
 {t:'Do not look where you fell, but where you ___.',a:'slipped',w:['jumped','woke','started'],m:'Find the real cause of your mistake.'},
 {t:'He who has not travelled thinks his mother is the best ___.',a:'cook',w:['singer','farmer','teacher'],m:'Seeing the world widens your mind.'},
 {t:'He who is being carried does not realise how ___ the town is.',a:'far',w:['big','old','noisy'],m:'Those who are helped may not see the effort involved.'},
 {t:'When the roots of a tree begin to decay, it spreads death to the ___.',a:'branches',w:['leaves','soil','birds'],m:'Rot at the base harms the whole.'},
 {t:'Knowledge is like a garden: if it is not cultivated, it cannot be ___.',a:'harvested',w:['planted','sold','watered'],m:'Learning needs effort to bear fruit.'}
];
const RIDDLES=[
 {lv:1,q:'What has hands but cannot clap?',a:'A clock',w:['A statue','A chair','A bag'],why:'A clock has hands that point at the time.'},
 {lv:1,q:'What has a head and a tail but no body?',a:'A coin',w:['A snake','A fish','A broom'],why:'Coins have a head side and a tail side.'},
 {lv:1,q:'What has keys but cannot open a door?',a:'A keyboard',w:['A purse','A lock','A bucket'],why:'A keyboard has keys you press.'},
 {lv:1,q:'What has teeth but cannot bite?',a:'A comb',w:['A pillow','A snake','A shoe'],why:'A comb has teeth for your hair.'},
 {lv:1,q:'What runs but never walks?',a:'A river',w:['A table','A bag','A stone'],why:'Rivers run to the sea.'},
 {lv:1,q:'What has a neck but no head?',a:'A bottle',w:['A table','A drum','A mat'],why:'A bottle has a neck at the top.'},
 {lv:1,q:'What can you catch but not throw?',a:'A cold',w:['A ball','A stone','A hat'],why:'You catch a cold from someone.'},
 {lv:1,q:'Which month has 28 days?',a:'All of them',w:['February only','Only in leap years','None'],why:'Every month has at least 28 days.'},
 {lv:1,q:'What goes up but never comes down?',a:'Your age',w:['A ball','A kite','Rain'],why:'Your age only goes up.'},
 {lv:1,q:'What has one eye but cannot see?',a:'A needle',w:['A cat','A coin','A drum'],why:'A needle has an eye for the thread.'},
 {lv:1,q:'What has legs but cannot walk?',a:'A table',w:['A snake','A fish','A shadow'],why:'A table stands on legs.'},
 {lv:2,q:'The more you take, the more you leave behind. What are they?',a:'Footsteps',w:['Coins','Shadows','Pots'],why:'Each step you take leaves another footprint.'},
 {lv:2,q:'What gets wetter the more it dries?',a:'A towel',w:['A river','A bucket','Soap'],why:'A towel gets wet as it dries you.'},
 {lv:2,q:'I speak without a mouth and hear without ears. What am I?',a:'An echo',w:['A radio','A parrot','A drum'],why:'An echo repeats the sounds you make.'},
 {lv:2,q:'What is full of holes but still holds water?',a:'A sponge',w:['A net','A bucket','A basket'],why:'A sponge is full of holes and holds water.'},
 {lv:2,q:'The more of me there is, the less you see. What am I?',a:'Darkness',w:['Light','Water','Wind'],why:'More darkness means you see less.'},
 {lv:2,q:'I have cities but no houses and rivers but no water. What am I?',a:'A map',w:['A market','A dream','A radio'],why:'A map draws cities and rivers without having them.'},
 {lv:3,q:'What comes once in a minute, twice in a moment, but never in a thousand years?',a:'The letter M',w:['The letter A','The number 1','Time'],why:'“Minute” has one M, “moment” has two, and “a thousand years” has none.'},
 {lv:3,q:'A man looks at a portrait and says: “Brothers and sisters I have none, but that man’s father is my father’s son.” Who is in the portrait?',a:'His son',w:['Himself','His father','His brother'],why:'“My father’s son” is himself, so that man’s father is him. The portrait shows his son.'},
 {lv:3,q:'What is always in front of you but cannot be seen?',a:'The future',w:['A wall','Your shadow','The road'],why:'The future is always ahead of you.'},
 {lv:3,q:'What can fill a room but takes up no space?',a:'Light',w:['Smoke','Furniture','Water'],why:'Light fills a room without taking up any space.'}
];
const LOGIC=[
 {lv:1,q:'Ada is taller than Bola. Bola is taller than Chidi. Who is the shortest?',a:'Chidi',w:['Ada','Bola','Cannot tell'],why:'Ada is above Bola, and Bola is above Chidi.'},
 {lv:1,q:'Ayo’s mother has three children. The first is Bayo, the second is Dayo. What is the third child called?',a:'Ayo',w:['Eyo','Fayo','Cannot tell'],why:'The question starts with Ayo’s mother, so Ayo is the third child.'},
 {lv:1,q:'Which is heavier: 1 kg of garri or 1 kg of beans?',a:'They weigh the same',w:['Garri','Beans','Cannot tell'],why:'Both weigh 1 kg.'},
 {lv:1,q:'How many zeros are in one million?',a:'6',w:['5','7','3'],why:'1,000,000 has six zeros.'},
 {lv:1,q:'Tola has 3 mangoes. She gives 1 to Femi and buys 4 more. How many mangoes does she have?',a:'6',w:['8','7','4'],why:'3 − 1 + 4 = 6.'},
 {lv:2,q:'A farmer has 17 goats. All but 9 run away. How many goats are left?',a:'9',w:['8','17','26'],why:'“All but 9” means 9 stayed.'},
 {lv:2,q:'Every danfo in Lagos is yellow. This bus is yellow. Must it be a Lagos danfo?',a:'Not necessarily',w:['Yes, always','No, never','Only on weekdays'],why:'Other yellow buses exist, so being yellow does not prove it is a Lagos danfo.'},
 {lv:2,q:'A bus leaves Lagos at 8:15 am and the trip takes 2 hours 50 minutes. When does it arrive?',a:'11:05 am',w:['10:55 am','11:15 am','11:50 am'],why:'8:15 + 2:50 = 11:05.'},
 {lv:2,q:'Eze is faster than Dayo. Dayo is faster than Kemi. Kemi is faster than Tunde. Who is second fastest?',a:'Dayo',w:['Eze','Kemi','Tunde'],why:'The order is Eze, Dayo, Kemi, Tunde.'},
 {lv:3,q:'5 tailors sew 5 caps in 5 days. How many days do 10 tailors need to sew 10 caps?',a:'5 days',w:['10 days','2 days','25 days'],why:'Each tailor sews one cap in 5 days, so 10 tailors sew 10 caps in 5 days.'},
 {lv:3,q:'A clock takes 6 seconds to strike 3 o’clock. How long does it take to strike 6 o’clock?',a:'15 seconds',w:['12 seconds','18 seconds','10 seconds'],why:'3 strikes have 2 gaps of 3 seconds. 6 strikes have 5 gaps, so 15 seconds.'},
 {lv:3,q:'Three friends share ₦9,000 in the ratio 1 : 2 : 3. How much does the biggest share get?',a:'₦4,500',w:['₦3,000','₦6,000','₦2,250'],why:'There are 6 parts. Each part is ₦1,500, so 3 parts is ₦4,500.'},
 {lv:3,q:'A trader sells a hen for ₦6,000 and makes a 25% loss. What did the hen cost?',a:'₦8,000',w:['₦7,500','₦4,500','₦9,000'],why:'The selling price is 75% of the cost. ₦6,000 ÷ 0.75 = ₦8,000.'}
];

/* ---------- puzzle generators ---------- */
const scr=w=>{let s=w;for(let i=0;i<20&&s===w;i++)s=shuffle(w.split('')).join('');return s};
const wordPool=(lo,hi)=>{const p=WORDS.filter(([w])=>w.length>=lo&&w.length<=hi);return p.length?p:WORDS};
const cap=w=>w[0]+w.slice(1).toLowerCase();
const G={
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

/* ---------- age ranges, puzzle types, levels ---------- */
const BANDS=[
 {id:'kids',name:'Little Minds',range:'4–10',blurb:'Fruit, patterns and easy sums.',cls:'kid'},
 {id:'teens',name:'Sharp Teens',range:'11–17',blurb:'Maths, words, proverbs and logic.',cls:''},
 {id:'adults',name:'Adult Brain Gym',range:'18–59',blurb:'Naira sums, memory, riddles and more.',cls:''},
 {id:'elders',name:'Golden Minds',range:'60+',blurb:'Memory, proverbs, riddles and gentle sums.',cls:'big'}
];
const LEVELS=['Beginner','Medium','Hard'];
const TL={kids:[30,30,30],teens:[20,25,30],adults:[25,30,40],elders:[40,45,50]};
const MULT=[1,1.5,2];
const WORDS_L=[[['scramble',3,6],['missingLetter',3,6]],[['scramble',5,9],['missingLetter',5,9]],[['scramble',7,12],['missingLetter',7,12]]];
const PROV_L=[[['proverb',1]],[['proverb',2]],[['proverb',3]]];
const RID_L=[[['riddle',1,1],['logic',1,1]],[['riddle',1,2],['logic',1,2]],[['riddle',3,3],['logic',2,3]]];
const CATS={
 kids:[
  {id:'count',name:'Count & Compare',glyph:'1 2 3',blurb:'Count fruit and find the bigger number.',L:[[['count',5],['bigger',10]],[['count',10],['bigger',20]],[['count',15],['bigger',100]]]},
  {id:'sums',name:'Add & Take Away',glyph:'+  −',blurb:'Easy sums with fruit and numbers.',L:[[['addE',5]],[['add',10],['sub',10],['addE',10]],[['add',20],['sub',20]]]},
  {id:'patterns',name:'Patterns',glyph:'▲●▲',blurb:'What comes next in the pattern?',L:[[['pattern','AB']],[['pattern','AB'],['pattern','AAB'],['pattern','ABB']],[['pattern','AAB'],['pattern','ABC'],['pattern','AABB']]]},
  {id:'odd',name:'Odd One Out',glyph:'≠',blurb:'Spot the one that does not belong.',L:[[['oddOne',1]],[['oddOne',2]],[['oddOne',3]]]},
  {id:'skip',name:'Skip Counting',glyph:'2 4 6',blurb:'Count in twos, fives and tens.',L:[[['nextNum'],['skip',2]],[['skip',5],['missing',2],['skip',2]],[['skip',10],['missing',3],['skip',5],['missing',5]]]}
 ],
 teens:[
  {id:'maths',name:'Maths',glyph:'×  ÷',blurb:'Times tables, percentages and algebra.',L:[[['mult',2,9],['bigAdd',10,60],['percent',[10,50]]],[['mult',6,12],['bigAdd',40,99],['percent',[10,20,25,50]],['bigSub',50,200]],[['algebra'],['percent',[15,30,35,60]],['mult',11,19],['bigSub',100,900]]]},
  {id:'seq',name:'Number Sequences',glyph:'3 6 9',blurb:'Find the rule and the next number.',L:[[['seqA',[2,3,5,10]]],[['seqA',[6,7,8,9,11,12]],['seqGrow']],[['seqGeo'],['seqFib'],['seqSq'],['seqGrow']]]},
  {id:'words',name:'Word Games',glyph:'Abc',blurb:'Unscramble Nigerian words and fill the gap.',L:WORDS_L},
  {id:'proverbs',name:'Proverbs',glyph:'“ ”',blurb:'Finish the proverb and learn what it means.',L:PROV_L},
  {id:'riddles',name:'Riddles & Logic',glyph:'?',blurb:'Think carefully before you answer.',L:RID_L}
 ],
 adults:[
  {id:'money',name:'Naira Maths',glyph:'₦',blurb:'Change, discounts, profit and loss.',L:[[['change']],[['discount',[10,20,25]],['change']],[['profit'],['loss'],['discount',[15,30,35]]]]},
  {id:'maths',name:'Mental Maths',glyph:'×  ÷',blurb:'Quick sums, percentages and algebra.',L:[[['mult',6,12],['bigAdd',50,200],['bigSub',100,500],['percent',[10,20,50]]],[['mult',11,25],['percent',[15,25,35,60]],['algebra'],['bigSub',200,900]],[['algebra'],['mult',13,29],['percent',[12,18,35,45]],['avg']]]},
  {id:'seq',name:'Number Sequences',glyph:'3 6 9',blurb:'Spot the rule behind the numbers.',L:[[['seqA',[3,4,6,7,8]]],[['seqGrow'],['seqA',[9,11,12,13]],['seqGeo']],[['seqFib'],['seqSq'],['seqGeo'],['seqGrow']]]},
  {id:'words',name:'Word Games',glyph:'Abc',blurb:'Nigerian cities, foods and landmarks.',L:WORDS_L},
  {id:'proverbs',name:'Proverbs',glyph:'“ ”',blurb:'Finish the proverb and explain its meaning.',L:PROV_L},
  {id:'riddles',name:'Riddles & Logic',glyph:'?',blurb:'Brain teasers that reward patience.',L:RID_L},
  {id:'memory',name:'Memory',glyph:'▢▢▢',blurb:'Remember a shopping list, then recall it.',L:[[['memory',4]],[['memory',6]],[['memory',8]]]}
 ],
 elders:[
  {id:'memory',name:'Memory',glyph:'▢▢▢',blurb:'Remember a shopping list, then recall it.',L:[[['memory',3]],[['memory',4]],[['memory',5]]]},
  {id:'proverbs',name:'Proverbs',glyph:'“ ”',blurb:'Finish the proverb and share its meaning.',L:PROV_L},
  {id:'riddles',name:'Riddles',glyph:'?',blurb:'Old favourites and new brain teasers.',L:[[['riddle',1,1]],[['riddle',1,2]],[['riddle',2,3],['logic',1,2]]]},
  {id:'words',name:'Word Games',glyph:'Abc',blurb:'Nigerian cities and foods.',L:[[['scramble',3,5],['missingLetter',3,5]],[['scramble',4,7],['missingLetter',4,7]],[['scramble',6,10],['missingLetter',6,10]]]},
  {id:'numbers',name:'Number Puzzles',glyph:'+  ₦',blurb:'Gentle sums, sequences and market change.',L:[[['seqA',[2,5,10]],['change',500],['bigAdd',10,40]],[['seqA',[3,4,6]],['change',1000],['discount',[10]],['bigSub',30,100]],[['seqGrow'],['discount',[10,20,25]],['change',2000],['percent',[10,50]]]]}
 ]
};
const catsFor=b=>CATS[b].concat([{id:'mix',name:'Mix It Up',glyph:'★',blurb:'A bit of everything from this age range.',L:[0,1,2].map(l=>CATS[b].flatMap(c=>c.L[l]))}]);
const catOf=(b,c)=>catsFor(b).find(x=>x.id===c);
/* questions already shown on this device are remembered so rounds do not repeat (stored as short hashes) */
const hq=s=>{let x=5381;for(let i=0;i<s.length;i++)x=((x<<5)+x+s.charCodeAt(i))|0;return (x>>>0).toString(36)};
const SEEN={};
try{const raw=JSON.parse(ls.get('bn-seen-v1')||'{}')||{};for(const k in raw)if(Array.isArray(raw[k]))SEEN[k]=new Set(raw[k])}catch(e){}
const saveSeen=()=>{const o={};for(const k in SEEN){const a=[...SEEN[k]];o[k]=a.slice(-500)}ls.set('bn-seen-v1',JSON.stringify(o))};
function pull(b,c,l,n){
  const specs=catOf(b,c).L[l],ck=b+'_'+c+'_'+l,qs=[],seen=new Set(),sn=SEEN[ck]||(SEEN[ck]=new Set());let reset=false;
  for(let t=0;qs.length<n&&t<800;t++){
    if(t>250&&!reset){sn.clear();reset=true}
    const [fn,...a]=pick(specs),q=G[fn](...a),k=hq(q.q+'|'+q.show+'|'+(q.memo||''));
    if(!seen.has(k)&&!sn.has(k)){seen.add(k);qs.push(q)}
  }
  seen.forEach(k=>sn.add(k));
  return qs;
}
/* adj = +1 swaps 3 of the 10 questions for ones from the next level up, -1 for the level below (adaptive difficulty) */
function build(b,c,l,adj=0){
  const l2=l+adj,k=(adj&&l2>=0&&l2<=2)?3:0;
  const qs=pull(b,c,l,10-k).concat(k?pull(b,c,l2,k):[]);
  saveSeen();
  return k?shuffle(qs):qs;
}
