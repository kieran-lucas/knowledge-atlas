from pathlib import Path
import shutil, hashlib, json, subprocess, difflib
source=Path(r'D:\Programming\Github\Main\lifeweave-desktop')
target=Path.cwd()
files=[
 'features/life/lifeTreeLayout.ts','features/life/LifeEditWorkspace.css.ts','features/life/LifeScreen.css.ts',
 'design-system/global.css','design-system/visual/typography.css.ts','design-system/visual/globalType.css.ts',
 'features/life/lifeIconCatalog.ts','features/life/lifeDirectionConfidence.ts',
 'features/tag/TagChipList.tsx','features/tag/TagChipList.css.ts',
 'design-system/primitives/utilities.css.ts',
 'design-system/visual/contract.css.ts','design-system/visual/lightTheme.css.ts',
 'design-system/visual/theme.css.ts','design-system/visual/motion.css.ts',
 'design-system/visual/icons.tsx',
 'ipc/generated/LifeEditNodeView.ts','ipc/generated/TagSummaryView.ts'
]
manifest=[]
for name in files:
 src=source/'frontend/src'/name;dst=target/'src/lifeweave'/name
 dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
 manifest.append({'source':'frontend/src/'+name,'target':'src/lifeweave/'+name,'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'mode':'byte-for-byte'})
original=source/'frontend/src/features/life/LifeEditWorkspace.tsx'
snapshot=target/'vendor/lifeweave/LifeEditWorkspace.tsx';snapshot.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(original,snapshot)
s=original.read_text(encoding='utf-8')
# Preserve the original Positioner DOM, event handlers and every visual class.
positioner=s[s.index('function Positioner('):s.index('\nexport function LifeEditWorkspace(')]
positioner=positioner.replace('function Positioner(', 'export function Positioner(')
positioner=positioner.replace('onAdd,onEdit}', 'onAdd,onEdit,state,inlineControls,expanded}')
positioner=positioner.replace('onEdit:()=>void}', 'onEdit:()=>void;state?:ReactNode;inlineControls?:ReactNode;expanded?:boolean}')
positioner=positioner.replace('aria-expanded={node.child_count?true:undefined}', 'aria-expanded={node.child_count?expanded:undefined}')
positioner=positioner.replace('<span className={styles.nodeMetaRow}>', '<span className={styles.nodeMetaRow} style={inlineControls?{visibility:"hidden"}:undefined}>{state??<>')
positioner=positioner.replace('{confidence.label}</span></span>', '{confidence.label}</span></>}</span>')
# Fixed curriculum replaces Life structure-edit actions; original actions remain available in the reference harness.
positioner=positioner.replace('    {menuOpen&&<div', '    {inlineControls&&<div className={atlas.inlineControls} data-life-node-actions="">{inlineControls}</div>}\n    {menuOpen&&!inlineControls&&onAdd&&<div')
positioner=positioner.replace('onAdd:()=>void;onEdit:()=>void;', 'onAdd?:()=>void;onEdit?:()=>void;')
header='''// Extracted from LifeWeave LifeEditWorkspace.tsx. See scripts/sync-lifeweave.py and docs/lifeweave-renderer.diff.
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
'''
# Copy navigation handlers verbatim rather than implementing a second camera.
nav=s[s.index(' const startPan='):s.index(' if(query.isLoading)')]
out=header+'\n'+positioner+'\n'+'''export type FocusRequest={id:string;sequence:number};
type Props={initialNodeId:string;nodes:LifeEditNodeView[];onOpenNode:(id:string,isLeaf:boolean)=>void;renderState?:(node:LifeEditNodeView)=>ReactNode;renderLeafControls?:(node:LifeEditNodeView)=>ReactNode;focusRequest?:FocusRequest;expandedIds?:Set<string>;immersive?:boolean};
export function LifeEditWorkspace({initialNodeId,nodes,onOpenNode,renderState,renderLeafControls,focusRequest,expandedIds,immersive=false}:Props){
 const [selectedId,setSelectedId]=useState<string>();const [menuNodeId,setMenuNodeId]=useState<string>();const [zoom,setZoom]=useState(1);
 const canvasRef=useRef<HTMLDivElement|null>(null);const viewportRef=useRef<HTMLDivElement|null>(null);const initialPositioned=useRef(false);const panSession=useRef<{pointerId:number;x:number;y:number;left:number;top:number}|null>(null);
 const projection=useMemo(()=>({nodes}),[nodes]);const selected=projection.nodes.find(node=>node.id===selectedId);const layout=useMemo(()=>buildLifeEditLayout(projection.nodes),[projection.nodes]);
'''
# Original canvas sizing, initial camera, and outside/Escape selection effects.
for marker in ['  useEffect(()=>{const el=canvasRef.current;', ' useEffect(()=>{if(initialPositioned.current)', ' useEffect(()=>{if(!menuNodeId)return;']:
 out+=next(line for line in s.splitlines(True) if line.startswith(marker))
out+=''' const lastFocus=useRef<FocusRequest|undefined>(undefined);
 useEffect(()=>{if(!focusRequest||lastFocus.current===focusRequest)return;const point=layout.points.get(focusRequest.id);const viewport=viewportRef.current;if(!point||!viewport)return;lastFocus.current=focusRequest;setSelectedId(focusRequest.id);setMenuNodeId(focusRequest.id);setZoom(1);requestAnimationFrame(()=>{viewport.scrollLeft=Math.max(0,point.x-(viewport.clientWidth-point.width)/2);viewport.scrollTop=Math.max(0,point.y-(viewport.clientHeight-point.height)/2);document.querySelector<HTMLElement>(`[data-life-edit-id="${focusRequest.id}"]`)?.focus({preventScroll:true});});},[focusRequest,layout]);
'''
out+=nav
out+=''' useEffect(()=>{if(!immersive)return;const viewport=viewportRef.current;if(!viewport)return;
 const fit=()=>changeZoom(Math.min(1,Math.max(.5,Math.min(viewport.clientWidth/layout.width,viewport.clientHeight/layout.height))));
 const shortcuts=(event:KeyboardEvent)=>{if(!(event.ctrlKey||event.metaKey)||event.target instanceof HTMLInputElement)return;if(event.key==='+'||event.key==='='){event.preventDefault();changeZoom(zoom+.1)}else if(event.key==='-'){event.preventDefault();changeZoom(zoom-.1)}else if(event.key==='0'){event.preventDefault();fit()}};
 const wheel=(event:WheelEvent)=>{if(!event.ctrlKey)return;event.preventDefault();changeZoom(zoom+(event.deltaY<0?.1:-.1))};
 window.addEventListener('keydown',shortcuts,true);viewport.addEventListener('wheel',wheel,{passive:false});return()=>{window.removeEventListener('keydown',shortcuts,true);viewport.removeEventListener('wheel',wheel)};
 },[immersive,zoom,layout]);
'''
# Keep the upstream viewport, SVG links, node mapping, zoom toolbar and status layout.
jsx=s[s.index(' return <>\n  <span id="life-edit-instructions"'):s.index('   {selected&&editorOpen&&<aside')]
jsx=jsx.replace('className={styles.workspace}', 'className={`${styles.workspace} ${immersive?atlas.edgeToEdgeWorkspace:""}`}').replace('className={styles.canvasViewport}', 'className={`${styles.canvasViewport} ${immersive?atlas.edgeToEdgeViewport:""}`}')
jsx=jsx.replace('data-editor-open={editorOpen?"true":"false"}', 'data-editor-open="false"')
jsx=jsx.replace('Single-click or Space selects a node and shows its actions. Double-click or press Enter to open it. Node drag and drop is disabled; open Edit node to use the explicit Move controls.', 'Click hoặc Space để chọn. Double-click hoặc Enter để mở hoặc thu nhánh. Chọn lá để chấm điểm ngay trên node.')
start=jsx.index('     {projection.nodes.map(');end=jsx.index('\n    </div>',start)
jsx=jsx[:start]+'''     {projection.nodes.map(node=><Positioner key={node.id} node={node} point={layout.points.get(node.id)??{x:0,y:0,width:196,height:64}} selected={node.id===selected?.id} menuOpen={node.id===menuNodeId} expanded={expandedIds?.has(node.id)} state={renderState?.(node)} inlineControls={node.is_leaf&&node.id===menuNodeId?renderLeafControls?.(node):undefined} onSelect={()=>{if(selectedId===node.id){setSelectedId(undefined);setMenuNodeId(undefined);return;}setSelectedId(node.id);setMenuNodeId(node.id);}} onOpen={()=>onOpenNode(node.id,node.is_leaf)}/>) }
'''+jsx[end:]
jsx=jsx.replace('<div className={styles.zoomControls}', '{!immersive&&<div className={styles.zoomControls}').replace('onClick={centerRoot}>Center</button>\n    </div>', 'onClick={centerRoot}>Center</button>\n    </div>}')
# Titles only: the original controls and camera behaviour are retained.
jsx=jsx.replace('Full Life tree editor','Cây kiến thức SPhO').replace('Life tree view controls','Điều khiển cây')
out+=jsx+'   {!immersive&&<p className={styles.status} role="status">{nodes.length} nodes · Double-click / Enter để mở nhánh · Kéo nền để di chuyển</p>}\n  </div>\n </>;\n}\n'
dst=target/'src/lifeweave/features/life/LifeEditWorkspace.tsx';dst.write_text(out,encoding='utf-8')
manifest.append({'source':'frontend/src/features/life/LifeEditWorkspace.tsx','snapshot':'vendor/lifeweave/LifeEditWorkspace.tsx','target':str(dst.relative_to(target)).replace('\\','/'),'sourceSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'targetSha256':hashlib.sha256(dst.read_bytes()).hexdigest(),'mode':'extracted source with data/state slots; upstream camera handlers retained'})
(target/'docs/lifeweave-renderer.diff').write_text(''.join(difflib.unified_diff(s.splitlines(True),out.splitlines(True),fromfile='LifeWeave/LifeEditWorkspace.tsx',tofile='KnowledgeAtlas/LifeEditWorkspace.tsx')),encoding='utf-8')
(target/'docs/lifeweave-source-manifest.json').write_text(json.dumps({'sourceCommit':subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip(),'files':manifest},indent=2)+'\n',encoding='utf-8')
# Source renderer for the visual comparison harness, extracted without any adaptation.
reference=header.replace('import * as atlas from "../../../atlas/atlasTree.css";','')+s[s.index('function Positioner('):s.index('\nexport function LifeEditWorkspace(')].replace('function Positioner(', 'export function UpstreamPositioner(')
(target/'src/lifeweave/features/life/UpstreamPositioner.tsx').write_text(reference,encoding='utf-8')
print(f'Copied {len(files)} original files byte-for-byte, extracted renderer and upstream comparison fixture.')
