/* The leaderboard, behind one small interface so the screens never talk to a database directly.

     saveScore(nick, total)  send a player's total (best points per round, added up)
     getTopScores()          {status, rows:[{player_name, score, user_id}], me:{score, rank}}
     subscribe(fn)           call fn whenever the board or the send status changes
     refresh(nick, force)    reload the board
     nameTaken(name)         true / false / null (unknown) for a name used by another player

   Today it uses the shared Supabase board (src/services/leaderboardOnline.js) when public/config.js has a
   Project URL and publishable key, and a board of the nicknames on this device when it does not. To use a
   different online database later, write another adapter with the same functions and switch to it here. */
import {NET} from './leaderboardOnline.js';
import {allProfiles,totalsOf} from './progress.js';
import {LEADERBOARD_SIZE} from '../config/gameConfig.js';

export const online=NET.configured;
/* scores from the nicknames on this device (used when there is no online board, and shown when it is down) */
export function localTop(limit=LEADERBOARD_SIZE){
  const all=allProfiles();
  return Object.keys(all).map(n=>({player_name:n,score:totalsOf(all[n]).total,user_id:'local:'+n}))
    .filter(e=>e.score>0).sort((a,b)=>b.score-a.score||a.player_name.localeCompare(b.player_name)).slice(0,limit);
}
const listeners=new Set();let version=0;
const notify=()=>{version++;listeners.forEach(f=>f())};
NET.on(notify);
export const subscribe=fn=>{listeners.add(fn);return ()=>listeners.delete(fn)};
export const getVersion=()=>version;   /* changes whenever the board or the send status changes (for React) */
export function getTopScores(){
  if(!online)return {status:'ok',local:true,rows:localTop(),me:null};
  return NET.board;
}
export const sendState=()=>NET.syncState;      /* '', 'saving', 'saved', 'failed', 'offline' */
export const myId=()=>NET.uid;
export const isMe=(e,nick)=>!!nick&&e.player_name===nick&&(online?(!!NET.uid&&e.user_id===NET.uid):true);
export const refresh=(nick,force)=>online?NET.refresh(nick,force):(notify(),Promise.resolve());
export const nameTaken=name=>online?NET.nameTaken(name):Promise.resolve(Object.keys(allProfiles()).some(n=>n.toLowerCase()===String(name).toLowerCase())?null:false);
/* start: getPending() tells the board what this device may still have to send (sent on the next visit or when
   back online). saveScore(nick, total) is called after each finished round; it signs in anonymously only then. */
let latest=null;
export const start=getPending=>NET.init(()=>latest||getPending());
export function saveScore(nick,total){latest={nick,total};return NET.sync()}
