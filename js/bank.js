/* Brainbox Ninja: extra question bank. Add your own proverbs, riddles, logic puzzles and words here.
   Everything below is added to the lists in content.js when the page loads.
   PLEASE have a Nigerian reader check the proverbs and their meanings before a wide launch. */

/* ---------- more emoji for counting, adding and patterns (more variety for kids) ---------- */
FR.push('🍎','🍇','🍓','🥕','🌽','🐶','🐱','🐔','🐟','🐘','🚗','🚌','⚽','⭐','🌳','🏠','🎈','🥚');

/* ---------- more words (the game removes duplicates) ---------- */
[['LAFIA','city'],['GOMBE','city'],['DUTSE','city'],['DAMATURU','city'],['MAKURDI','city'],['AWKA','city'],['UMUAHIA','city'],['ABAKALIKI','city'],['ILESHA','city'],['SAGAMU','city'],['KATSINA','city'],['ZARIA','city'],
 ['OYO','state'],['OGUN','state'],['OSUN','state'],['EDO','state'],['DELTA','state'],['RIVERS','state'],['BORNO','state'],['KWARA','state'],['KEBBI','state'],['ZAMFARA','state'],['TARABA','state'],['NASARAWA','state'],['EBONYI','state'],['IMO','state'],['ABIA','state'],['EKITI','state'],['ONDO','state'],['ANAMBRA','state'],['BAYELSA','state'],['KOGI','state'],['BENUE','state'],['PLATEAU','state'],['ADAMAWA','state'],['YOBE','state'],['JIGAWA','state'],
 ['YAM','food'],['RICE','food'],['BOLI','food'],['MASA','food'],['FUFU','food'],['ABACHA','food'],['ISIEWU','food'],['OFADA','food'],['EFO','food'],['GBEGIRI','food'],['EWEDU','food'],['PEPPERSOUP','food'],['ASUN','food'],['EWA','food'],
 ['KUNU','drink'],['ZOBO','drink'],['PALMWINE','drink'],['OLUMO','landmark'],['IDANRE','landmark'],['ASOROCK','landmark'],['OSUN GROVE','landmark'],['NIGER DELTA','landmark']]
 .forEach(w=>{if(w[0].indexOf(' ')<0&&!WORDS.some(x=>x[0]===w[0]))WORDS.push(w)});

['Cabbage','Cassava','Cowpea','Crayfish','Cucumber','Garden egg','Groundnut','Pawpaw','Orange','Pineapple','Watermelon','Banana','Honey','Soap','Candles','Matches','Spinach','Maize','Corn flour','Palm kernel'].forEach(x=>{if(!POOL.includes(x))POOL.push(x)});

