/* Daily challenge and streak (Lagos days). Pure functions: the saved data is passed in and returned. */
import {DAILY_TARGET} from '../config/gameConfig.js';
export const lagosDay=(t=Date.now())=>new Date(t+3600e3).toISOString().slice(0,10);   /* Lagos is UTC+1 all year */
export const dayBefore=d=>new Date(Date.parse(d+'T12:00:00Z')-864e5).toISOString().slice(0,10);
/* d = this nickname's saved daily data; band = band in play (or null on the home screen) */
export function dailyState(d,band){
  d=d||{};const today=lagosDay(),b=band||d.band||null,isToday=d.day===today;
  const streak=(d.last===today||d.last===dayBefore(today))?(+d.streak||0):0;
  return {pts:isToday?+d.pts||0:0,hit:isToday&&!!d.hit,streak,band:b,target:b?DAILY_TARGET[b]:null,keepUp:streak>0&&d.last!==today};
}
/* add a finished round's points; returns {data, justHit} */
export function addDaily(d,pts,band){
  const today=lagosDay();d={...(d||{})};
  if(d.day!==today){d.day=today;d.pts=0;d.hit=false}
  d.pts=(+d.pts||0)+Math.max(0,pts|0);d.band=band;
  let justHit=false;
  if(!d.hit&&d.pts>=DAILY_TARGET[band]){d.hit=true;justHit=true;d.streak=(d.last===dayBefore(today)?(+d.streak||0):0)+1;d.last=today}
  return {data:d,justHit};
}
