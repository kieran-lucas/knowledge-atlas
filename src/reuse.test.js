import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(readFileSync('docs/lifeweave-source-manifest.json','utf8'));
describe('LifeWeave source reuse',()=>{
 it('uses byte-for-byte upstream visual modules and layout',()=>{for(const f of manifest.files.filter(f=>f.mode==='byte-for-byte')){expect(createHash('sha256').update(readFileSync(f.target)).digest('hex'),f.target).toBe(f.sha256)}});
 it('retains the upstream pan, wheel, keyboard, zoom and center implementation',()=>{const upstream=readFileSync('vendor/lifeweave/LifeEditWorkspace.tsx','utf8').replaceAll('\r\n','\n');const copied=readFileSync('src/lifeweave/features/life/LifeEditWorkspace.tsx','utf8').replaceAll('\r\n','\n');const start=upstream.indexOf(' const startPan=');const end=upstream.indexOf(' if(query.isLoading)');expect(copied).toContain(upstream.slice(start,end));expect(copied).toContain('className={styles.nodeCard}');expect(copied).toContain('className={styles.confidencePip}');expect(copied).toContain('className={styles.zoomControls}')});
});