/* ---------- more proverbs ---------- */
PROVERBS.push(
 {e:1,t:'If you want to go fast, go alone. If you want to go far, go ___.',a:'together',w:['early','quietly','slowly'],m:'Big goals are reached by working with others.'},
 {e:1,t:'Only a fool tests the depth of a river with both ___.',a:'feet',w:['hands','eyes','sticks'],m:'Do not risk everything to test something unknown.'},
 {e:1,t:'Knowledge without wisdom is like water in the ___.',a:'sand',w:['pot','river','rain'],m:'Knowing things is not enough unless you use them wisely.'},
 {e:1,t:'A roaring lion kills no ___.',a:'game',w:['goat','dog','bird'],m:'Doing the work matters more than making noise.'},
 {e:1,t:'It is the calm and silent water that drowns a ___.',a:'man',w:['fish','boat','child'],m:'Quiet people can be more dangerous than loud ones.'},
 {e:1,t:'However far the stream flows, it never forgets its ___.',a:'source',w:['bank','name','sound'],m:'Never forget where you come from.'},
 {e:1,t:'When you pray, move your ___.',a:'feet',w:['hands','lips','head'],m:'Work for what you ask for.'},
 {e:1,t:'Cross the river in a crowd and the crocodile will not ___ you.',a:'eat',w:['see','hear','follow'],m:'There is safety in numbers.'},
 {e:1,t:'The child who is not embraced by the village will burn it down to feel its ___.',a:'warmth',w:['size','noise','colour'],m:'Children who are not cared for may cause harm to get attention.'},
 {e:1,t:'Two men in a burning house must not stop to ___.',a:'argue',w:['sleep','eat','sing'],m:'In an emergency, work together instead of quarrelling.'},
 {e:1,t:'A toad does not run in the daytime for ___.',a:'nothing',w:['water','fun','food'],m:'Everything happens for a reason.'},
 {e:1,t:'Wherever something stands, something else will stand ___ it.',a:'beside',w:['on','above','behind'],m:'There is always more than one way or one side to things.'},
 {e:1,t:'A good name is better than ___.',a:'gold',w:['sleep','a house','a long life'],m:'Your reputation is worth more than money.'},
 {e:1,t:'A crab does not give birth to a ___.',a:'bird',w:['crab','fish','frog'],m:'Children take after their parents.'},
 {e:1,t:'Fire is a good servant but a bad ___.',a:'master',w:['friend','cook','guest'],m:'Useful things can be dangerous when they are not controlled.'},
 {e:1,t:'Do not use a hatchet to remove a fly from your friend’s ___.',a:'forehead',w:['hand','shoulder','plate'],m:'Solve small problems gently, not with force.'},
 {e:1,t:'When elephants fight, it is the ___ that suffers.',a:'grass',w:['tree','river','hunter'],m:'When powerful people quarrel, ordinary people suffer.'},
 {e:1,t:'Hurry, hurry has no ___.',a:'blessing',w:['shoes','ending','friends'],m:'Rushing leads to mistakes.'},
 {e:1,t:'One hand cannot tie a ___.',a:'bundle',w:['rope','knot','basket'],m:'Some jobs need many hands.'},
 {e:1,t:'Death does not blow a ___.',a:'trumpet',w:['whistle','drum','horn'],m:'Trouble comes without warning, so be ready.'},
 {e:1,t:'No condition is ___.',a:'permanent',w:['painful','cheap','perfect'],m:'Good and bad times both pass.'},
 {e:1,t:'Slow and steady wins the ___.',a:'race',w:['market','prize','game'],m:'Keep going at a steady pace and you will arrive.'},
 {e:1,t:'Little by little, the bird builds its ___.',a:'nest',w:['wings','song','name'],m:'Big things are built in small steps.'},
 {e:1,t:'The frog does not drink up the pond in which it ___.',a:'lives',w:['sleeps','sings','swims'],m:'Do not destroy what supports you.'},
 {e:1,t:'A lion does not turn around when a small dog ___.',a:'barks',w:['runs','sleeps','eats'],m:'Great people ignore petty insults.'},
 {t:'You do not teach the paths of the forest to an old ___.',a:'gorilla',w:['hunter','farmer','child'],m:'Do not lecture people who know more than you.'},
 {t:'If you close your eyes to facts, you will learn through ___.',a:'accidents',w:['books','songs','travel'],m:'Ignoring warnings leads to painful lessons.'},
 {e:1,t:'Patience is the ___ for the troubles of the world.',a:'medicine',w:['road','weapon','price'],m:'Patience heals many problems.'},
 {t:'When a child falls he looks ahead; when an elder falls he looks ___.',a:'back',w:['up','down','away'],m:'Wise elders study the past to understand their mistakes.'},
 {t:'Water that has been begged for does not quench ___.',a:'thirst',w:['fire','dust','hunger'],m:'Depending on others never fully satisfies you.'},
 {e:1,t:'Ears that do not listen to advice accompany the ___ when it is cut off.',a:'head',w:['hand','body','tree'],m:'People who ignore advice pay the price.'},
 {e:1,t:'He who wants honey must put up with the ___.',a:'bees',w:['smoke','heat','wind'],m:'To get something sweet, you must accept some pain.'},
 {t:'The best cooking pot will not cook food by ___.',a:'itself',w:['fire','night','hand'],m:'Even the best tools need effort from you.'},
 {e:1,t:'A tree does not move unless there is ___.',a:'wind',w:['rain','a bird','sunlight'],m:'Nothing happens without a cause.'}
);

