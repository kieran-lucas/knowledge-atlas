import React,{useLayoutEffect,useMemo,useRef,useState} from 'react';
import {nodes,byId} from './curriculum';
import {nodeScore} from './scoring';
import {LifeEditWorkspace} from './lifeweave/features/life/LifeEditWorkspace';
import * as tree from './lifeweave/features/life/LifeEditWorkspace.css';
import * as atlas from './atlas/atlasTree.css';
import {lifeProjection,openPath} from './atlas/projection';
import {useProgress} from './atlas/useProgress';

const quality=v=>v===null?'Chưa đánh giá':v<40?'Rất yếu':v<60?'Yếu':v<80?'Đang phát triển':'Vững';
const confidence=v=>v===null?'exploring':v<60?'leaning':v<80?'committed':'core';
export default function App(){
 const progress=useProgress();const [expanded,setExpanded]=useState(()=>new Set(['spho']));const [focusRequest,setFocusRequest]=useState();const [query,setQuery]=useState('');const [searchOpen,setSearchOpen]=useState(false);const file=useRef(null);
 const projection=useMemo(()=>lifeProjection(expanded),[expanded]);
 const results=useMemo(()=>{const q=query.trim().toLocaleLowerCase('vi');return q?nodes.filter(n=>`${n.syllabusItemId??''} ${n.title}`.toLocaleLowerCase('vi').includes(q)).sort((a,b)=>Number(b.syllabusItemId?.toLowerCase()===q)-Number(a.syllabusItemId?.toLowerCase()===q)).slice(0,8):[]},[query]);
 const focus=id=>{setExpanded(old=>openPath(id,old));setFocusRequest({id,sequence:Date.now()});setQuery('');setSearchOpen(false)};
 const open=(id,isLeaf)=>{if(isLeaf)return;setExpanded(old=>{const next=new Set(old);if(next.has(id)&&id!=='spho')next.delete(id);else next.add(id);return next})};
 useLayoutEffect(()=>{
  const shortcuts=event=>{
   if(event.key==='Escape'){setSearchOpen(false);setQuery('');return}
   if(!event.ctrlKey&&!event.metaKey)return;
   if(event.key.toLowerCase()==='f'){event.preventDefault();setSearchOpen(true)}
   else if(event.key.toLowerCase()==='s'){event.preventDefault();progress.download()}
   else if(event.key.toLowerCase()==='o'){event.preventDefault();file.current?.click()}
   else if(event.key==='Home'){event.preventDefault();setExpanded(new Set(['spho']));setFocusRequest({id:'spho',sequence:Date.now()})}
  };
  window.addEventListener('keydown',shortcuts,true);return()=>window.removeEventListener('keydown',shortcuts,true);
 },[progress.download]);
 const renderState=node=>{const stats=nodeScore(byId.get(node.id),progress.scores),v=stats.mastery;const official=stats.officialStats;const detail=`${quality(v)}${!node.is_leaf?` · Đã chấm ${stats.assessedLeaves}/${stats.totalLeaves} (${Math.round(stats.coverage*100)}%)`:''}${official&&official.totalLeaves!==stats.totalLeaves?` · Chính thức ${official.assessedLeaves}/${official.totalLeaves}`:''}${node.id.startsWith('geo.')?' · Nội dung bổ sung':''}`;
 return <span className={tree.confidenceBadge} data-level={confidence(v)} title={detail} aria-label={`${v===null?'Chưa đánh giá':`${Math.round(v)}/100`} · ${detail}`}><span className={tree.confidenceMark} aria-hidden="true">{[0,1,2,3].map(i=><i key={i} className={tree.confidencePip} data-active={v!==null&&i<Math.max(1,Math.ceil(v/25))?'true':'false'}/>)}</span>{v===null?'Chưa chấm':`${Math.round(v)}/100`}{!node.is_leaf&&` · ${stats.assessedLeaves}/${stats.totalLeaves}`}{node.id.startsWith('geo.')&&' · BS'}</span>};
 const renderLeafControls=node=><div className="score-controls" role="group" aria-label={`Điều chỉnh ${node.syllabusItemId}`} onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key!=='Escape')e.stopPropagation()}}><button type="button" className={`${tree.nodeAction} ${atlas.scoreButton}`} disabled={progress.locked} aria-label={`Giảm điểm ${node.syllabusItemId}`} onClick={()=>progress.adjust(node.id,-1)}><span className={tree.nodeActionIcon}>−</span></button><span className={atlas.scoreValue}>{progress.scores[node.id]?.score??'—'} / 100</span><button type="button" className={`${tree.nodeAction} ${atlas.scoreButton}`} disabled={progress.locked} aria-label={`Tăng điểm ${node.syllabusItemId}`} onClick={()=>progress.adjust(node.id,1)}><span className={tree.nodeActionIcon}>+</span></button></div>;
 return <main className="atlas-app" aria-label="Knowledge Atlas">
 <LifeEditWorkspace initialNodeId="spho" nodes={projection} expandedIds={expanded} onOpenNode={open} renderState={renderState} renderLeafControls={renderLeafControls} focusRequest={focusRequest} immersive/>
 {searchOpen&&<div className="search" role="search"><input autoFocus aria-label="Tìm kiến thức" placeholder="Tìm tên hoặc mã, ví dụ VI.2" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&results[0]){e.preventDefault();focus(results[0].id)}}}/>{query&&<div className="results">{results.length?results.map(n=><button key={n.id} onClick={()=>focus(n.id)}><b>{n.syllabusItemId??'Nhánh'}</b> {n.title}</button>):<span>Không tìm thấy.</span>}</div>}</div>}
 <input ref={file} hidden type="file" accept="application/json,.json" onChange={e=>{void progress.importFile(e.target.files?.[0]);e.target.value=''}}/>
 {progress.message&&<p className="atlas-notice" role="status">{progress.message}</p>}
 </main>
}
