import {useLayoutEffect,useRef,type RefObject,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {TreeLayout,LayoutNode} from '../lifeweave/features/life/lifeTreeLayout';
import {duration,easing} from '../lifeweave/design-system/visual/motion.css';
import {clampZoom,cubicBezier,frameBounds,treeBounds,zoomAt,type Camera} from './cameraMath';

export type AtlasFocusRequest={id:string;sequence:number;scope?:'node'|'branch'|'all';select?:boolean};
type Options={enabled:boolean;layout:TreeLayout;nodes:LayoutNode[];selectedId?:string;viewportRef:RefObject<HTMLDivElement|null>;canvasRef:RefObject<HTMLDivElement|null>;focusRequest?:AtlasFocusRequest;onSelect:(id:string|undefined)=>void};
export function useAtlasCamera(options:Options){
 const latest=useRef(options);latest.current=options;
 const zoom=useRef(1),size=useRef({width:0,height:0}),initialized=useRef(false),overview=useRef(true);
 const frame=useRef(0),lastRequest=useRef<AtlasFocusRequest|undefined>(undefined),previousLayout=useRef<TreeLayout|undefined>(undefined);
 const motionCurve=easing.standard.match(/[\d.]+/g)!.map(Number);
 const read=():Camera=>{const v=latest.current.viewportRef.current;return {x:((v?.scrollLeft??0)-size.current.width/2)/zoom.current,y:((v?.scrollTop??0)-size.current.height/2)/zoom.current,zoom:zoom.current}};
 const write=(camera:Camera)=>{
  const {viewportRef,canvasRef,layout}=latest.current;const v=viewportRef.current,c=canvasRef.current;if(!v||!c)return;
  const width=v.clientWidth,height=v.clientHeight,z=clampZoom(camera.zoom);size.current={width,height};zoom.current=z;
  // One viewport of virtual space on every side lets even boundary leaves be centered.
  c.style.width=`${layout.width+2*width/z}px`;c.style.height=`${layout.height+2*height/z}px`;c.style.zoom=String(z);
  const world=c.querySelector<HTMLElement>('[data-atlas-world]');if(world)world.style.transform=`translate(${width/z}px,${height/z}px)`;
  v.scrollLeft=camera.x*z+width/2;v.scrollTop=camera.y*z+height/2;
  v.dataset.cameraZoom=z.toFixed(4);
 };
 const cancel=()=>{cancelAnimationFrame(frame.current);frame.current=0;const v=latest.current.viewportRef.current;if(v)v.dataset.cameraMoving='false'};
 const move=(target:Camera,animate=true)=>{
  cancel();const v=latest.current.viewportRef.current;if(!v)return;
  if(!animate||matchMedia('(prefers-reduced-motion: reduce)').matches){write(target);return}
  const start=read(),started=performance.now(),ms=parseFloat(duration.traversal);v.dataset.cameraMoving='true';
  const step=(now:number)=>{const t=Math.min(1,(now-started)/ms),p=cubicBezier(t,motionCurve[0]!,motionCurve[1]!,motionCurve[2]!,motionCurve[3]!);write({x:start.x+(target.x-start.x)*p,y:start.y+(target.y-start.y)*p,zoom:start.zoom+(target.zoom-start.zoom)*p});if(t<1)frame.current=requestAnimationFrame(step);else{write(target);frame.current=0;v.dataset.cameraMoving='false'}};
  frame.current=requestAnimationFrame(step);
 };
 const fitAll=(animate=true)=>{const {viewportRef,layout}=latest.current;const v=viewportRef.current;if(!v)return;overview.current=true;move(frameBounds(treeBounds(layout.points.values()),v.clientWidth,v.clientHeight),animate)};
 const interrupt=()=>{overview.current=false;cancel()};
 const focus=(request:AtlasFocusRequest,animate=true)=>{
  const {layout,nodes,viewportRef,onSelect}=latest.current;const v=viewportRef.current,p=layout.points.get(request.id);if(!v||!p)return;
  if(request.select!==false)onSelect(request.id);else onSelect(undefined);
  requestAnimationFrame(()=>{if(document.activeElement instanceof HTMLInputElement)return;const target=request.select===false?v:v.querySelector<HTMLElement>(`[data-life-edit-id="${request.id}"]`);target?.focus({preventScroll:true})});
  if(request.scope==='all'){fitAll(animate);return}
  overview.current=false;
  if(request.scope==='branch'){
   const ids=new Set([request.id]);let changed=true;while(changed){changed=false;for(const n of nodes)if(n.parent_id&&ids.has(n.parent_id)&&!ids.has(n.id)){ids.add(n.id);changed=true}}
   const bounds=treeBounds([...layout.points].filter(([id])=>ids.has(id)).map(([,point])=>point));move(frameBounds(bounds,v.clientWidth,v.clientHeight),animate);
  }else move({x:p.x+p.width/2,y:p.y+p.height/2,zoom:1},animate);
 };
 useLayoutEffect(()=>{
  if(!options.enabled)return;
  const old=previousLayout.current;const pending=options.focusRequest&&lastRequest.current!==options.focusRequest;
  if(!initialized.current){initialized.current=true;fitAll(false)}
  if(pending&&options.layout.points.has(options.focusRequest!.id)){lastRequest.current=options.focusRequest;focus(options.focusRequest!)}
  else if(old&&old!==options.layout){
   // Keep the selected card in place when a structural change reflows other branches.
   const camera=read(),id=options.selectedId??options.nodes.find(n=>n.parent_id===null)?.id;
   const before=id&&old.points.get(id),after=id&&options.layout.points.get(id);
   if(before&&after){camera.x+=(after.x+after.width/2)-(before.x+before.width/2);camera.y+=(after.y+after.height/2)-(before.y+before.height/2)}
   cancel();write(camera);
  }
  previousLayout.current=options.layout;
 },[options.enabled,options.layout,options.focusRequest]);
 useLayoutEffect(()=>{
  if(!options.enabled)return;const viewport=options.viewportRef.current;if(!viewport)return;
  const observer=new ResizeObserver(()=>{if(size.current.width===viewport.clientWidth&&size.current.height===viewport.clientHeight)return;cancel();if(overview.current)fitAll(false);else write(read())});observer.observe(viewport);
  const wheel=(event:WheelEvent)=>{if(!event.ctrlKey){interrupt();return}event.preventDefault();interrupt();const rect=viewport.getBoundingClientRect(),unit=event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1;const camera=read();write(zoomAt(camera,camera.zoom*Math.exp(-Math.max(-300,Math.min(300,event.deltaY*unit))*.002),{x:event.clientX-rect.left,y:event.clientY-rect.top},size.current))};
  const shortcuts=(event:KeyboardEvent)=>{if(!(event.ctrlKey||event.metaKey)||event.target instanceof Element&&event.target.closest('input,textarea,[contenteditable="true"]'))return;if(['+','=','-','0'].includes(event.key)){event.preventDefault();if(event.key==='0')fitAll();else{overview.current=false;const camera=read();move({...camera,zoom:clampZoom(camera.zoom*(event.key==='-'?1/1.2:1.2))})}}};
  viewport.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',shortcuts,true);
  return()=>{observer.disconnect();viewport.removeEventListener('wheel',wheel);window.removeEventListener('keydown',shortcuts,true);cancel()};
 },[options.enabled]);
 const panKey=(event:ReactKeyboardEvent<HTMLDivElement>)=>{if(event.key==='Home'){event.preventDefault();if(!event.ctrlKey&&!event.metaKey)fitAll();return true}if(event.key.startsWith('Arrow'))interrupt();return false};
 return {interrupt,fitAll,panKey};
}