/* ---------- more riddles ---------- */
RIDDLES.push(
 {lv:1,q:'What has a neck but no head?',a:'A bottle',w:['A shirt','A snake','A cup'],why:'A bottle has a neck but no head.'},
 {lv:1,q:'What gets wetter the more it dries?',a:'A towel',w:['A sponge','Soap','A bucket'],why:'A towel gets wet as it dries you.'},
 {lv:1,q:'What has one eye but cannot see?',a:'A needle',w:['A potato','A cat','A pot'],why:'A needle has an eye for the thread.'},
 {lv:1,q:'What goes up but never comes down?',a:'Your age',w:['A ball','A kite','A bird'],why:'Your age only goes up.'},
 {lv:1,q:'What has legs but cannot walk?',a:'A table',w:['A snake','A fish','A cloud'],why:'A table has legs but cannot walk.'},
 {lv:1,q:'What can you catch but not throw?',a:'A cold',w:['A ball','A stone','A fish'],why:'You catch a cold, but you cannot throw it.'},
 {lv:1,q:'What has a ring but no finger?',a:'A telephone',w:['A glove','A hand','A door'],why:'A phone rings.'},
 {lv:1,q:'What has words but never speaks?',a:'A book',w:['A parrot','A radio','A drum'],why:'A book is full of words but it is silent.'},
 {lv:1,q:'What is full of holes but still holds water?',a:'A sponge',w:['A net','A basket','A sieve'],why:'A sponge has many holes and soaks up water.'},
 {lv:1,q:'What flies without wings?',a:'Time',w:['A stone','A house','A table'],why:'Time flies.'},
 {lv:1,q:'What goes through towns and over hills but never moves?',a:'A road',w:['A bus','A river','A bird'],why:'A road runs through places but stays where it is.'},
 {lv:1,q:'What has to be broken before you can use it?',a:'An egg',w:['A stick','A promise','A plate'],why:'You break an egg before cooking it.'},
 {lv:1,q:'What goes up when the rain comes down?',a:'An umbrella',w:['A fence','A stool','A door'],why:'You open an umbrella when it rains.'},
 {lv:1,q:'What can you see through that is not air?',a:'A window',w:['A wall','A door','A roof'],why:'A window is clear glass.'},
 {lv:2,q:'What comes once in a minute, twice in a moment, but never in a thousand years?',a:'The letter M',w:['The letter T','A second','A sneeze'],why:'The letter M is in “minute” once, “moment” twice, and “thousand years” not at all.'},
 {lv:2,q:'What belongs to you but other people use it more than you do?',a:'Your name',w:['Your phone','Your bag','Your chair'],why:'People call you by your name more than you say it.'},
 {lv:2,q:'What breaks as soon as you say its name?',a:'Silence',w:['A glass','A promise','An egg'],why:'Speaking breaks the silence.'},
 {lv:2,q:'What can travel around the world while staying in a corner?',a:'A stamp',w:['A bird','A ship','A coin'],why:'A stamp stays in the corner of the envelope.'},
 {lv:2,q:'What building has the most stories?',a:'A library',w:['A church','A school','A bank'],why:'A library is full of stories.'},
 {lv:2,q:'What has a spine but no bones?',a:'A book',w:['A fish','A snake','A chair'],why:'A book has a spine.'},
 {lv:2,q:'What gets bigger the more you take away from it?',a:'A hole',w:['A pile','A debt','A shadow'],why:'Dig more out and the hole grows.'},
 {lv:2,q:'What has cities but no houses, mountains but no trees, and water but no fish?',a:'A map',w:['A calendar','A dream','A story'],why:'A map shows all of these without the real things.'},
 {lv:2,q:'What is black when clean and white when dirty?',a:'A blackboard',w:['A shoe','A cloth','A car'],why:'Chalk makes a blackboard white.'},
 {lv:2,q:'What can be cracked, made, told and played?',a:'A joke',w:['An egg','A game','A song'],why:'You crack, make, tell and play a joke.'},
 {lv:2,q:'What goes around the whole compound but never moves?',a:'A fence',w:['A dog','The wind','A guard'],why:'A fence surrounds the compound but stays put.'},
 {lv:2,q:'Which month of the year has 28 days?',a:'All of them',w:['February only','None','Only in a leap year'],why:'Every month has at least 28 days.'},
 {lv:2,q:'What can you keep after giving it to someone?',a:'Your word',w:['Your money','Your phone','Your shoes'],why:'When you give your word, you still have to keep it.'},
 {lv:2,q:'If you have it, you want to share it. If you share it, you no longer have it. What is it?',a:'A secret',w:['Money','Food','A smile'],why:'Once a secret is shared, it is no longer a secret.'},
 {lv:2,q:'I am not alive, but I grow. I need air, but have no lungs. Water kills me. What am I?',a:'Fire',w:['A plant','A cloud','Smoke'],why:'Fire grows, needs air and is put out by water.'},
 {lv:2,q:'The more of it there is, the less you see. What is it?',a:'Darkness',w:['Light','Fog on a screen','Sand'],why:'In more darkness, you see less.'},
 {lv:2,q:'What can you hear but not see or touch?',a:'An echo',w:['A shadow','A wind','A smell'],why:'An echo is only sound.'},
 {lv:2,q:'I am tall when I am young and short when I am old. What am I?',a:'A candle',w:['A tree','A child','A pencil case'],why:'A candle burns down as it gets older.'},
 {lv:2,q:'What has a bank but no money?',a:'A river',w:['A wallet','A pot','A school'],why:'A river has banks along its sides.'},
 {lv:2,q:'What goes up and down the stairs without moving?',a:'A carpet',w:['A ghost','A cat','A rope'],why:'A stair carpet covers every step.'},
 {lv:3,q:'What has four legs in the morning, two at noon and three in the evening?',a:'A human being',w:['A dog','A table','A bird'],why:'A baby crawls, an adult walks, and an old person uses a stick.'},
 {lv:3,q:'What is light as a feather, yet the strongest person cannot hold it for long?',a:'Breath',w:['A cloud','Smoke','Water'],why:'Nobody can hold their breath for long.'},
 {lv:3,q:'What do you throw away when you need it and take back when you do not?',a:'An anchor',w:['A net','A coin','A rope'],why:'A ship drops its anchor to stop and lifts it to sail.'},
 {lv:3,q:'What has 13 hearts but no other organs?',a:'A deck of cards',w:['A doctor','A statue','A drum'],why:'A deck has 13 hearts cards.'},
 {lv:3,q:'What is at the end of a rainbow?',a:'The letter W',w:['A pot of gold','The sky','The sun'],why:'The word “rainbow” ends with W.'},
 {lv:3,q:'What occurs once in a year, twice in a week, but never in a day?',a:'The letter E',w:['A holiday','The letter Y','A birthday'],why:'“Year” has one E, “week” has two, and “day” has none.'},
 {lv:3,q:'What can be seen in March and April but not at the start or end of either month?',a:'The letter R',w:['The letter A','Rain','The sun'],why:'R is in the middle of the words March and April.'},
 {lv:3,q:'What five-letter word becomes shorter when you add two letters to it?',a:'Short',w:['Small','Brief','Quick'],why:'Add “er” to “short” and you get “shorter”.'},
 {lv:3,q:'A man points at a photo and says: “Brothers and sisters I have none, but that man’s father is my father’s son.” Who is in the photo?',a:'His son',w:['Himself','His father','His brother'],why:'“My father’s son” is himself, so that man’s father is him. The photo is of his son.'},
 {lv:3,q:'What word is always spelled wrongly in the dictionary?',a:'Wrongly',w:['Dictionary','Spelled','Always'],why:'The word is “wrongly”.'},
 {lv:3,q:'What starts with T, ends with T, and has T inside it?',a:'A teapot',w:['A tent','A tomato','A table'],why:'A teapot starts and ends with T and holds tea.'}
);

