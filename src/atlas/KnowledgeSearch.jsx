import React,{useLayoutEffect,useMemo,useRef,useState} from 'react';
import {searchNodes} from './search';

export function KnowledgeSearch({onPick,onClose}){
 const [query,setQuery]=useState(''),[active,setActive]=useState(0);
 const shell=useRef(null),input=useRef(null);
 const results=useMemo(()=>searchNodes(query),[query]);
 useLayoutEffect(()=>{input.current?.focus();const outside=event=>{if(!shell.current?.contains(event.target))onClose(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[onClose]);
 const pick=node=>onPick(node.id);
 const keyDown=event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();return}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setActive(old=>results.length?(old+(event.key==='ArrowDown'?1:-1)+results.length)%results.length:0)}
  else if(event.key==='Enter'&&results[active]){event.preventDefault();pick(results[active])}
 };
 return <div ref={shell} className="search" role="search" aria-label="Tìm trong cây">
  <div className="search-field"><input ref={input} role="combobox" aria-label="Tìm kiến thức" aria-expanded={results.length>0} aria-controls="atlas-search-results" aria-autocomplete="list" aria-activedescendant={results[active]?`search-${results[active].id}`:undefined} placeholder="Tìm tên hoặc mã, ví dụ VI.2" value={query} onChange={event=>{setQuery(event.target.value);setActive(0)}} onKeyDown={keyDown}/><kbd>Esc</kbd></div>
  {query&&<div className="results" id="atlas-search-results" role="listbox">{results.length?results.map((node,index)=><button key={node.id} id={`search-${node.id}`} role="option" aria-selected={active===index} onPointerMove={()=>setActive(index)} onMouseDown={event=>event.preventDefault()} onClick={()=>pick(node)}><span className="search-code">{node.syllabusItemId??'Nhánh'}</span><span>{node.title}</span>{node.syllabusItemId?.startsWith('GH.')&&<small>Bổ sung</small>}</button>):<span className="search-empty">Không tìm thấy kiến thức phù hợp.</span>}</div>}
  <div className="search-help">Tìm được cả tiếng Việt không dấu <span>↑ ↓ · Enter</span></div>
 </div>;
}
