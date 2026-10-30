// Extracted from LifeWeave LifeEditWorkspace.tsx. See scripts/sync-lifeweave.py and docs/lifeweave-renderer.diff.
import {useEffect,useMemo,useRef,useState,type ReactNode,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent,type WheelEvent as ReactWheelEvent} from "react";
import type {LifeEditNodeView} from "../../ipc/generated/LifeEditNodeView";
import * as styles from "./LifeEditWorkspace.css";
import * as atlas from "../../../atlas/atlasTree.css";
import {TagChipList} from "../tag/TagChipList";
import {buildLifeTreeLayout,type LayoutPoint} from "./lifeTreeLayout";
import {Icon,iconDetails,iconLife,iconNote} from "../../design-system/visual/icons";
import {lifeIconGlyph} from "./lifeIconCatalog";
import {directionConfidenceOptions} from "./lifeDirectionConfidence";
type Point=LayoutPoint;
export const buildLifeEditLayout=(nodes:LifeEditNodeView[])=>buildLifeTreeLayout(nodes);

export function Positioner({node,point,selected,menuOpen,onSelect,onOpen,onAdd,onEdit,state,inlineControls,expanded}:{node:LifeEditNodeView;point:Point;selected:boolean;menuOpen:boolean;onSelect:()=>void;onOpen:()=>void;onAdd?:()=>void;onEdit?:()=>void;state?:ReactNode;inlineControls?:ReactNode;expanded?:boolean}){
 const positionRef=useRef<HTMLDivElement|null>(null);
 const glyph=lifeIconGlyph(node.icon_key);
 const confidence=directionConfidenceOptions.find(option=>option.value===node.direction_confidence)??directionConfidenceOptions[0];
 useEffect(()=>{const el=positionRef.current;if(el){el.style.setProperty("--life-x",`${point.x}px`);el.style.setProperty("--life-y",`${point.y}px`);el.style.setProperty("--life-node-width",`${point.width}px`);}},[point]);
 return <div ref={positionRef} className={styles.positioner} data-menu-open={menuOpen?"true":"false"} role="treeitem" aria-level={node.depth+1} aria-expanded={node.child_count?expanded:undefined}>
   <div className={styles.nodeShell}>
    <button className={styles.nodeCard} type="button" draggable={false} onClick={onSelect} onDoubleClick={(event)=>{event.preventDefault();onOpen();}} onKeyDown={(event)=>{if(event.key!=="Enter")return;event.preventDefault();onOpen();}} aria-keyshortcuts="Enter" aria-pressed={selected} aria-expanded={menuOpen} aria-controls={menuOpen?`life-node-actions-${node.id}`:undefined} data-life-edit-id={node.id}>
      <span className={styles.nodeIcon} aria-hidden="true">{glyph??<Icon d={node.is_leaf?iconNote:iconLife} size={15}/>}</span><span className={styles.nodeContent}><span className={styles.compactTitle}>{node.title}</span><span className={styles.nodeMetaRow} style={inlineControls?{visibility:"hidden"}:undefined}>{state??<><span className={styles.confidenceBadge} data-level={confidence.value}><span className={styles.confidenceMark} aria-hidden="true">{directionConfidenceOptions.map((_,index)=><i className={styles.confidencePip} key={index} data-active={index<=directionConfidenceOptions.indexOf(confidence)?"true":"false"}/>)}</span>{confidence.label}</span></>}</span><TagChipList tags={node.tags} /></span>
    </button>
    {inlineControls&&<div className={atlas.inlineControls} data-life-node-actions="">{inlineControls}</div>}
    {menuOpen&&!inlineControls&&onAdd&&<div id={`life-node-actions-${node.id}`} className={styles.nodeActions} data-life-node-actions="" data-placement="below-card" data-action-count={node.has_document?"1":"2"} role="group" aria-label={`Actions for ${node.title}`}>{!node.has_document&&<button type="button" className={styles.nodeAction} onClick={onAdd}><span className={styles.nodeActionIcon} aria-hidden="true">+</span><span>Add child</span></button>}<button type="button" className={styles.nodeAction} onClick={onEdit}><span className={styles.nodeActionIcon} aria-hidden="true"><Icon d={iconDetails} size={13}/></span><span>Edit node</span></button></div>}
   </div>
  </div>;
}

