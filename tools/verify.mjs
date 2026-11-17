import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {browser} from './shoot.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,process.env.MAKEFUN_OUTPUT_DIR||'out');
const bytes=gzipSync(await readFile(join(out,'app/index.html')),{level:9}).length;
assert.equal(JSON.parse(await readFile(join(out,'app/shell.json'))).bytes,bytes);assert(bytes<=3600);const source=await readFile(join(root,'main.ts'),'utf8');for(const line of source.split('\n').filter(l=>/await (writeFile|mkdir|cp)/.test(l)))assert(/output/.test(line),'Every write must target output');
const b=await browser(),p=await b.newPage({viewport:{width:1280,height:800}});let foot;
for(const route of ['#/','#/bounty/makefun-frontend-01','#/leaderboard/threejs-fps-02','#/profile/Kivye']){await p.goto('http://127.0.0.1:8081/'+route);await p.waitForFunction(()=>window.__shotReady===true,null,{timeout:90000});assert(await p.locator('.row').count()>0);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);let f=await p.locator('footer').innerText();if(foot)assert.equal(f,foot);foot=f;if(route.includes('leaderboard'))assert(await p.locator('.rank').count()>10);if(route.includes('bounty')){assert(await p.locator('.reward').count()>0);assert((await p.locator('article').innerText()).includes('1 in'))}console.log('PASS',route)}
for(const name of ['1-board.jpg','2-bounty.jpg','3-leaderboard.jpg'])assert((await stat(join(root,'screenshots',name))).size<=256*1024);await b.close();console.log('PASS shell',bytes,'B gzip-9; output-only build writes; all routes');
