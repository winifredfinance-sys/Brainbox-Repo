/* Puzzle types for each age band. levels[0] = Beginner, [1] = Medium, [2] = Hard.
   Each level lists the question makers it draws from, as [maker, ...settings]; repeat an entry to make it more
   common. Makers are in src/engine/generators.js (e.g. ['riddle',1,2] = riddles of difficulty 1 to 2).
   "Mix It Up" is added automatically from every type in the band.
   Generated from the old game by scripts/extract-from-v2.mjs, then edited by hand from here on. */
export const PUZZLES={
  kids:[
    {id:'count',name:"Count & Compare",glyph:"1 2 3",blurb:"Count fruit and find the bigger number.",
     levels:[
       [["count",5],["bigger",10]],
       [["count",10],["bigger",20]],
       [["count",15],["bigger",100]]]},
    {id:'sums',name:"Add & Take Away",glyph:"+  −",blurb:"Easy sums with fruit and numbers.",
     levels:[
       [["addE",5]],
       [["add",10],["sub",10],["addE",10]],
       [["add",20],["sub",20]]]},
    {id:'patterns',name:"Patterns",glyph:"▲●▲",blurb:"What comes next in the pattern?",
     levels:[
       [["pattern","AB"]],
       [["pattern","AB"],["pattern","AAB"],["pattern","ABB"]],
       [["pattern","AAB"],["pattern","ABC"],["pattern","AABB"]]]},
    {id:'odd',name:"Odd One Out",glyph:"≠",blurb:"Spot the one that does not belong.",
     levels:[
       [["oddOne",1]],
       [["oddOne",2]],
       [["oddOne",3]]]},
    {id:'skip',name:"Skip Counting",glyph:"2 4 6",blurb:"Count in twos, fives and tens.",
     levels:[
       [["nextNum"],["skip",2],["back",1],["back",2],["skip",3]],
       [["skip",5],["missing",2],["skip",2],["back",2],["back",5],["skip",3],["skip",4]],
       [["skip",10],["missing",3],["skip",5],["missing",5],["back",10],["back",5],["skip",4],["skip",6],["skip",7]]]}
  ],
  teens:[
    {id:'maths',name:"Maths",glyph:"×  ÷",blurb:"Times tables, percentages and algebra.",
     levels:[
       [["mult",2,9],["bigAdd",10,60],["percent",[10,50]]],
       [["mult",6,12],["bigAdd",40,99],["percent",[10,20,25,50]],["bigSub",50,200]],
       [["algebra"],["percent",[15,30,35,60]],["mult",11,19],["bigSub",100,900]]]},
    {id:'seq',name:"Number Sequences",glyph:"3 6 9",blurb:"Find the rule and the next number.",
     levels:[
       [["seqA",[2,3,5,10]]],
       [["seqA",[6,7,8,9,11,12]],["seqGrow"]],
       [["seqGeo"],["seqFib"],["seqSq"],["seqGrow"]]]},
    {id:'words',name:"Word Games",glyph:"Abc",blurb:"Unscramble Nigerian words and fill the gap.",
     levels:[
       [["scramble",3,6],["missingLetter",3,6]],
       [["scramble",5,9],["missingLetter",5,9]],
       [["scramble",7,12],["missingLetter",7,12]]]},
    {id:'proverbs',name:"Proverbs",glyph:"“ ”",blurb:"Finish the proverb and learn what it means.",
     levels:[
       [["proverb",1],["proverbRev",1]],
       [["proverb",2],["proverbRev",2]],
       [["proverb",3],["proverbRev",3]]]},
    {id:'riddles',name:"Riddles & Logic",glyph:"?",blurb:"Think carefully before you answer.",
     levels:[
       [["riddle",1,1],["logic",1,1],["order",1],["day"],["order",1],["day"]],
       [["riddle",1,2],["logic",1,2],["order",2],["age"],["share"],["day"],["order",2],["age"],["share"],["day"]],
       [["riddle",3,3],["logic",2,3],["order",3],["age"],["ratio"],["order",3],["age"],["ratio"]]]}
  ],
  adults:[
    {id:'money',name:"Naira Maths",glyph:"₦",blurb:"Market totals, VAT, interest, profit and loss.",
     levels:[
       [["nBasket",2],["nChange"],["nUnit"],["discount",[10,20,25]]],
       [["nBasket",3],["nVat"],["nInterest"],["nSplit"],["nPct"],["profit"],["loss"],["discount",[15,30,35]]],
       [["nProfitPct"],["nReverse"],["nSuccessive"],["nCompound"],["nInstal"],["nBreakEven"]]]},
    {id:'maths',name:"Mental Maths",glyph:"×  ÷",blurb:"Quick sums, percentages and algebra.",
     levels:[
       [["mult",6,12],["bigAdd",50,200],["bigSub",100,500],["percent",[10,20,50]]],
       [["mult",11,25],["percent",[15,25,35,60]],["algebra"],["bigSub",200,900]],
       [["algebra"],["mult",13,29],["percent",[12,18,35,45]],["avg"]]]},
    {id:'seq',name:"Number Sequences",glyph:"3 6 9",blurb:"Spot the rule behind the numbers.",
     levels:[
       [["seqA",[3,4,6,7,8]]],
       [["seqGrow"],["seqA",[9,11,12,13]],["seqGeo"]],
       [["seqFib"],["seqSq"],["seqGeo"],["seqGrow"]]]},
    {id:'words',name:"Word Games",glyph:"Abc",blurb:"Nigerian cities, foods and landmarks.",
     levels:[
       [["scramble",3,6],["missingLetter",3,6]],
       [["scramble",5,9],["missingLetter",5,9]],
       [["scramble",7,12],["missingLetter",7,12]]]},
    {id:'proverbs',name:"Proverbs",glyph:"“ ”",blurb:"Finish the proverb and explain its meaning.",
     levels:[
       [["proverb",1],["proverbRev",1]],
       [["proverb",2],["proverbRev",2]],
       [["proverb",3],["proverbRev",3]]]},
    {id:'riddles',name:"Riddles & Logic",glyph:"?",blurb:"Brain teasers that reward patience.",
     levels:[
       [["riddle",1,1],["logic",1,1],["order",1],["day"],["order",1],["day"]],
       [["riddle",1,2],["logic",1,2],["order",2],["age"],["share"],["day"],["order",2],["age"],["share"],["day"]],
       [["riddle",3,3],["logic",2,3],["order",3],["age"],["ratio"],["order",3],["age"],["ratio"]]]},
    {id:'memory',name:"Memory",glyph:"▢▢▢",blurb:"Remember a shopping list, then recall it.",
     levels:[
       [["memory",4]],
       [["memory",6]],
       [["memory",8]]]}
  ],
  elders:[
    {id:'memory',name:"Memory",glyph:"▢▢▢",blurb:"Remember a shopping list, then recall it.",
     levels:[
       [["memory",3]],
       [["memory",4]],
       [["memory",5]]]},
    {id:'proverbs',name:"Proverbs",glyph:"“ ”",blurb:"Finish the proverb and share its meaning.",
     levels:[
       [["proverb",1],["proverbRev",1]],
       [["proverb",2],["proverbRev",2]],
       [["proverb",3],["proverbRev",3]]]},
    {id:'riddles',name:"Riddles",glyph:"?",blurb:"Old favourites and new brain teasers.",
     levels:[
       [["riddle",1,1],["logic",1,1],["order",1],["day"]],
       [["riddle",1,2],["logic",1,2],["order",2],["age"],["share"]],
       [["riddle",2,3],["logic",1,2],["order",3],["age"],["ratio"],["share"]]]},
    {id:'words',name:"Word Games",glyph:"Abc",blurb:"Nigerian cities and foods.",
     levels:[
       [["scramble",3,5],["missingLetter",3,5]],
       [["scramble",4,7],["missingLetter",4,7]],
       [["scramble",6,10],["missingLetter",6,10]]]},
    {id:'numbers',name:"Number Puzzles",glyph:"+  ₦",blurb:"Gentle sums, sequences and market change.",
     levels:[
       [["seqA",[2,5,10]],["change",500],["bigAdd",10,40]],
       [["seqA",[3,4,6]],["change",1000],["discount",[10]],["bigSub",30,100]],
       [["seqGrow"],["discount",[10,20,25]],["change",2000],["percent",[10,50]]]]}
  ]
};
