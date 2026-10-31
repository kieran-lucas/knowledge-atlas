import {nodes} from '../curriculum';
export const foldText=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLocaleLowerCase('vi');
export function searchNodes(query,limit=8){
 const q=foldText(query.trim());if(!q)return [];
 const terms=q.split(/\s+/);
 return nodes.map(node=>{const code=foldText(node.syllabusItemId??''),title=foldText(node.title),text=`${code} ${title}`;
  if(!terms.every(term=>text.includes(term)))return null;
  return {node,rank:code===q?0:code.startsWith(q)?1:title.startsWith(q)?2:title.includes(q)?3:4};
 }).filter(Boolean).sort((a,b)=>a.rank-b.rank||a.node.sort_key-b.node.sort_key).slice(0,limit).map(result=>result.node);
}