/* ---------- more logic puzzles ---------- */
LOGIC.push(
 {lv:1,q:'Kemi has 5 oranges and gives 2 to Sade. How many does she have left?',a:'3',w:['2','5','7'],why:'5 − 2 = 3.'},
 {lv:1,q:'How many days are in 2 weeks?',a:'14',w:['12','9','21'],why:'7 + 7 = 14.'},
 {lv:1,q:'If today is Monday, what day will it be in 3 days?',a:'Thursday',w:['Wednesday','Friday','Tuesday'],why:'Tuesday, Wednesday, Thursday.'},
 {lv:1,q:'How many legs do 3 goats have in all?',a:'12',w:['9','6','8'],why:'3 × 4 = 12.'},
 {lv:1,q:'Chika is older than Musa. Musa is older than Ngozi. Who is the oldest?',a:'Chika',w:['Musa','Ngozi','Cannot tell'],why:'Chika is above Musa, and Musa is above Ngozi.'},
 {lv:1,q:'How many minutes are in one hour?',a:'60',w:['30','100','24'],why:'One hour is 60 minutes.'},
 {lv:1,q:'How many months are in 3 years?',a:'36',w:['24','30','15'],why:'3 × 12 = 36.'},
 {lv:1,q:'A farmer plants 4 rows of 6 yam mounds. How many mounds are there?',a:'24',w:['10','20','28'],why:'4 × 6 = 24.'},
 {lv:1,q:'What is the smallest 3-digit number?',a:'100',w:['99','101','111'],why:'100 is the first number with three digits.'},
 {lv:1,q:'How many sides does a hexagon have?',a:'6',w:['5','8','7'],why:'Hex means six.'},
 {lv:1,q:'How many seconds are in 2 minutes?',a:'120',w:['60','200','100'],why:'2 × 60 = 120.'},
 {lv:2,q:'If 3 pens cost ₦450, how much do 5 pens cost?',a:'₦750',w:['₦600','₦900','₦700'],why:'One pen is ₦150. 5 × ₦150 = ₦750.'},
 {lv:2,q:'A car travels 60 km in 1 hour. How far does it go in 2 hours 30 minutes?',a:'150 km',w:['120 km','180 km','130 km'],why:'60 × 2.5 = 150.'},
 {lv:2,q:'Bisi is 4 years older than Tunde. Tunde is 12. How old will Bisi be in 3 years?',a:'19',w:['16','15','20'],why:'Bisi is 16 now, so she will be 19.'},
 {lv:2,q:'Which is larger: 3/4 or 2/3?',a:'3/4',w:['2/3','They are equal','Cannot tell'],why:'3/4 = 9/12 and 2/3 = 8/12.'},
 {lv:2,q:'A shopkeeper has 200 sachets of water and sells 3/4 of them. How many are left?',a:'50',w:['150','25','75'],why:'3/4 of 200 is 150. 200 − 150 = 50.'},
 {lv:2,q:'The sum of two consecutive numbers is 41. What is the larger number?',a:'21',w:['20','22','19'],why:'20 + 21 = 41.'},
 {lv:2,q:'You are in a race and overtake the runner in second place. What position are you in?',a:'Second',w:['First','Third','Cannot tell'],why:'You take the second place spot. The leader is still ahead.'},
 {lv:2,q:'It takes 4 workers 6 days to build a wall. How many days would 8 workers need at the same speed?',a:'3 days',w:['12 days','2 days','6 days'],why:'Double the workers, half the time.'},
 {lv:2,q:'Two numbers add up to 20 and differ by 4. What is the larger number?',a:'12',w:['10','14','8'],why:'12 + 8 = 20 and 12 − 8 = 4.'},
 {lv:2,q:'A train leaves at 6:40 am and the journey takes 5 hours 35 minutes. When does it arrive?',a:'12:15 pm',w:['11:55 am','12:35 pm','12:05 pm'],why:'6:40 + 5:35 = 12:15.'},
 {lv:2,q:'Femi runs 400 m four times. How many kilometres does he run in all?',a:'1.6 km',w:['1 km','16 km','4 km'],why:'4 × 400 m = 1,600 m = 1.6 km.'},
 {lv:2,q:'A bag of rice is shared equally among 4 families and each gets 12 kg. How heavy was the bag?',a:'48 kg',w:['16 kg','36 kg','52 kg'],why:'4 × 12 = 48.'},
 {lv:2,q:'A triangle has two angles of 50° and 60°. What is the third angle?',a:'70°',w:['80°','60°','90°'],why:'The angles add to 180°. 180 − 110 = 70.'},
 {lv:3,q:'A bag has 3 red and 2 blue balls. What is the fewest number you must take out, without looking, to be sure of two balls of the same colour?',a:'3',w:['2','4','5'],why:'With 3 balls and only two colours, two must match.'},
 {lv:3,q:'A phone costs ₦100,000. The price drops by 10%, then by another 10%. What is the final price?',a:'₦81,000',w:['₦80,000','₦90,000','₦79,000'],why:'₦100,000 → ₦90,000 → ₦81,000.'},
 {lv:3,q:'Fuel rises from ₦600 to ₦750 per litre. What is the percentage increase?',a:'25%',w:['20%','15%','150%'],why:'The rise is ₦150, and 150 ÷ 600 = 25%.'},
 {lv:3,q:'A man walks 3 km north then 4 km east. How far is he from where he started, in a straight line?',a:'5 km',w:['7 km','6 km','12 km'],why:'3, 4 and 5 make a right-angled triangle.'},
 {lv:3,q:'A father is 4 times as old as his son. In 20 years he will be twice as old as his son. How old is the son now?',a:'10',w:['5','15','20'],why:'Son 10, father 40. In 20 years: 30 and 60.'},
 {lv:3,q:'How many times can you subtract 5 from 25?',a:'Once',w:['5 times','4 times','Never'],why:'After the first time you are subtracting from 20, not 25.'}
);

