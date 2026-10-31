import type {LayoutPoint} from '../lifeweave/features/life/lifeTreeLayout';
export type Camera={x:number;y:number;zoom:number};
export type Bounds={x:number;y:number;width:number;height:number};
export const MIN_ZOOM=.08;
export const MAX_ZOOM=1.75;
export const clampZoom=(value:number)=>Math.min(MAX_ZOOM,Math.max(MIN_ZOOM,value));
export function treeBounds(points:Iterable<LayoutPoint>):Bounds{
 const all=[...points];if(!all.length)return {x:0,y:0,width:1,height:1};
 const x=Math.min(...all.map(p=>p.x)),y=Math.min(...all.map(p=>p.y));
 return {x,y,width:Math.max(...all.map(p=>p.x+p.width))-x,height:Math.max(...all.map(p=>p.y+p.height))-y};
}
export function frameBounds(bounds:Bounds,width:number,height:number,maxZoom=1):Camera{
 const padding=Math.min(64,Math.max(24,Math.min(width,height)*.08));
 return {x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2,zoom:clampZoom(Math.min(maxZoom,Math.max(1,width-padding*2)/bounds.width,Math.max(1,height-padding*2)/bounds.height))};
}
export function zoomAt(camera:Camera,nextZoom:number,anchor:{x:number;y:number},size:{width:number;height:number}):Camera{
 const zoom=clampZoom(nextZoom);const dx=anchor.x-size.width/2,dy=anchor.y-size.height/2;
 return {x:camera.x+dx/camera.zoom-dx/zoom,y:camera.y+dy/camera.zoom-dy/zoom,zoom};
}
// Evaluate the very same cubic Bézier exported by the LifeWeave motion tokens.
export function cubicBezier(progress:number,x1:number,y1:number,x2:number,y2:number):number{
 if(progress<=0)return 0;if(progress>=1)return 1;
 const curve=(t:number,a:number,b:number)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
 let lo=0,hi=1;for(let i=0;i<18;i++){const mid=(lo+hi)/2;if(curve(mid,x1,x2)<progress)lo=mid;else hi=mid}
 return curve((lo+hi)/2,y1,y2);
}
