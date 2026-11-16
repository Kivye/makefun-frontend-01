import {createRequire} from 'node:module';
import {readFile,readdir,mkdir,rm,stat} from 'node:fs/promises';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url), {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=fileURLToPath(new URL('../',import.meta.url)), cache=homedir()+'/.cache/ms-playwright';
const candidates=await readdir(cache);
const chromiumDir=candidates.find(name=>name.startsWith('chromium-'));
const executable=process.env.CHROMIUM_PATH||cache+'/'+chromiumDir+'/chrome-linux/chrome';
const shots=JSON.parse(await readFile(root+'shots.json','utf8'));
const browser=await chromium.launch({executablePath:executable,headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],proxy:{server:'http://127.0.0.1:18080',bypass:'<-loopback>'}});
try {
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const errors=[],urls=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>urls.push(r.url()));
  await mkdir(root+'screenshots',{recursive:true});
  for (const file of await readdir(root+'screenshots')) if (!shots.some(s=>s.file===file)) await rm(root+'screenshots/'+file);
  async function ready(route,selector) {
    await page.goto('http://127.0.0.1:8081/'+route,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__shotReady===true,null,{timeout:60000});
    await page.locator(selector).first().waitFor();
    if (await page.locator('.error').count()) throw Error('Public API failed');
    if (await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Horizontal overflow');
  }
  for (const shot of shots) {
    await ready(shot.route,shot.expect);
    await page.screenshot({path:root+'screenshots/'+shot.file,type:'jpeg',quality:82});
    const size=(await stat(root+'screenshots/'+shot.file)).size;
    if (size>262144) throw Error('Oversize JPEG: '+shot.file);
    console.log(shot.file+': '+size+' bytes; '+await page.locator('#load-chip').innerText());
  }
  if (urls.some(url=>url.includes('/profiles/'))) throw Error('Unexpected ranking profile request');
  await ready('#/','.board-row');
  console.log('Visible complete rows: '+await page.locator('.board-row').evaluateAll(rows=>rows.filter(row=>row.getBoundingClientRect().bottom<=800).length));
  await page.locator('#search').fill('no-such-bounty-zzzz');
  if (await page.locator('.board-row').count()) throw Error('Search did not filter');
  await page.locator('#search').fill('');await page.locator('[data-filter="open"]').click();
  if (await page.locator('.board-row .ended,.board-row .paid').count()) throw Error('Open filter leaked ended rows');
  await ready('#/profile/zkhiel','.profile-stats');
  await page.setViewportSize({width:390,height:800});await ready('#/','.board-row');
  if (errors.length) throw Error(errors.join('\n'));
  console.log('PASS browser: search, status filter, direct profile, no fan-out, mobile layout, no exceptions');
} finally {await browser.close();}
