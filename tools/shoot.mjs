// Feature: captures three live make.fun routes and replaces the screenshot set only after every check passes.
import { createRequire } from 'node:module';
import { readFile, mkdir, stat, rm, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=fileURLToPath(new URL('../',import.meta.url));
const shots=JSON.parse(await readFile(join(root,'shots.json'),'utf8'));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],proxy:{server:process.env.SHOT_PROXY||'http://127.0.0.1:18080'}});
const staging=join(root,'test-results','live-shots');
await mkdir(staging,{recursive:true});
let commonFooter='';
try {
  const page=await browser.newPage({viewport:shots[0].viewport,deviceScaleFactor:1});
  const errors=[],apiResponses=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.url().startsWith('https://make.fun/api/'))apiResponses.push({status:response.status(),url:response.url()});});
  for(const shot of shots){
    if(!commonFooter)await page.goto('http://127.0.0.1:8081/'+shot.route);
    else await page.evaluate(route=>{window.__shotReady=false;location.hash=route},shot.route);
    await page.waitForFunction(()=>window.__shotReady===true,{},{timeout:150000});
    await page.waitForTimeout(500);
    const footer=await page.locator('.meta-footer').innerText();
    if(commonFooter&&footer!==commonFooter)throw new Error(`Footer metadata differs on ${shot.route}: ${footer}`);
    commonFooter=footer;
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Horizontal overflow: '+shot.route);
    if(!apiResponses.length||apiResponses.some(r=>r.status!==200))throw new Error('A public API response failed: '+JSON.stringify(apiResponses));
    if(shot.route==='#/'){
      if(await page.locator('.bounty-row').count()<12)throw new Error('The board has fewer than 12 API rows.');
      if(await page.locator('.filter-pill[aria-pressed="true"]').count()!==1)throw new Error('The board status filter is not visibly selected.');
      if(!(await page.locator('#load-chip').innerText()).includes('gzip'))throw new Error('Measured gzip size is missing.');
      const first=page.locator('.bounty-row').first();
      if(!await first.locator('.status.open,.status.soon,.status.urgent').count())throw new Error('The first board row is not accepting entries.');
      if(/Past deadline|Ended/.test(await first.locator('.countdown').innerText()))throw new Error('The first board row has no live countdown.');
    }else if(shot.route.includes('/leaderboard')){
      if(!await page.locator('.builder-name').count())throw new Error('Live leaderboard rows are missing.');
      if(!await page.locator('.ranking-table th').filter({hasText:'TOTAL EARNED'}).count())throw new Error('Money columns are missing from the leaderboard.');
    }else if(shot.route.includes('/bounty/')){
      if(!await page.locator('.bounty-metrics').count()||!await page.locator('.trust-strip').count()||!await page.locator('.reward-bars').count())throw new Error('Bounty trust or rewards content is missing.');
      if(!await page.locator('.checklist input[type=checkbox]').count())throw new Error('The participation checklist is missing.');
    }
    if(errors.length)throw new Error(errors.join('\n'));
    for(const item of apiResponses)console.log(item.status,item.url);
    const file=join(staging,shot.file);
    await page.screenshot({path:file,type:'jpeg',quality:82,fullPage:false});
    if((await stat(file)).size>262144)throw new Error('Screenshot exceeds cap: '+shot.file);
  }
  await page.close();
  const profile=await browser.newPage({viewport:{width:1280,height:800}});
  const profileErrors=[];
  profile.on('pageerror',error=>profileErrors.push(error.message));
  await profile.goto('http://127.0.0.1:8081/#/profile/zkhiel');
  await profile.waitForFunction(()=>window.__shotReady===true,{},{timeout:150000});
  for(const selector of ['.activity-grid','.activity-list .activity-item','.badge-shelf','.payout-proof']){
    if(!await profile.locator(selector).count())throw new Error(`Profile surface is missing ${selector}`);
  }
  await profile.setViewportSize({width:390,height:844});
  await profile.waitForFunction(()=>Array.from(document.querySelectorAll('link[rel=stylesheet]')).some(link=>link.href.endsWith('/mobile.css')&&link.sheet));
  if(await profile.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('The mobile profile has horizontal overflow.');
  if(profileErrors.length)throw new Error(profileErrors.join('\n'));
  await profile.close();
  const directory=join(root,'screenshots');
  await mkdir(directory,{recursive:true});
  for(const shot of shots)await copyFile(join(staging,shot.file),join(directory,shot.file));
  console.log('Captured 3 live screenshots with matching footer metadata.');
}finally{await browser.close();await rm(staging,{recursive:true,force:true});}
