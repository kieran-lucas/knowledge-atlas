import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {createServer} from 'node:net';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const executable=process.env.ATLAS_EXE;
if(!executable)throw new Error('Set ATLAS_EXE to the packaged desktop executable.');
const profile=resolve('src-tauri/target/native-smoke-profile');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
let child,browser;
async function launch(){
 child=spawn(executable,[],{env:{...process.env,WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:`--remote-debugging-port=${port}`,WEBVIEW2_USER_DATA_FOLDER:profile},windowsHide:true,stdio:'ignore'});
 const start=Date.now();let ready=false;
 while(Date.now()-start<25000){if(child.exitCode!==null)throw new Error(`App exited before loading: ${child.exitCode}`);try{const r=await fetch(`http://127.0.0.1:${port}/json/version`);if(r.ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,250))}
 assert(ready,'WebView2 debugging endpoint did not start');
 browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
 const context=browser.contexts()[0];let page;
 for(let i=0;i<40;i++){page=context.pages().find(p=>p.url().includes('tauri.localhost')||p.url().includes('tauri://'));if(page)break;await new Promise(r=>setTimeout(r,100))}
 assert(page,'Native app page not found');await page.getByRole('tree',{name:'Cây kiến thức SPhO'}).waitFor();return page;
}
async function stop(){if(child&&child.exitCode===null){child.kill();await new Promise(r=>child.once('exit',r))}try{await browser?.close()}catch{}await new Promise(r=>setTimeout(r,800))}
const search=async(page,code)=>{await page.getByRole('tree',{name:'Cây kiến thức SPhO'}).waitFor();await page.keyboard.press('Control+f');await page.getByLabel('Tìm kiến thức').fill(code);await page.locator('.results button').first().click();await page.locator('[data-life-pan-surface][data-camera-moving="false"]').waitFor()};
try{
 let page=await launch();await page.evaluate(()=>localStorage.clear());await page.reload();await page.getByRole('tree',{name:'Cây kiến thức SPhO'}).waitFor();assert.equal(await page.getByRole('treeitem').count(),7);assert.equal(await page.locator('header,footer').count(),0);assert.equal(await page.getByRole('button').count(),7);const viewportBounds=await page.locator('[data-life-pan-surface]').evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,windowWidth:innerWidth,windowHeight:innerHeight,dpr:devicePixelRatio}});console.log('Native viewport:',viewportBounds);assert(viewportBounds.x===0&&viewportBounds.y===0&&Math.abs(viewportBounds.width-viewportBounds.windowWidth)<1&&Math.abs(viewportBounds.height-viewportBounds.windowHeight)<1);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'screenshots/desktop-native-overview.png'});
 const frameDeltas=await Promise.all([page.evaluate(()=>new Promise(resolve=>{const samples=[];let previous=performance.now(),start=previous;const sample=now=>{samples.push(now-previous);previous=now;if(now-start<500)requestAnimationFrame(sample);else resolve(samples)};requestAnimationFrame(sample)})),search(page,'I.1')]).then(([samples])=>samples.slice(1).sort((a,b)=>a-b));const frameTiming={samples:frameDeltas.length,medianMs:Number(frameDeltas[Math.floor(frameDeltas.length/2)].toFixed(2)),maxMs:Number(frameDeltas[frameDeltas.length-1].toFixed(2))};console.log('Native animation frame timing:',frameTiming);await page.getByRole('button',{name:'Tăng điểm I.1'}).click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowledge-atlas.mastery.v1')).scores['spho.I.1'].score),1);
 await page.keyboard.press('Control+z');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowledge-atlas.mastery.v1')).scores['spho.I.1']?.score??null),null);await page.keyboard.press('Control+Shift+z');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowledge-atlas.mastery.v1')).scores['spho.I.1'].score),1);await page.screenshot({path:'screenshots/desktop-native-leaf.png'});await stop();
 page=await launch();await search(page,'I.1');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowledge-atlas.mastery.v1')).scores['spho.I.1'].score),1);
 const exportPayload={schemaVersion:1,scores:{'spho.VI.2':{score:64,assessed:true,updatedAt:new Date().toISOString()}}};
 await page.locator('input[type=file]').setInputFiles({name:'knowledge-atlas-native.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exportPayload))});
 await search(page,'VI.2');await page.getByRole('button',{name:'Tăng điểm VI.2'}).click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowledge-atlas.mastery.v1')).scores['spho.VI.2'].score),65);
 await page.keyboard.press('Control+z');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowledge-atlas.mastery.v1')).scores['spho.VI.2'].score),64);await page.keyboard.press('Control+y');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowledge-atlas.mastery.v1')).scores['spho.VI.2'].score),65);
 const [download]=await Promise.all([page.waitForEvent('download',{timeout:10000}),page.keyboard.press('Control+s')]);const downloadPath=await download.path();assert.equal(JSON.parse(fs.readFileSync(downloadPath,'utf8')).scores['spho.VI.2'].score,65);assert.deepEqual(errors,[]);
 fs.writeFileSync('docs/desktop-smoke-report.json',JSON.stringify({app:executable,nativeUrl:page.url(),frameTiming,checks:['packaged WebView2 launch','root and 6 branches','inline leaf score','leaf-local undo and redo','undo first assessment to null','persistence after process restart','JSON import','JSON export'],passed:true},null,2)+'\n');console.log('Native desktop smoke passed: packaged app, scoring, process restart persistence, JSON import/export.');
}finally{await stop()}
