import {descendants, leaves} from './curriculum';
export const sections=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
export function aggregate(items,scores) {
 const values=items.map(n=>scores[n.id]?.score).filter(v=>typeof v==='number').sort((a,b)=>a-b);
 const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
 return {mastery:values.length ? .7*mean(values)+.3*mean(values.slice(0,Math.max(1,Math.ceil(values.length*.25)))) : null, coverage:items.length?values.length/items.length:0, assessedLeaves:values.length,totalLeaves:items.length};
}
export function nodeScore(node,scores) {
 const items=descendants(node.id);
 if(node.nodeType==='root' || node.nodeType==='domain') {
  const official=items.filter(n=>n.isOfficial); const stats=aggregate(items,scores); const officialStats=aggregate(official,scores);
  if(node.nodeType==='root') {
   const values=sections.map(s=>aggregate(official.filter(n=>n.officialSectionId===s),scores).mastery).filter(v=>v!==null);
   return {...stats,officialStats,mastery:values.length?values.reduce((a,b)=>a+b,0)/values.length:null};
  }
  return {...stats,officialStats,mastery:officialStats.mastery};
 }
 return aggregate(items,scores);
}
export function adjusted(value,delta){return Math.max(0,Math.min(100,(value??0)+delta));}
