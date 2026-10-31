import {byId} from '../curriculum';
export type LeafMastery={score:number;assessed:true;updatedAt:string};
export type Scores=Record<string,LeafMastery>;
type Change={before:LeafMastery|undefined;after:LeafMastery|undefined};
type History={past:Change[];future:Change[]};
export type GradeState={scores:Scores;history:Record<string,History>;revision:number;lastChange?:{leafId:string;kind:'adjust'|'undo'|'redo';from:number|null;to:number|null}};
const EMPTY:History={past:[],future:[]};
export const HISTORY_LIMIT=100;
function leafOnly(id:string){if(byId.get(id)?.nodeType!=='leaf')throw new Error('Chỉ có thể chấm điểm node lá hợp lệ.');}
export function createGradeState(scores:Scores={}):GradeState{return {scores:{...scores},history:{},revision:0};}
function withEntry(scores:Scores,id:string,entry:LeafMastery|undefined):Scores{
 const result={...scores};if(entry)result[id]=entry;else delete result[id];return result;
}
export function adjustGrade(state:GradeState,id:string,delta:number,updatedAt:string):GradeState{
 leafOnly(id);if(delta!==1&&delta!==-1)throw new RangeError('Mỗi thao tác chỉ thay đổi đúng một điểm.');
 const before=state.scores[id],score=Math.max(0,Math.min(100,(before?.score??0)+delta));
 if(before?.score===score)return state;
 const after:LeafMastery={score,assessed:true,updatedAt};const history=state.history[id]??EMPTY;
 return {scores:withEntry(state.scores,id,after),history:{...state.history,[id]:{past:[...history.past,{before,after}].slice(-HISTORY_LIMIT),future:[]}},revision:state.revision+1,lastChange:{leafId:id,kind:'adjust',from:before?.score??null,to:score}};
}
export function undoGrade(state:GradeState,id:string):GradeState{
 leafOnly(id);const history=state.history[id]??EMPTY,change=history.past.at(-1);if(!change)return state;
 return {scores:withEntry(state.scores,id,change.before),history:{...state.history,[id]:{past:history.past.slice(0,-1),future:[...history.future,change]}},revision:state.revision+1,lastChange:{leafId:id,kind:'undo',from:change.after?.score??null,to:change.before?.score??null}};
}
export function redoGrade(state:GradeState,id:string):GradeState{
 leafOnly(id);const history=state.history[id]??EMPTY,change=history.future.at(-1);if(!change)return state;
 return {scores:withEntry(state.scores,id,change.after),history:{...state.history,[id]:{past:[...history.past,change],future:history.future.slice(0,-1)}},revision:state.revision+1,lastChange:{leafId:id,kind:'redo',from:change.before?.score??null,to:change.after?.score??null}};
}
export const canUndoGrade=(state:GradeState,id:string)=>Boolean(state.history[id]?.past.length);
export const canRedoGrade=(state:GradeState,id:string)=>Boolean(state.history[id]?.future.length);
