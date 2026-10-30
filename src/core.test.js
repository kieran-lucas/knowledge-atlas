import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {nodes,leaves,byId,childrenOf,descendants} from './curriculum';
import {aggregate,nodeScore,adjusted} from './scoring';
import {validateData} from './persistence';
const counts={I:11,II:3,III:6,IV:5,V:2,VI:7,VII:5,VIII:4,IX:5,X:5,XI:5,XII:6};
const scored=(ids,v)=>Object.fromEntries(ids.map(id=>[id,{score:v}]));
describe('curriculum against actual PDF extraction',()=>{
 it('contains precisely the required tree and all 64 source item numbers',()=>{
  const source=readFileSync('docs/syllabus-extracted.txt','utf8');let section;const ids=[];
  for(const line of source.split('\n')){const s=line.trim().match(/^(XII|XI|VIII|VII|VI|IV|IX|III|II|V|X|I)\./);if(s){section=s[1];continue}const m=line.trim().match(/^(\d+)\.\s/);if(m&&section)ids.push(`${section}.${m[1]}`)}
  expect(ids).toHaveLength(64);expect(new Set(ids).size).toBe(64);
  expect(leaves.filter(n=>n.isOfficial).map(n=>n.syllabusItemId).sort()).toEqual(ids.sort());
  for(const [s,c] of Object.entries(counts))expect(ids.filter(id=>id.split('.')[0]===s)).toHaveLength(c);
  expect(childrenOf('spho').map(n=>n.title)).toEqual(['Cơ học','Dao động và sóng','Nhiệt học và vật lý thống kê','Điện từ học','Quang học','Vật lý hiện đại']);
  expect(leaves).toHaveLength(76);expect(leaves.filter(n=>!n.isOfficial)).toHaveLength(12);
 });
 it('has unique IDs, valid parents, no cycles or empty groups',()=>{expect(new Set(nodes.map(n=>n.id)).size).toBe(nodes.length);for(const n of nodes){expect(n.title).toBeTruthy();if(n.parent_id)expect(byId.has(n.parent_id)).toBe(true);if(n.nodeType!=='leaf')expect(childrenOf(n.id).length).toBeGreaterThan(0);const seen=new Set();let p=n;while(p){expect(seen.has(p.id)).toBe(false);seen.add(p.id);p=byId.get(p.parent_id)}}});
});
describe('mastery',()=>{
 const l=leaves.filter(n=>n.isOfficial).slice(0,4);
 it('handles unassessed, single, equal, and one weak value',()=>{expect(aggregate(l,{}).mastery).toBe(null);expect(aggregate(l,scored([l[0].id],90))).toMatchObject({mastery:90,coverage:.25});expect(aggregate(l,scored(l.map(n=>n.id),80)).mastery).toBe(80);const s=scored(l.map(n=>n.id),100);s[l[0].id]={score:0};expect(aggregate(l,s).mastery).toBe(52.5)});
 it('depends on leaf set rather than order or grouping',()=>{const s=scored(l.map(n=>n.id),75);expect(aggregate(l,s)).toEqual(aggregate([...l].reverse(),s))});
 it('weights assessed official sections equally and ignores geometric optics',()=>{const s={'spho.I.1':{score:100},'spho.II.1':{score:0},'geo.GH.10':{score:100}};expect(nodeScore(byId.get('spho'),s).mastery).toBe(50);delete s['geo.GH.10'];expect(nodeScore(byId.get('spho'),s).mastery).toBe(50);expect(nodeScore(byId.get('spho'),s).coverage).toBe(2/76)});
 it('clamps exactly one step including null',()=>{expect(adjusted(null,1)).toBe(1);expect(adjusted(null,-1)).toBe(0);expect(adjusted(100,1)).toBe(100);expect(adjusted(0,-1)).toBe(0)});
});
describe('import',()=>{it('rejects invalid IDs, parents, fractional and out-of-range scores',()=>{for(const [id,score] of [['spho',10],['missing',10],['spho.I.1',101],['spho.I.1',1.5]])expect(()=>validateData({schemaVersion:1,scores:{[id]:{score,assessed:true,updatedAt:new Date().toISOString()}}})).toThrow()});});
import {buildLifeTreeLayout} from './lifeTreeLayout';
describe('full layout',()=>{it('keeps every card separate and links every non-root node',()=>{const layout=buildLifeTreeLayout(nodes);expect(layout.points.size).toBe(nodes.length);expect(layout.links).toHaveLength(nodes.length-1);const points=[...layout.points.values()];for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const a=points[i],b=points[j];expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true)}})});
