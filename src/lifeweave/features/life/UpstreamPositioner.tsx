// Extracted from LifeWeave LifeEditWorkspace.tsx. See scripts/sync-lifeweave.py and docs/lifeweave-renderer.diff.
import {useEffect,useMemo,useRef,useState,type ReactNode,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent,type WheelEvent as ReactWheelEvent} from "react";
import type {LifeEditNodeView} from "../../ipc/generated/LifeEditNodeView";
import * as styles from "./LifeEditWorkspace.css";

import {TagChipList} from "../tag/TagChipList";
import {buildLifeTreeLayout,type LayoutPoint} from "./lifeTreeLayout";
import {Icon,iconDetails,iconLife,iconNote} from "../../design-system/visual/icons";
import {lifeIconGlyph} from "./lifeIconCatalog";
import {directionConfidenceOptions} from "./lifeDirectionConfidence";
type Point=LayoutPoint;
export const buildLifeEditLayout=(nodes:LifeEditNodeView[])=>buildLifeTreeLayout(nodes);
export function UpstreamPositioner({node,point,selected,menuOpen,onSelect,onOpen,onAdd,onEdit}:{node:LifeEditNodeView;point:Point;selected:boolean;menuOpen:boolean;onSelect:()=>void;onOpen:()=>void;onAdd:()=>void;onEdit:()=>void}){
 const positionRef=useRef<HTMLDivElement|null>(null);
 const glyph=lifeIconGlyph(node.icon_key);
 const confidence=directionConfidenceOptions.find(option=>option.value===node.direction_confidence)??directionConfidenceOptions[0];
 useEffect(()=>{const el=positionRef.current;if(el){el.style.setProperty("--life-x",`${point.x}px`);el.style.setProperty("--life-y",`${point.y}px`);el.style.setProperty("--life-node-width",`${point.width}px`);}},[point]);
 return <div ref={positionRef} className={styles.positioner} data-menu-open={menuOpen?"true":"false"} role="treeitem" aria-level={node.depth+1} aria-expanded={node.child_count?true:undefined}>
   <div className={styles.nodeShell}>
    <button className={styles.nodeCard} type="button" draggable={false} onClick={onSelect} onDoubleClick={(event)=>{event.preventDefault();onOpen();}} onKeyDown={(event)=>{if(event.key!=="Enter")return;event.preventDefault();onOpen();}} aria-keyshortcuts="Enter" aria-pressed={selected} aria-expanded={menuOpen} aria-controls={menuOpen?`life-node-actions-${node.id}`:undefined} data-life-edit-id={node.id}>
      <span className={styles.nodeIcon} aria-hidden="true">{glyph??<Icon d={node.is_leaf?iconNote:iconLife} size={15}/>}</span><span className={styles.nodeContent}><span className={styles.compactTitle}>{node.title}</span><span className={styles.nodeMetaRow}><span className={styles.confidenceBadge} data-level={confidence.value}><span className={styles.confidenceMark} aria-hidden="true">{directionConfidenceOptions.map((_,index)=><i className={styles.confidencePip} key={index} data-active={index<=directionConfidenceOptions.indexOf(confidence)?"true":"false"}/>)}</span>{confidence.label}</span></span><TagChipList tags={node.tags} /></span>
    </button>
    {menuOpen&&<div id={`life-node-actions-${node.id}`} className={styles.nodeActions} data-life-node-actions="" data-placement="below-card" data-action-count={node.has_document?"1":"2"} role="group" aria-label={`Actions for ${node.title}`}>{!node.has_document&&<button type="button" className={styles.nodeAction} onClick={onAdd}><span className={styles.nodeActionIcon} aria-hidden="true">+</span><span>Add child</span></button>}<button type="button" className={styles.nodeAction} onClick={onEdit}><span className={styles.nodeActionIcon} aria-hidden="true"><Icon d={iconDetails} size={13}/></span><span>Edit node</span></button></div>}
   </div>
  </div>;
}
