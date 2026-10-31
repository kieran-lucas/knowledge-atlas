import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import '../src/lifeweave/design-system/global.css';
import '../src/lifeweave/design-system/visual/globalType.css';
import {UpstreamPositioner} from '../src/lifeweave/features/life/UpstreamPositioner';
import {Positioner} from '../src/lifeweave/features/life/LifeEditWorkspace';
import {buildLifeTreeLayout} from '../src/lifeweave/features/life/lifeTreeLayout';
import * as styles from '../src/lifeweave/features/life/LifeEditWorkspace.css';
import {lifeProjection} from '../src/atlas/projection';
const params=new URLSearchParams(location.search);

const mode=params.get('mode')??'default';
const nodes=lifeProjection(new Set(['spho']));const layout=buildLifeTreeLayout(nodes);
function Harness(){const [renderer,setRenderer]=useState(params.get('renderer'));useEffect(()=>{const change=(event:Event)=>setRenderer((event as CustomEvent<string>).detail);window.addEventListener('parity-renderer',change);return()=>window.removeEventListener('parity-renderer',change)},[]);const Card=renderer==='upstream'?UpstreamPositioner:Positioner;return <div data-parity-canvas style={{position:'relative',width:900,height:650,background:'white',padding:20}}><div className={styles.workspace}><div className={styles.canvasViewport}><svg className={styles.links} width={layout.width} height={layout.height}>{layout.links.map(l=><path key={l.id} d={l.d}/>)}</svg>{nodes.map(n=><Card key={n.id} node={n} point={layout.points.get(n.id)!} expanded={true} selected={mode!=='default'&&n.id==='mechanics'} menuOpen={mode==='actions'&&n.id==='mechanics'} onSelect={()=>{}} onOpen={()=>{}} onAdd={()=>{}} onEdit={()=>{}}/>)}</div></div></div>}
createRoot(document.getElementById('root')!).render(<Harness/>);