export type FocusRequest={id:string;sequence:number};
type Props={initialNodeId:string;nodes:LifeEditNodeView[];onOpenNode:(id:string,isLeaf:boolean)=>void;renderState?:(node:LifeEditNodeView)=>ReactNode;renderLeafControls?:(node:LifeEditNodeView)=>ReactNode;focusRequest?:FocusRequest;expandedIds?:Set<string>;immersive?:boolean};
export function LifeEditWorkspace({initialNodeId,nodes,onOpenNode,renderState,renderLeafControls,focusRequest,expandedIds,immersive=false}:Props){
 const [selectedId,setSelectedId]=useState<string>();const [menuNodeId,setMenuNodeId]=useState<string>();const [zoom,setZoom]=useState(1);
 const canvasRef=useRef<HTMLDivElement|null>(null);const viewportRef=useRef<HTMLDivElement|null>(null);const initialPositioned=useRef(false);const panSession=useRef<{pointerId:number;x:number;y:number;left:number;top:number}|null>(null);
 const projection=useMemo(()=>({nodes}),[nodes]);const selected=projection.nodes.find(node=>node.id===selectedId);const layout=useMemo(()=>buildLifeEditLayout(projection.nodes),[projection.nodes]);
  useEffect(()=>{const el=canvasRef.current;if(el){el.style.width=`${layout.width}px`;el.style.height=`${layout.height}px`;el.style.zoom=String(zoom);}},[layout,zoom]);
 useEffect(()=>{if(initialPositioned.current)return;const viewport=viewportRef.current;const point=layout.points.get(initialNodeId);if(!viewport||!point)return;viewport.scrollLeft=Math.max(0,point.x*zoom-24);viewport.scrollTop=Math.max(0,point.y*zoom-(viewport.clientHeight-point.height*zoom)/2);initialPositioned.current=true;},[initialNodeId,layout,zoom]);
 useEffect(()=>{if(!menuNodeId)return;const closeOnOutside=(event:PointerEvent)=>{const target=event.target;if(target instanceof Element&&(target.closest("[data-life-node-actions]")||target.closest("[data-life-edit-id]")))return;setMenuNodeId(undefined);setSelectedId(undefined);};const closeOnEscape=(event:KeyboardEvent)=>{if(event.key!=="Escape")return;event.preventDefault();const id=menuNodeId;setMenuNodeId(undefined);setSelectedId(undefined);requestAnimationFrame(()=>document.querySelector<HTMLElement>(`[data-life-edit-id="${id}"]`)?.focus({preventScroll:true}));};document.addEventListener("pointerdown",closeOnOutside);document.addEventListener("keydown",closeOnEscape);return()=>{document.removeEventListener("pointerdown",closeOnOutside);document.removeEventListener("keydown",closeOnEscape);};},[menuNodeId]);
 const lastFocus=useRef<FocusRequest|undefined>(undefined);
 useEffect(()=>{if(!focusRequest||lastFocus.current===focusRequest)return;const point=layout.points.get(focusRequest.id);const viewport=viewportRef.current;if(!point||!viewport)return;lastFocus.current=focusRequest;setSelectedId(focusRequest.id);setMenuNodeId(focusRequest.id);setZoom(1);requestAnimationFrame(()=>{viewport.scrollLeft=Math.max(0,point.x-(viewport.clientWidth-point.width)/2);viewport.scrollTop=Math.max(0,point.y-(viewport.clientHeight-point.height)/2);document.querySelector<HTMLElement>(`[data-life-edit-id="${focusRequest.id}"]`)?.focus({preventScroll:true});});},[focusRequest,layout]);
 const startPan=(event:ReactPointerEvent<HTMLDivElement>)=>{const target=event.target;if(event.button!==0||!(target instanceof Element)||target.closest("button,input,textarea,select,a"))return;const viewport=event.currentTarget;panSession.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.dataset.panning="true";viewport.setPointerCapture?.(event.pointerId);event.preventDefault();};
 const movePan=(event:ReactPointerEvent<HTMLDivElement>)=>{const session=panSession.current;if(!session||session.pointerId!==event.pointerId)return;const viewport=event.currentTarget;viewport.scrollLeft=session.left-(event.clientX-session.x);viewport.scrollTop=session.top-(event.clientY-session.y);event.preventDefault();};
 const stopPan=(event:ReactPointerEvent<HTMLDivElement>)=>{const session=panSession.current;if(!session||session.pointerId!==event.pointerId)return;const viewport=event.currentTarget;panSession.current=null;viewport.dataset.panning="false";if(viewport.hasPointerCapture?.(event.pointerId))viewport.releasePointerCapture(event.pointerId);};
 const scrollTree=(event:ReactWheelEvent<HTMLDivElement>)=>{if(event.ctrlKey)return;const viewport=event.currentTarget;const unit=event.deltaMode===1?16:event.deltaMode===2?Math.max(1,viewport.clientHeight):1;const damp=(delta:number)=>Math.sign(delta)*Math.min(42,Math.abs(delta*unit)*.38);const horizontal=event.shiftKey&&event.deltaX===0?event.deltaY:event.deltaX;const vertical=event.shiftKey&&event.deltaX===0?0:event.deltaY;if(horizontal===0&&vertical===0)return;viewport.scrollLeft+=damp(horizontal);viewport.scrollTop+=damp(vertical);event.preventDefault();};
 const panWithKeyboard=(event:ReactKeyboardEvent<HTMLDivElement>)=>{const viewport=event.currentTarget;const step=event.shiftKey?180:80;if(event.key==="ArrowLeft")viewport.scrollLeft-=step;else if(event.key==="ArrowRight")viewport.scrollLeft+=step;else if(event.key==="ArrowUp")viewport.scrollTop-=step;else if(event.key==="ArrowDown")viewport.scrollTop+=step;else if(event.key==="Home"){viewport.scrollLeft=0;viewport.scrollTop=0;}else return;event.preventDefault();};
 const changeZoom=(next:number)=>{const viewport=viewportRef.current;const value=Math.max(.5,Math.min(1.5,Math.round(next*10)/10));if(!viewport||value===zoom)return;const centerX=(viewport.scrollLeft+viewport.clientWidth/2)/zoom;const centerY=(viewport.scrollTop+viewport.clientHeight/2)/zoom;setZoom(value);requestAnimationFrame(()=>{viewport.scrollLeft=centerX*value-viewport.clientWidth/2;viewport.scrollTop=centerY*value-viewport.clientHeight/2;});};
 const centerRoot=()=>{const viewport=viewportRef.current;const root=projection?.nodes.find(node=>node.parent_id===null);const point=root&&layout.points.get(root.id);if(!viewport||!point)return;viewport.scrollLeft=Math.max(0,(point.x+point.width/2)*zoom-viewport.clientWidth/2);viewport.scrollTop=Math.max(0,(point.y+point.height/2)*zoom-viewport.clientHeight/2);};
 useEffect(()=>{if(!immersive)return;const viewport=viewportRef.current;if(!viewport)return;
 const fit=()=>changeZoom(Math.min(1,Math.max(.5,Math.min(viewport.clientWidth/layout.width,viewport.clientHeight/layout.height))));
 const shortcuts=(event:KeyboardEvent)=>{if(!(event.ctrlKey||event.metaKey)||event.target instanceof HTMLInputElement)return;if(event.key==='+'||event.key==='='){event.preventDefault();changeZoom(zoom+.1)}else if(event.key==='-'){event.preventDefault();changeZoom(zoom-.1)}else if(event.key==='0'){event.preventDefault();fit()}};
 const wheel=(event:WheelEvent)=>{if(!event.ctrlKey)return;event.preventDefault();changeZoom(zoom+(event.deltaY<0?.1:-.1))};
 window.addEventListener('keydown',shortcuts,true);viewport.addEventListener('wheel',wheel,{passive:false});return()=>{window.removeEventListener('keydown',shortcuts,true);viewport.removeEventListener('wheel',wheel)};
 },[immersive,zoom,layout]);
 return <>
  <span id="life-edit-instructions" className={styles.srOnly}>Click hoặc Space để chọn. Double-click hoặc Enter để mở hoặc thu nhánh. Chọn lá để chấm điểm ngay trên node.</span><span id="life-pan-instructions" className={styles.srOnly}>Use the mouse wheel or trackpad to scroll the tree at a controlled speed. Shift plus the mouse wheel scrolls horizontally. You can also hold and drag empty tree space, use the arrow keys to pan, or press Home to return to the origin.</span>
  <div className={`${styles.workspace} ${immersive?atlas.edgeToEdgeWorkspace:""}`} data-editor-open="false">
   <div ref={viewportRef} className={`${styles.canvasViewport} ${immersive?atlas.edgeToEdgeViewport:""}`} aria-label="Cây kiến thức SPhO" aria-describedby="life-pan-instructions" aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home" tabIndex={0} data-life-pan-surface="" data-panning="false" onWheel={scrollTree} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={stopPan} onPointerCancel={stopPan} onLostPointerCapture={stopPan} onKeyDown={panWithKeyboard}>
    <div ref={canvasRef} className={styles.canvas} role="tree" aria-label="Cây kiến thức SPhO" aria-describedby="life-edit-instructions">
     <svg className={styles.links} width={layout.width} height={layout.height} aria-hidden="true">{layout.links.map(link=><path key={link.id} d={link.d}/>)}</svg>
     {projection.nodes.map(node=><Positioner key={node.id} node={node} point={layout.points.get(node.id)??{x:0,y:0,width:196,height:64}} selected={node.id===selected?.id} menuOpen={node.id===menuNodeId} expanded={expandedIds?.has(node.id)} state={renderState?.(node)} inlineControls={node.is_leaf&&node.id===menuNodeId?renderLeafControls?.(node):undefined} onSelect={()=>{if(selectedId===node.id){setSelectedId(undefined);setMenuNodeId(undefined);return;}setSelectedId(node.id);setMenuNodeId(node.id);}} onOpen={()=>onOpenNode(node.id,node.is_leaf)}/>) }

    </div>
   </div>
    {!immersive&&<div className={styles.zoomControls} role="group" aria-label="Điều khiển cây">
     <button type="button" title="Zoom out" aria-label="Zoom out" disabled={zoom<=.5} onClick={()=>changeZoom(zoom-.1)}>−</button>
     <span aria-live="polite">{Math.round(zoom*100)}%</span>
     <button type="button" title="Zoom in" aria-label="Zoom in" disabled={zoom>=1.5} onClick={()=>changeZoom(zoom+.1)}>+</button>
     <button type="button" title="Fit tree in view" onClick={()=>changeZoom(Math.min(1,Math.max(.5,Math.min((viewportRef.current?.clientWidth??1)/layout.width,(viewportRef.current?.clientHeight??1)/layout.height))))}>Fit</button>
     <button type="button" title="Center root" onClick={centerRoot}>Center</button>
    </div>}
   {!immersive&&<p className={styles.status} role="status">{nodes.length} nodes · Double-click / Enter để mở nhánh · Kéo nền để di chuyển</p>}
  </div>
 </>;
}
