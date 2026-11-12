/* =====================================================================================================
   Brainbox Ninja game rules. Change the numbers here; no screen code needs to change.
   After editing, rebuild (npm run build) and upload the new "dist" folder. See README.md.
   ===================================================================================================== */

/* Age bands. Players pick one; they never type an age. cls makes text bigger: 'kid' (4-10), 'big' (60+). */
export const BANDS=[
  {id:'kids',  name:'Little Minds',    range:'4–10',  blurb:'Fruit, patterns and easy sums.',              cls:'kid'},
  {id:'teens', name:'Sharp Teens',     range:'11–17', blurb:'Maths, words, proverbs and logic.',           cls:''},
  {id:'adults',name:'Adult Brain Gym', range:'18–59', blurb:'Naira sums, memory, riddles and more.',       cls:''},
  {id:'elders',name:'Golden Minds',    range:'60+',   blurb:'Memory, proverbs, riddles and gentle sums.',  cls:'big'}
];

/* Levels, rounds and questions */
export const LEVELS=['Beginner','Medium','Hard'];
export const ROUNDS_PER_LEVEL=10;          /* rounds in each level */
export const QUESTIONS_PER_ROUND=10;       /* questions in each round */
export const PASS_MARK=6;                  /* right answers needed to pass a round (out of QUESTIONS_PER_ROUND) */
export const STARS=[0.6,0.8,0.9];          /* share right for 1, 2 and 3 stars */
export const LEVELS_OPEN_FROM_START=true;  /* true: players choose any level. false: pass all rounds of a level first */

/* Seconds per question for each band: [Beginner, Medium, Hard] */
export const TIMER_SECONDS={
  kids:  [30,30,30],
  teens: [20,25,30],
  adults:[25,30,40],
  elders:[40,45,50]
};

/* Points for a right answer: SPEED.max if answered at once, falling evenly to SPEED.min at the buzzer,
   then times the level multiplier. Rounded per answer. */
export const SPEED={max:20,min:5};
export const LEVEL_MULTIPLIER=[1,1.5,2];   /* Beginner, Medium, Hard */
export const TICK_LAST_SECONDS=5;          /* quiet tick sound in the last seconds of a question */

/* Daily challenge: points to score each day (Lagos time) for each band */
export const DAILY_TARGET={kids:150,teens:300,adults:300,elders:200};

/* Difficulty ramp inside a level (rounds are counted from 0): rounds before easyUntil use the easier half of
   the level's question types, rounds before mixUntil use all, later rounds take hardShare from the harder half */
export const RAMP={easyUntil:3,mixUntil:7,hardShare:0.7};

/* Adaptive difficulty (src/engine/adaptive.js): average of the last `window` rounds of a puzzle type */
export const ADAPTIVE={enabled:true,window:3,stepUpAt:0.9,stepDownAt:0.5,swapQuestions:3,keepHistory:5};

/* No repeats: how many "already seen" question ids to keep per player and level pool for question types
   that are generated (maths etc.). Fixed lists (proverbs, riddles, logic) always remember every question. */
export const SEEN_KEEP_GENERATED=400;

/* Session timeout: after this long away (tab hidden, phone locked), the round in progress is dropped and the
   player is welcomed back. Their nickname and progress are always kept. */
export const SESSION_TIMEOUT_MS=30*60*1000;

/* Leaderboard */
export const LEADERBOARD_SIZE=50;          /* players shown on the leaderboard screen */
export const HOME_PREVIEW_SIZE=3;          /* players shown on the home screen */
export const NICKNAME_MAX=20;

/* Highest total anyone can reach, used to spot impossible scores:
   26 puzzle types x ROUNDS_PER_LEVEL x (200 + 300 + 400) = 234,000 */
export const roundMaxPoints=level=>Math.round(SPEED.max*LEVEL_MULTIPLIER[level])*QUESTIONS_PER_ROUND;
