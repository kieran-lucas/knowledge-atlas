import {byId,childrenOf} from '../curriculum';
// Physics is projected into the existing LifeEditNodeView contract; the Tree owns its UI state.
export function lifeProjection(expanded){
 const shown=node=>{let p=byId.get(node.parent_id);while(p){if(!expanded.has(p.id))return false;p=byId.get(p.parent_id)}return true};
 return [...byId.values()].filter(shown).map(node=>{
  let depth=0,p=byId.get(node.parent_id);while(p){depth++;p=byId.get(p.parent_id)}
  return {...node,title:node.syllabusItemId?`${node.syllabusItemId} · ${node.title}`:node.title,short_description:node.originalTitle??node.title,icon_key:node.nodeType==='leaf'?'life-leaf':'life-branch',theme_variant:'neutral',direction_confidence:'exploring',depth,child_count:childrenOf(node.id).length,is_leaf:node.nodeType==='leaf',has_document:false,is_pinned:false,revision:0,tags:[]};
 });
}
export function openPath(id,expanded){const next=new Set(expanded);let n=byId.get(id);while(n?.parent_id){next.add(n.parent_id);n=byId.get(n.parent_id)}return next}
