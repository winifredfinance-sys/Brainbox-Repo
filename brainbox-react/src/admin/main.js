/* Admin dashboard (admin.html): the same dashboard as before (admin-dashboard.js, unchanged), which expects a
   few names from the game as globals. They are provided here from the game's data and config. */
import '../styles.css';
import './admin.css';
import {BANDS,LEVELS,DAILY_TARGET} from '../config/gameConfig.js';
import {typesFor,typeOf} from '../engine/questions.js';
import {pick} from '../engine/helpers.js';
import {store} from '../services/storage.js';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
Object.assign(window,{BANDS,LEVELS,DAILY:DAILY_TARGET,catsFor:typesFor,catOf:typeOf,esc,pick,ls:{get:k=>store.get(k),set:(k,v)=>store.set(k,v)}});
await import('./admin-dashboard.js');