/* ---------- more variety in the generators ---------- */
G.nextNum=()=>{const s=rnd(1,40);return mc('What number comes next?',s+3,near(s+3,[-1,1,2,-2,3]),{show:`${s}, ${s+1}, ${s+2}, ?`,why:'Each number is one more.'})};
G.skip=step=>{const s=step*rnd(0,12);return mc(`Count in ${step}s. What comes next?`,s+3*step,near(s+3*step,[-step,step,-1,1,2*step]),{show:`${s}, ${s+step}, ${s+2*step}, ?`,why:`Add ${step} each time.`})};
G.missing=step=>{const s=rnd(1,12)*step;return mc('Find the missing number',s+2*step,near(s+2*step,[-1,1,-step,step,2]),{show:`${s}, ${s+step}, ?, ${s+3*step}`,why:`Add ${step} each time.`})};
G.seqA=steps=>{const st=pick(steps),s=rnd(1,60),t=[0,1,2,3].map(k=>s+k*st),c=s+4*st;return mc('What number comes next?',c,near(c,[-1,1,-st,st,2,-2]),{show:t.join(', ')+', ?',why:`Add ${st} each time.`})};
G.bigger=m=>{let a=rnd(1,m),b=rnd(1,m);while(b===a)b=rnd(1,m);const hi=Math.max(a,b),lo=Math.min(a,b),q=Math.random()<.5;return mc(q?'Which number is bigger?':'Which number is smaller?',q?hi:lo,[q?lo:hi],{show:a+'  or  '+b,why:q?`${hi} is more than ${lo}.`:`${lo} is less than ${hi}.`})};
const ITEMS=['a bag of rice','a sack of garri','a carton of noodles','a bag of beans','a crate of eggs','a bag of cement','a generator','a sewing machine','a bundle of ankara','a bag of onions'];
const COSTS=[15000,24000,30000,36000,45000,50000,64000,72000,90000,120000];
G.profit=()=>{const cost=pick(COSTS),p=pick([5,10,15,20,25,30,40,50]),gain=cost*p/100,sell=cost+gain,it=pick(ITEMS);return mc(`A trader buys ${it} for ${fmt(cost)} and sells it at ${p}% profit. What is the selling price?`,fmt(sell),[gain,cost-gain,sell+5000,sell-5000].map(fmt),{why:`${p}% of ${fmt(cost)} is ${fmt(gain)}. Add it to the cost: ${fmt(sell)}.`})};
G.loss=()=>{const cost=pick(COSTS),p=pick([5,10,15,20,25,30,40]),lost=cost*p/100,sell=cost-lost,it=pick(ITEMS);return mc(`A trader buys ${it} for ${fmt(cost)} but sells it at a ${p}% loss. What is the selling price?`,fmt(sell),[lost,cost+lost,sell+5000,sell-5000].map(fmt),{why:`${p}% of ${fmt(cost)} is ${fmt(lost)}. Take it off: ${fmt(sell)}.`})};
G.discount=ps=>{const price=pick([3000,4000,5000,6500,8000,9000,12500,15000,18000,20000,25000,35000]),p=pick(ps||[10,20,25]),off=price*p/100,pay=price-off,it=pick(['a pair of shoes','a school bag','a shirt','a wristwatch','a bedsheet','a pair of sandals','a handbag','a standing fan']);return mc(`${it[0].toUpperCase()+it.slice(1)} costs ${fmt(price)}. The shop gives ${p}% off. How much do you pay?`,fmt(pay),[off,price+off,pay+500,pay-500].map(fmt),{why:`${p}% off is ${fmt(off)}, so you pay ${fmt(price)} − ${fmt(off)} = ${fmt(pay)}.`})};

