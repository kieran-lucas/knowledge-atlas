import {useState} from 'react';
import {loadScores,saveScores,validateData,exportScores,STORAGE_KEY} from '../persistence';
import {adjusted} from '../scoring';
const load=()=>{try{return {scores:loadScores(),error:''}}catch{return {scores:{},error:'Không thể đọc dữ liệu đã lưu. Nhập một bản sao hợp lệ để tiếp tục; dữ liệu gốc vẫn được giữ nguyên.'}}};
export function useProgress(){
 const [initial]=useState(load);const [scores,setScores]=useState(initial.scores);const [locked,setLocked]=useState(Boolean(initial.error));const [message,setMessage]=useState(initial.error);
 function adjust(id,delta){if(locked)return;const next={...scores,[id]:{score:adjusted(scores[id]?.score??null,delta),assessed:true,updatedAt:new Date().toISOString()}};try{saveScores(next);setMessage('')}catch{setMessage('Không thể tự lưu; hãy xuất JSON để giữ tiến độ.')}setScores(next)}
 function download(){const raw=locked?localStorage.getItem(STORAGE_KEY):exportScores(scores);const url=URL.createObjectURL(new Blob([raw??''],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='knowledge-atlas.json';a.click();URL.revokeObjectURL(url)}
 async function importFile(file){if(!file)return;try{const next=validateData(JSON.parse(await file.text()));const old=localStorage.getItem(STORAGE_KEY);if(old)localStorage.setItem(`knowledge-atlas.backup.${Date.now()}`,old);saveScores(next);setScores(next);setLocked(false);setMessage('Đã nhập tiến độ; bản dữ liệu trước được giữ trong trình duyệt.')}catch(e){setMessage(`Không nhập được: ${e.message}`)}}
 return {scores,adjust,download,importFile,message,locked};
}
