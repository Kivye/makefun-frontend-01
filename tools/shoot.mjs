// Capture the three real API surfaces, then exercise filtering and direct routes.
import {createRequire} from 'node:module';
import {readFile,mkdir,stat,readdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=fileURLToPath(new URL('../',import.meta.url));
const shots=JSON.parse(await readFile(root+'shots.json','utf8'));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],proxy:{server:'http://127.0.0.1:18080',bypass:'<-loopback>'}});
try {
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await mkdir(root+'screenshots',{recursive:true});
  for(const file of await readdir(root+'screenshots')) if(!shots.some(s=>s.file===file))await rm(root+'screenshots/'+file);
  for(const shot of shots) {
    await page.goto('http://127.0.0.1:8081/'+shot.route,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__shotReady===true,null,{timeout:60000});
    await page.locator(shot.expect).first().waitFor();
    if(await page.locator('.error').count()) throw Error('API error surface');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Desktop overflow');
    await page.screenshot({path:root+'screenshots/'+shot.file,type:'jpeg',quality:82});
    const size=(await stat(root+'screenshots/'+shot.file)).size;
    if(size>262144)throw Error('JPEG exceeds cap');
    console.log(shot.file+': '+size+' bytes; '+await page.locator('#load-chip').innerText());
  }
  if(requests.filter(url=>url.includes('/profiles/')).length)throw Error('Leaderboard profile fan-out');
  await page.goto('http://127.0.0.1:8081/#/');await page.waitForFunction(()=>window.__shotReady===true);
  console.log('Complete visible rows: '+await page.locator('.board-row').evaluateAll(rows=>rows.filter(r=>r.getBoundingClientRect().bottom<=800).length));
  await page.locator('#search').fill('zzzz-no-match');
  if(await page.locator('.board-row').count())throw Error('Search failed');
  await page.locator('#search').fill('');
  await page.locator('[data-filter="open"]').click();
  if(await page.locator('.board-row .ended,.board-row .paid').count())throw Error('Open filter failed');
  await page.goto('http://127.0.0.1:8081/#/profile/zkhiel');await page.waitForFunction(()=>window.__shotReady===true);await page.locator('.profile-stats').waitFor();
  await page.setViewportSize({width:390,height:800});
  await page.goto('http://127.0.0.1:8081/#/');await page.waitForFunction(()=>window.__shotReady===true);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS: filters, direct profile, no ranking fan-out, mobile containment, no page exceptions');
} finally {await browser.close();}
