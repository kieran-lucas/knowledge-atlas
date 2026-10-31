import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const exportFile=join(tmpdir(),`knowledge-atlas-test-${Date.now()}.json`);
const BASE=process.env.ATLAS_URL??'http://127.0.0.1:5173';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const context=await browser.newContext({viewport:{width:1522,height:900}});const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(BASE);await page.evaluate(()=>localStorage.clear());await page.reload();await page.evaluate(()=>document.fonts.ready);
const card=id=>page.locator(`[data-life-edit-id="${id}"]`);
const shell=id=>card(id).locator('..');const viewport=()=>page.locator('[data-life-pan-surface]');
const camera=()=>viewport().evaluate(e=>[e.scrollLeft,e.scrollTop]);
const score=async id=>page.evaluate(id=>JSON.parse(localStorage.getItem('knowledge-atlas.mastery.v1')).scores[id]?.score??null,id);
const idle=()=>page.locator('[data-life-pan-surface][data-camera-moving="false"]').waitFor();
const search=async q=>{await page.getByRole('tree',{name:'Cây kiến thức SPhO'}).waitFor();await page.keyboard.press('Control+f');await page.getByLabel('Tìm kiến thức').fill(q);await page.locator('.results button').first().click();await idle()};
await idle();await page.screenshot({path:'screenshots/overview.png'});const overviewBounds=await card('spho').locator('xpath=ancestor::div[@role="treeitem"]').evaluate(()=>{const all=[...document.querySelectorAll('[data-life-edit-id]')].map(n=>n.getBoundingClientRect());return {x:(Math.min(...all.map(r=>r.left))+Math.max(...all.map(r=>r.right)))/2,y:(Math.min(...all.map(r=>r.top))+Math.max(...all.map(r=>r.bottom)))/2}});assert(Math.abs(overviewBounds.x-761)<2);assert(Math.abs(overviewBounds.y-450)<2);
assert.equal(await page.getByRole('treeitem').count(),7);assert.equal(await page.locator('header,footer').count(),0);assert.equal(await page.getByRole('button').count(),7);const bounds=await viewport().boundingBox();assert.equal(bounds.x,0);assert.equal(bounds.y,0);assert.equal(bounds.width,1522);assert.equal(bounds.height,900);
await card('mechanics').click();assert.equal(await page.locator('[data-grade-controls]').count(),0);
await card('mechanics').dblclick();await idle();await page.screenshot({path:'screenshots/mechanics-parent.png'});
await search('I.1');assert.equal(await page.locator('[data-grade-controls]').count(),1);await page.screenshot({path:'screenshots/leaf-before.png'});
const plus=page.getByRole('button',{name:'Tăng điểm I.1'}),minus=page.getByRole('button',{name:'Giảm điểm I.1'});const before=await camera();
const positions=await page.locator('[role=treeitem]').evaluateAll(items=>items.map(e=>e.style.transform));
assert.match(await shell('spho.I.1').innerText(),/Chưa chấm/);await plus.click();assert.equal(await score('spho.I.1'),1);await page.keyboard.press('Control+z');assert.equal(await score('spho.I.1'),null);assert.match(await card('spho').innerText(),/0\/76/);await page.keyboard.press('Control+Shift+z');assert.equal(await score('spho.I.1'),1);await page.keyboard.press('Control+z');await page.keyboard.press('Control+y');assert.equal(await score('spho.I.1'),1);await page.keyboard.press('Control+z');await minus.click();assert.equal(await score('spho.I.1'),0);assert.equal(await minus.isDisabled(),true);await page.keyboard.press('Control+z');assert.equal(await score('spho.I.1'),null);await plus.evaluate(button=>{for(let i=0;i<10;i++)button.click()});assert.equal(await score('spho.I.1'),10);
for(let i=0;i<7;i++)await minus.click();assert.equal(await score('spho.I.1'),3);
await page.keyboard.down('Shift');await plus.click();await page.keyboard.up('Shift');assert.equal(await score('spho.I.1'),4);
await page.keyboard.press('Control+z');assert.equal(await score('spho.I.1'),3);await page.keyboard.press('Control+y');assert.equal(await score('spho.I.1'),4);assert.deepEqual(await camera(),before);assert.deepEqual(await page.locator('[role=treeitem]').evaluateAll(items=>items.map(e=>e.style.transform)),positions);
assert.equal(await card('spho.I.1').getAttribute('aria-pressed'),'true');assert.match(await card('mechanics').innerText(),/4\/100/);assert.match(await card('spho').innerText(),/4\/100.*1\/76/);await page.screenshot({path:'screenshots/leaf-after.png'});
await search('VI.2');await page.keyboard.press('Control+z');assert.equal(await score('spho.I.1'),4);assert.equal(await page.locator('[data-grade-controls]').count(),1);assert.equal(await shell('spho.I.1').locator('[data-grade-controls]').count(),0);await page.screenshot({path:'screenshots/electromagnetism.png'});
await page.getByRole('button',{name:'Giảm điểm VI.2'}).click();assert.equal(await score('spho.VI.2'),0);assert.equal(await page.getByRole('button',{name:'Giảm điểm VI.2'}).isDisabled(),true);await page.getByRole('button',{name:'Giảm điểm VI.2'}).dispatchEvent('click');assert.equal(await score('spho.VI.2'),0);
await page.reload();await search('VI.2');assert.match(await shell('spho.VI.2').innerText(),/0 \/ 100/);
await search('GH.10');await page.screenshot({path:'screenshots/optics.png'});const root=await card('spho').innerText();await page.getByRole('button',{name:'Tăng điểm GH.10'}).click();assert.equal(await score('geo.GH.10'),1);assert.match(await card('spho').innerText(),/2\/100/);assert.match(root,/2\/100/);
await viewport().click({position:{x:5,y:5}});await page.keyboard.press('Control+z');assert.equal(await score('geo.GH.10'),1);assert.equal(await page.locator('[data-grade-controls]').count(),0);
const [download]=await Promise.all([page.waitForEvent('download'),page.keyboard.press('Control+s')]);await download.saveAs(exportFile);const saved=JSON.parse(fs.readFileSync(exportFile));assert.equal(saved.scores['spho.I.1'].score,4);
await search('I.1');await plus.click();assert.equal(await score('spho.I.1'),5);await page.locator('input[type=file]').setInputFiles(exportFile);await page.keyboard.press('Control+z');assert.equal(await score('spho.I.1'),4);await page.evaluate(()=>localStorage.clear());await page.reload();await page.locator('input[type=file]').setInputFiles(exportFile);await search('I.1');assert.equal(await score('spho.I.1'),4);
// Search X.2 must prefer its exact ID over IX.2.
await search('X.2');assert.equal(await card('spho.X.2').getAttribute('aria-pressed'),'true');
await page.evaluate(()=>{const key='knowledge-atlas.mastery.v1',d=JSON.parse(localStorage.getItem(key));d.scores['spho.X.2']={score:100,assessed:true,updatedAt:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(d))});await page.reload();await search('X.2');assert.equal(await page.getByRole('button',{name:'Tăng điểm X.2'}).isDisabled(),true);await page.getByRole('button',{name:'Tăng điểm X.2'}).dispatchEvent('click');assert.equal(await score('spho.X.2'),100);
await page.screenshot({path:'screenshots/long-title.png'});
const overlaps=await page.locator('[role=treeitem]').evaluateAll(items=>{const rects=items.map(e=>({id:e.querySelector('[data-life-edit-id]').dataset.lifeEditId,r:e.getBoundingClientRect()}));const collisions=[];for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];if(Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)>1&&Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top)>1)collisions.push([a.id,b.id])}return collisions});assert.deepEqual(overlaps,[]);
await search('VI.2');await page.screenshot({path:'screenshots/weaknesses.png'});
await card('electromagnetism').click();assert.equal(await page.locator('[data-grade-controls]').count(),0);await page.screenshot({path:'screenshots/selected-parent.png'});
// Blank-space pan must use the upstream pointer implementation.
await viewport().focus();const panBefore=await camera();await page.keyboard.press('ArrowDown');assert.equal((await camera())[1],panBefore[1]+80);
await page.keyboard.press('Control+Home');await page.setViewportSize({width:390,height:844});await page.keyboard.press('Control+0');await idle();await page.screenshot({path:'screenshots/mobile.png'});
await page.setViewportSize({width:1522,height:900});await page.keyboard.press('Control+Home');await idle();const anchorBefore=await card('spho').boundingBox();const anchor={x:anchorBefore.x+anchorBefore.width/2,y:anchorBefore.y+anchorBefore.height/2};await page.mouse.move(anchor.x,anchor.y);await page.keyboard.down('Control');await page.mouse.wheel(0,-120);await page.keyboard.up('Control');const anchorAfter=await card('spho').boundingBox();assert(anchorAfter.width>anchorBefore.width*1.1);assert(Math.abs(anchorAfter.x+anchorAfter.width/2-anchor.x)<2);assert(Math.abs(anchorAfter.y+anchorAfter.height/2-anchor.y)<2);await page.keyboard.press('Control+f');await page.getByLabel('Tìm kiến thức').fill('thau kinh');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await idle();assert.equal(await card('geo.GH.11').getAttribute('aria-pressed'),'true');await page.screenshot({path:'screenshots/improved-focus.png'});assert.deepEqual(errors,[]);fs.unlinkSync(exportFile);
// Compare the renderer copied into Atlas with the Positioner extracted WITHOUT changes from LifeWeave.
const parity=await context.newPage();await parity.emulateMedia({reducedMotion:'reduce'});await parity.mouse.move(1450,850);const parityResults=[];
const computedSnapshot=()=>parity.locator('[data-parity-canvas]').evaluate(root=>[root,...root.querySelectorAll('*')].map(node=>{const style=getComputedStyle(node),rect=node.getBoundingClientRect();return {tag:node.tagName,rect:[rect.x,rect.y,rect.width,rect.height],styles:['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','borderColor','borderRadius','boxShadow','transform','opacity'].map(key=>style[key])}}));
for(const mode of ['default','selected','actions']){
 await parity.goto(`${BASE}/tests/lifeweave-parity.html?renderer=upstream&mode=${mode}`);await parity.locator('[data-parity-canvas] [data-life-edit-id="spho"]').waitFor();await parity.evaluate(async()=>{await document.fonts.load('680 12.5px "Lexend Variable"',document.body.innerText);await document.fonts.ready});const original=await parity.locator('[data-parity-canvas]').screenshot({animations:'disabled',path:`screenshots/lifeweave-original-${mode}.png`});
 const originalDOM=await parity.locator('[data-parity-canvas]').innerHTML();const originalStyles=await computedSnapshot();
 await parity.evaluate(()=>window.dispatchEvent(new CustomEvent('parity-renderer',{detail:'atlas'})));await parity.waitForTimeout(150);await parity.evaluate(()=>document.fonts.ready);
 const copiedDOM=await parity.locator('[data-parity-canvas]').innerHTML();assert.equal(copiedDOM,originalDOM,`Renderer DOM parity: ${mode}`);assert.deepEqual(await computedSnapshot(),originalStyles,`Renderer style and geometry parity: ${mode}`);
 const copied=await parity.locator('[data-parity-canvas]').screenshot({animations:'disabled',path:`screenshots/lifeweave-copied-${mode}.png`});parityResults.push({mode,domAndStylesMatch:true,pngBytesMatch:Buffer.compare(original,copied)===0});
}
fs.writeFileSync('docs/visual-parity-report.json',JSON.stringify(parityResults,null,2)+'\n');console.log('Passed: source DOM/style/geometry parity (default/selected/actions), scoring, pointer zoom, keyboard search, persistence, import/export and mobile.');
}finally{await browser.close()}
