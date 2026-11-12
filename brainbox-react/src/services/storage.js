/* Safe browser storage. Every read and write is wrapped in try/catch, so the game still works in private
   browsing or when storage is blocked (values then live in memory until the page closes).
   The key names are the same as the old game, so players keep their progress after the update. */
const memory=new Map();
export const store={
  get(k){try{const v=localStorage.getItem(k);return v==null&&memory.has(k)?memory.get(k):v}catch(e){return memory.has(k)?memory.get(k):null}},
  set(k,v){v=String(v);memory.set(k,v);try{localStorage.setItem(k,v)}catch(e){}},
  remove(k){memory.delete(k);try{localStorage.removeItem(k)}catch(e){}},
  /* parsed JSON, or `fallback` if missing, broken or the wrong shape */
  json(k,fallback){try{const v=JSON.parse(this.get(k)||'null');return v&&typeof v==='object'&&Array.isArray(v)===Array.isArray(fallback)?v:fallback}catch(e){return fallback}},
  setJson(k,v){this.set(k,JSON.stringify(v))}
};
/* every key the game uses, in one place */
export const KEYS={
  profiles:'bn-profiles-v2',   /* progress per nickname: {nick: {band_type_level_round: {s: stars, p: best points, t: best time ms}}} */
  nick:'bn-nick',              /* the nickname last used on this device */
  daily:'bn-daily-v1',         /* daily challenge per nickname */
  skill:'bn-skill-v1',         /* recent round results for adaptive difficulty */
  seenOld:'bn-seen-v1',        /* "already seen" questions, old format (per device) */
  seen:'bn-seen-v2',           /* "already seen" questions per nickname */
  season:'bn-season',          /* '2' once old-scoring points were cleared */
  sound:'bn-sound',vibe:'bn-vibe',
  sent:'bn-sent-v1',           /* leaderboard totals already sent */
  localBoard:'bn-board-local-v1'
};
