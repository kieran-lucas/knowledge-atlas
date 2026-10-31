import React,{useCallback,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {byId} from './curriculum';
import {nodeScore} from './scoring';
import {LifeEditWorkspace} from './lifeweave/features/life/LifeEditWorkspace';
import * as tree from './lifeweave/features/life/LifeEditWorkspace.css';
import {GradeControls} from './atlas/GradeControls';
import {masteryLevel} from './atlas/masteryLevels';
import * as grade from './atlas/gradeControls.css';
import {lifeProjection,openPath} from './atlas/projection';
import {useProgress} from './atlas/useProgress';
import {KnowledgeSearch} from './atlas/KnowledgeSearch';

export default function App(){
 const progress=useProgress();
 const [expanded,setExpanded]=useState(()=>new Set(['spho']));
 const [focusRequest,setFocusRequest]=useState();
 const [searchOpen,setSearchOpen]=useState(false);
 const file=useRef(null),sequence=useRef(0),searchReturnFocus=useRef(null);
 const projection=useMemo(()=>lifeProjection(expanded),[expanded]);

 const focus=useCallback(id=>{
  setExpanded(old=>openPath(id,old));
  setFocusRequest({id,sequence:++sequence.current});
  setSearchOpen(false);
 },[]);
 const closeSearch=useCallback((restoreFocus=true)=>{
  setSearchOpen(false);
  if(restoreFocus)requestAnimationFrame(()=>{const target=searchReturnFocus.current;if(target?.isConnected)target.focus({preventScroll:true})});
 },[]);
 const open=(id,isLeaf)=>{
  if(isLeaf)return;
  setExpanded(old=>{const next=new Set(old);if(next.has(id)&&id!=='spho')next.delete(id);else next.add(id);return next});
  setFocusRequest({id,scope:'branch',sequence:++sequence.current});
 };
 useLayoutEffect(()=>{
  const shortcuts=event=>{
   if(!event.ctrlKey&&!event.metaKey)return;
   if(event.key.toLowerCase()==='f'){
    event.preventDefault();
    if(!searchOpen)searchReturnFocus.current=document.activeElement;
    setSearchOpen(true);
   }else if(event.key.toLowerCase()==='s'){event.preventDefault();progress.download()}
   else if(event.key.toLowerCase()==='o'){event.preventDefault();file.current?.click()}
   else if(event.key==='Home'){
    event.preventDefault();setSearchOpen(false);setExpanded(new Set(['spho']));
    setFocusRequest({id:'spho',scope:'all',select:false,sequence:++sequence.current});
   }
  };
  window.addEventListener('keydown',shortcuts,true);
  return()=>window.removeEventListener('keydown',shortcuts,true);
 },[progress.download,searchOpen]);

 const renderState=node=>{
  const stats=nodeScore(byId.get(node.id),progress.scores),value=stats.mastery,official=stats.officialStats,level=masteryLevel(value);
  const detail=`${level.label}${!node.is_leaf?` · Đã chấm ${stats.assessedLeaves}/${stats.totalLeaves} (${Math.round(stats.coverage*100)}%)`:''}${official&&official.totalLeaves!==stats.totalLeaves?` · Chính thức ${official.assessedLeaves}/${official.totalLeaves}`:''}${node.id.startsWith('geo.')?' · Nội dung bổ sung':''}`;
  return <span className={`${tree.confidenceBadge} ${grade.badge}`} data-level={level.confidence} data-band={level.key} title={detail} aria-label={`${value===null?'Chưa đánh giá':`${Math.round(value)}/100`} · ${detail}`}>
   <span className={tree.confidenceMark} aria-hidden="true">{[0,1,2,3].map(index=><i key={index} className={tree.confidencePip} data-active={value!==null&&index<Math.max(1,Math.ceil(value/25))?'true':'false'}/>)}</span>
   {value===null?'Chưa chấm':`${Math.round(value)}/100`}{!node.is_leaf&&` · ${stats.assessedLeaves}/${stats.totalLeaves}`}{node.id.startsWith('geo.')&&' · BS'}
  </span>;
 };
 const renderLeafControls=node=><GradeControls key={node.id} node={node} score={progress.scores[node.id]?.score??null} locked={progress.locked} canUndo={progress.canUndo(node.id)} canRedo={progress.canRedo(node.id)} onAdjust={progress.adjust} onUndo={progress.undo} onRedo={progress.redo} lastChange={progress.lastChange}/>;
 return <main className="atlas-app" aria-label="Knowledge Atlas">
  <LifeEditWorkspace initialNodeId="spho" nodes={projection} expandedIds={expanded} onOpenNode={open} renderState={renderState} renderLeafControls={renderLeafControls} focusRequest={focusRequest} immersive/>
  {searchOpen&&<KnowledgeSearch onPick={focus} onClose={closeSearch}/>}
  <input ref={file} hidden type="file" accept="application/json,.json" onChange={event=>{void progress.importFile(event.target.files?.[0]);event.target.value=''}}/>
  {progress.message&&<p className="atlas-notice" role="status">{progress.message}</p>}
 </main>;
}
