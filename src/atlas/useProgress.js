import {useCallback,useEffect,useRef,useState} from 'react';
import {loadScores,saveScores,validateData,exportScores,STORAGE_KEY} from '../persistence';
import {createGradeState,adjustGrade,undoGrade,redoGrade,canUndoGrade,canRedoGrade} from './gradeState';
const load=()=>{try{return {scores:loadScores(),error:''}}catch{return {scores:{},error:'Không thể đọc dữ liệu đã lưu. Nhập một bản sao hợp lệ để tiếp tục; dữ liệu gốc vẫn được giữ nguyên.'}}};
export function useProgress(){
 const [initial]=useState(load);
 const [model,setModel]=useState(()=>createGradeState(initial.scores));
 const current=useRef(model);
 const [locked,setLocked]=useState(Boolean(initial.error)),[message,setMessage]=useState(initial.error);
 // A synchronous ref serializes rapid commands before React's next render.
 const commit=useCallback(next=>{
  if(next===current.current)return false;
  try{saveScores(next.scores);setMessage('')}catch{setMessage('Không thể tự lưu; hãy xuất JSON để giữ tiến độ.')}
  current.current=next;setModel(next);return true;
 },[]);
 const adjust=useCallback((id,delta)=>!locked&&commit(adjustGrade(current.current,id,delta,new Date().toISOString())),[locked,commit]);
 const undo=useCallback(id=>!locked&&commit(undoGrade(current.current,id)),[locked,commit]);
 const redo=useCallback(id=>!locked&&commit(redoGrade(current.current,id)),[locked,commit]);
 const download=useCallback(()=>{
  const raw=locked?localStorage.getItem(STORAGE_KEY):exportScores(current.current.scores);
  const url=URL.createObjectURL(new Blob([raw??''],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='knowledge-atlas.json';anchor.click();URL.revokeObjectURL(url);
 },[locked]);
 const importFile=useCallback(async file=>{
  if(!file)return;
  try{
   const scores=validateData(JSON.parse(await file.text()));const old=localStorage.getItem(STORAGE_KEY);
   if(old)localStorage.setItem(`knowledge-atlas.backup.${Date.now()}`,old);
   saveScores(scores);const next=createGradeState(scores);current.current=next;setModel(next);setLocked(false);setMessage('Đã nhập tiến độ; bản dữ liệu trước được giữ trong trình duyệt.');
  }catch(error){setMessage(`Không nhập được: ${error.message}`)}
 },[]);
 useEffect(()=>{if(!message.startsWith('Đã nhập'))return;const timer=setTimeout(()=>setMessage(''),3500);return()=>clearTimeout(timer)},[message]);
 return {scores:model.scores,adjust,undo,redo,download,importFile,message,locked,lastChange:model.lastChange,revision:model.revision,canUndo:id=>canUndoGrade(model,id),canRedo:id=>canRedoGrade(model,id)};
}