/* proverbs the other way round: pick the proverb that matches a meaning (doubles the proverb questions) */
G.proverbRev=lv=>{const pool=lv===1?PROVERBS.filter(p=>p.e):PROVERBS,x=pick(pool),full=p=>'“'+p.t.replace('___',p.a)+'”',others=shuffle(PROVERBS.filter(p=>p!==x&&p.m!==x.m)).map(full);return mc('Which proverb has this meaning?',full(x),others,{show:x.m,why:'Proverb: '+full(x)})};
PROV_L[0].push(['proverbRev',1]);PROV_L[1].push(['proverbRev',2]);PROV_L[2].push(['proverbRev',3]);

/* ---------- endless logic and counting puzzles (names, numbers and days change every time) ---------- */
const NAMES=['Ada','Bola','Chidi','Dayo','Eze','Femi','Gift','Hauwa','Ife','Jide','Kemi','Lola','Musa','Ngozi','Obi','Peace','Qudus','Rita','Sade','Tunde','Uche','Vera','Wale','Yemi','Zainab','Amina','Emeka','Ibrahim','Funke','Tolu'];
const QUAL=[['taller','tallest','shortest'],['older','oldest','youngest'],['faster','fastest','slowest'],['heavier','heaviest','lightest']];
const ORD=['first','second','third','fourth'];
G.order=lv=>{
  const n=lv===1?3:4,names=shuffle(NAMES).slice(0,n),[cmp,top,bot]=pick(QUAL);
  const rel=names.slice(0,-1).map((x,i)=>`${x} is ${cmp} than ${names[i+1]}.`);
  const text=(lv>=3?shuffle(rel):rel).join(' ');
  if(lv===1){const ask=Math.random()<.5;return mc(`${text} Who is the ${ask?top:bot}?`,ask?names[0]:names[n-1],names.filter((_,i)=>i!==(ask?0:n-1)),{why:`The order from ${top} to ${bot} is ${names.join(', ')}.`})}
  const k=rnd(1,n-2);
  return mc(`${text} Who is ${ORD[k]} from the ${top} end?`,names[k],names.filter((_,i)=>i!==k),{why:`The order from ${top} to ${bot} is ${names.join(', ')}.`});
};
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
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

const cat=(b,id)=>CATS[b].find(c=>c.id===id);
cat('kids','skip').L[0].push(['back',1],['back',2],['skip',3]);
cat('kids','skip').L[1].push(['back',2],['back',5],['skip',3],['skip',4]);
cat('kids','skip').L[2].push(['back',10],['back',5],['skip',4],['skip',6],['skip',7]);
for(const b of ['teens','adults']){const L=cat(b,'riddles').L;L[0].push(['order',1],['day']);L[1].push(['order',2],['age'],['share'],['day']);L[2].push(['order',3],['age'],['ratio']);}
{const L=cat('elders','riddles').L;L[0].push(['logic',1,1],['order',1],['day']);L[1].push(['logic',1,2],['order',2],['age'],['share']);L[2].push(['order',3],['age'],['ratio'],['share']);}
