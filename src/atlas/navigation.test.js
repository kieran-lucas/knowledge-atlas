import {describe,it,expect} from 'vitest';
import {treeBounds,frameBounds,zoomAt,clampZoom,cubicBezier} from './cameraMath';
import {searchNodes,foldText} from './search';
describe('Atlas camera geometry',()=>{
 it('frames the real tree rather than the minimum canvas size',()=>{const bounds=treeBounds([{x:24,y:28,width:196,height:64},{x:264,y:28,width:250,height:464}]);expect(bounds).toEqual({x:24,y:28,width:490,height:464});const camera=frameBounds(bounds,1522,900);expect(camera.x).toBe(269);expect(camera.y).toBe(260);expect(camera.zoom).toBe(1)});
 it('preserves the world point under the pointer while zooming',()=>{const camera={x:320,y:740,zoom:.8},size={width:1400,height:900},anchor={x:1130,y:215};const next=zoomAt(camera,1.65,anchor,size);expect(camera.x+(anchor.x-size.width/2)/camera.zoom).toBeCloseTo(next.x+(anchor.x-size.width/2)/next.zoom,10);expect(camera.y+(anchor.y-size.height/2)/camera.zoom).toBeCloseTo(next.y+(anchor.y-size.height/2)/next.zoom,10)});
 it('fits a branch to a small viewport and clamps the zoom range',()=>{const bounds={x:50,y:80,width:500,height:700},camera=frameBounds(bounds,390,600);expect(bounds.width*camera.zoom).toBeLessThan(390);expect(bounds.height*camera.zoom).toBeLessThan(600);expect(clampZoom(.01)).toBe(.08);expect(clampZoom(5)).toBe(1.75)});
 it('can fit a fully expanded 76-leaf tree',()=>{const bounds={x:24,y:28,width:2000,height:6800};const camera=frameBounds(bounds,390,844);expect(bounds.width*camera.zoom).toBeLessThan(390);expect(bounds.height*camera.zoom).toBeLessThan(844)});
 it('uses a bounded monotonic settle curve',()=>{const values=Array.from({length:101},(_,i)=>cubicBezier(i/100,.16,1,.3,1));expect(values[0]).toBe(0);expect(values[100]).toBe(1);for(let i=1;i<values.length;i++)expect(values[i]).toBeGreaterThanOrEqual(values[i-1])});
});
describe('Vietnamese curriculum search',()=>{
 it('ranks exact syllabus IDs above substring matches',()=>{for(const [code,id] of [['X.2','spho.X.2'],['VI.2','spho.VI.2'],['GH.10','geo.GH.10']])expect(searchNodes(code)[0].id).toBe(id)});
 it('supports accents, đ, and words in any order',()=>{expect(foldText('Động lượng')).toBe('dong luong');expect(searchNodes('thau kinh mong')[0].id).toBe('geo.GH.10');expect(searchNodes('newton chuyen')[0].id).toBe('spho.I.1')});
 it('returns bounded, distinct results and an empty state',()=>{expect(searchNodes('dien',3)).toHaveLength(3);expect(new Set(searchNodes('dien').map(n=>n.id)).size).toBe(searchNodes('dien').length);expect(searchNodes('khong-co-noi-dung')).toEqual([]);expect(searchNodes(' ')).toEqual([])});
});
