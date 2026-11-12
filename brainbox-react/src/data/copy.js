/* Words the game shows: shout-outs after a round, tips per puzzle type, level descriptions.
   Copied from the old game. Keep the tone friendly and encouraging. */
export const SHOUTS=["You are brilliant!","Great!","Awesome!","Fantastic!","Well done, ninja!","Superb!","Brilliant!","Outstanding!","Ninja skills!","Excellent!"];  /* after a passed round */
export const PERFECT=["Flawless!","Perfect round!","You are a legend!","Total genius!"];  /* 10 out of 10 */
export const TRY=["Good try!","So close!","Keep going, ninja!","Nearly there!"];  /* round not passed */
export const CLEARED=["Level cleared!","Champion!","Master of this level!"];  /* all 10 rounds of a level passed */
/* "Pointer" tip on the results screen, per puzzle type */
export const TIPS={
 "count": "Touch each fruit once as you count so you do not count it twice.",
 "sums": "Count on from the bigger number. For 7 + 2, start at 7 and count 8, 9.",
 "patterns": "Say the pattern out loud, then say what comes next.",
 "odd": "Name each item. The one that does not fit the group is your answer.",
 "skip": "Say the whole count out loud: 5, 10, 15 and keep the beat going.",
 "maths": "Break big numbers into tens and ones. For 38 + 27, add 30 + 20, then 8 + 7.",
 "seq": "Look at the gaps between the numbers. If the gaps grow, the rule is changing.",
 "words": "Look for familiar endings and beginnings, then try the first letter.",
 "proverbs": "Think about the lesson first. The missing word usually carries it.",
 "riddles": "Read the riddle twice. The answer often hides in plain words.",
 "money": "Work in steps: the total first, then the change. For a percentage, find 10% first and build from it.",
 "memory": "Group the items into pairs or picture a market stall. Linking them helps you recall.",
 "numbers": "Take it slowly. For change, count up from the price to the amount paid.",
 "mix": "Answer in the first half of the timer to earn the biggest speed bonus."
};
export const LEVEL_NOTE=["Easier questions · 1× points","Tougher questions · 1.5× points","Hardest questions · 2× points"];
