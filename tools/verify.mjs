import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {readFile,cp,mkdir,mkdtemp,readdir,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {buildDossier} from '../vendor/makefun-frontend.ts';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(root,'out'),caps={text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216};
const assert=(v,s)=>{if(!v)throw Error(s)};
const vendor=await readFile(resolve(root,'vendor/makefun-frontend.ts'));
assert(vendor.length===85533&&createHash('sha256').update(vendor).digest('hex')==='4c8da1c8e76490b3a847670f49137d3ec23953e3c988fe6a6cb320fce5739240','vendor mismatch');
const html=await readFile(resolve(root,'app/index.html')),shell=JSON.parse(await readFile(resolve(root,'app/shell.json')));
assert(shell.bytes===gzipSync(html,{level:9}).length&&shell.bytes<=3600,'shell mismatch');
const main=await readFile(resolve(root,'main.ts'),'utf8');
assert(main.includes("import {buildDossier} from './vendor/makefun-frontend.ts'"),'canonical import');
for(const line of main.split('\n'))if(/writeFile\(/.test(line))assert(/writeFile\(resolve\(outputDir,/.test(line),'write destination outside output');
const dossier=await readFile(resolve(out,'dossier.json')),tmp=await mkdtemp(resolve(tmpdir(),'mf-verify-'));
await cp(resolve(root,'app'),resolve(tmp,'app'),{recursive:true});await cp(resolve(root,'screenshots'),resolve(tmp,'screenshots'),{recursive:true});
assert(dossier.equals(Buffer.from(buildDossier(tmp,caps))),'dossier mismatch');
const shots=await readdir(resolve(root,'screenshots'));assert(shots.length===3,'three screenshots');for(const file of shots)assert((await stat(resolve(root,'screenshots',file))).size<=262144,'screenshot cap');
const {chromium}=await import(pathToFileURL('/home/hatch/.npm/_npx/f0a362733743bae2/node_modules/playwright-core/index.mjs'));
const browser=await chromium.launch({headless:true,args:['--proxy-server=http://127.0.0.1:18080','--no-sandbox']}),page=await browser.newPage({viewport:{width:1280,height:800}});
try{
 await page.goto('http://127.0.0.1:8081/#/bounty/makefun-frontend-01');await page.waitForFunction(()=>window.__shotReady);assert(await page.locator('.reward').count()===20,'all rewards');let count=await page.locator('.row').count();assert(count>=9,'board density');await page.locator('#filter').fill('frontend');assert(await page.locator('.row').count()===1,'instant board filtering');await page.locator('#filter').fill('');assert(await page.locator('.row').count()===count,'filter restoration');
 await page.goto('http://127.0.0.1:8081/#/leaderboard/threejs-fps-02');await page.waitForFunction(()=>window.__shotReady);assert(await page.locator('#rows .lr').count()>=9&&await page.locator('#rows .lr').count()<30,'virtual DOM window');const before=await page.locator('#rows .lr').first().innerText();await page.locator('#window').evaluate(e=>e.scrollTop=10000);await page.waitForTimeout(100);assert(await page.locator('#rows .lr').first().innerText()!==before,'scroll window updates');
 await page.goto('http://127.0.0.1:8081/#/profile/tidy-meteor-25');await page.waitForFunction(()=>window.__shotReady);assert(await page.locator('.ar').count()>3,'profile activity');await page.getByRole('button').click();assert((await page.getByRole('button').innerText()).includes('Saved'),'memory bookmark');
}finally{await browser.close()}
console.log('PASS: dossier equality; vendor hash; shell '+shell.bytes+' B; output-only writes; screenshots; direct routes; filter restoration; windowed scroll; profile bookmark.');
