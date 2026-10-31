import React,{useLayoutEffect} from 'react';
import * as tree from '../lifeweave/features/life/LifeEditWorkspace.css';
import * as styles from './gradeControls.css';
import {masteryLevel} from './masteryLevels';

export function GradeControls({node,score,locked,canUndo,canRedo,onAdjust,onUndo,onRedo,lastChange}){
 const level=masteryLevel(score);
 useLayoutEffect(()=>{
  const shortcuts=event=>{
   if(!(event.ctrlKey||event.metaKey)||event.target instanceof Element&&event.target.closest('input,textarea,[contenteditable="true"]'))return;
   const key=event.key.toLowerCase();if(key!=='z'&&key!=='y')return;
   event.preventDefault();event.stopPropagation();if(event.repeat||locked)return;
   if(key==='y'||event.shiftKey){if(canRedo)onRedo(node.id)}else if(canUndo)onUndo(node.id);
  };
  window.addEventListener('keydown',shortcuts,true);return()=>window.removeEventListener('keydown',shortcuts,true);
 },[node.id,locked,canUndo,canRedo,onUndo,onRedo]);
 const change=lastChange?.leafId===node.id?lastChange:undefined;
 const feedback=change?.kind==='undo'?'Đã hoàn tác':change?.kind==='redo'?'Đã làm lại':'';
 const hint=`${level.label}. ${canUndo?'Ctrl+Z hoàn tác. ':''}${canRedo?'Ctrl+Shift+Z hoặc Ctrl+Y làm lại. ':''}Mỗi lần bấm thay đổi 1 điểm.`;
 const down=event=>{if(event.key!=='Escape')event.stopPropagation();if(event.repeat)event.preventDefault()};
 return <div className={styles.controls} role="group" aria-label={`Điều chỉnh ${node.syllabusItemId}`} data-grade-controls="" data-can-undo={canUndo} data-can-redo={canRedo} onPointerDown={event=>event.stopPropagation()} onClick={event=>event.stopPropagation()} onDoubleClick={event=>event.stopPropagation()} onKeyDown={event=>{if(event.key!=='Escape')event.stopPropagation()}}>
  <button type="button" className={`${tree.nodeAction} ${styles.step}`} disabled={locked} aria-disabled={locked||score===0} aria-label={`Giảm điểm ${node.syllabusItemId}`} title={score===0?'Đã ở mức thấp nhất: 0':'Giảm đúng 1 điểm'} onKeyDown={down} onClick={()=>{if(!locked&&score!==0)onAdjust(node.id,-1)}}><span className={tree.nodeActionIcon} aria-hidden="true">−</span></button>
  <output className={styles.value} data-band={level.key} data-unassessed={score===null} title={hint} aria-label={`${node.syllabusItemId}: ${score===null?'Chưa đánh giá':`${score} trên 100. ${level.label}`}${feedback?`. ${feedback}`:''}`} aria-live="polite" aria-atomic="true">
   {score===null?<span className={styles.unassessed}>Chưa chấm</span>:<><strong>{score}</strong><span className={styles.denominator}> / 100</span></>}
   <span className={styles.track} aria-hidden="true"><i style={{width:`${score??0}%`}}/></span>
  </output>
  <button type="button" className={`${tree.nodeAction} ${styles.step}`} disabled={locked} aria-disabled={locked||score===100} aria-label={`Tăng điểm ${node.syllabusItemId}`} title={score===100?'Đã ở mức cao nhất: 100':'Tăng đúng 1 điểm'} onKeyDown={down} onClick={()=>{if(!locked&&score!==100)onAdjust(node.id,1)}}><span className={tree.nodeActionIcon} aria-hidden="true">+</span></button>
 </div>;
}
