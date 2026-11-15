import { createRequire } from 'node:module';
import { readFile, mkdir, stat, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = fileURLToPath(new URL('../',import.meta.url));
const shots = JSON.parse(await readFile(join(root,'shots.json'),'utf8'));
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox'],proxy:{server:process.env.SHOT_PROXY || 'http://127.0.0.1:18080'}});
const staging = join(root,'test-results','live-shots');
await mkdir(staging,{recursive:true});
try {
  for (const shot of shots) {
    const page = await browser.newPage({viewport:shot.viewport,deviceScaleFactor:1});
    page.on('response', response => { if (response.url().startsWith('https://make.fun/api/')) console.log(response.status(), response.url()); });
    const errors = []; page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:8081/' + shot.route);
    await page.waitForFunction(()=>window.__shotReady === true,{},{timeout:150000});
    await page.waitForTimeout(700);
    const required = shot.route.includes('/leaderboard') ? '.builder-link' : shot.route === '#/' ? '.bounty-row' : '.metric-strip';
    if (!await page.locator(required).count()) throw new Error('Live data is missing: ' + shot.route);
    if (errors.length) throw new Error(errors.join('\n'));
    const file = join(staging,shot.file);
    await page.screenshot({path:file,type:'jpeg',quality:82,fullPage:false});
    if ((await stat(file)).size > 262144) throw new Error('Screenshot exceeds cap: ' + shot.file);
    await page.close();
  }
  await mkdir(join(root,'screenshots'),{recursive:true});
  const { copyFile } = await import('node:fs/promises');
  for (const shot of shots) await copyFile(join(staging,shot.file),join(root,'screenshots',shot.file));
  console.log('Captured 3 unmodified live screenshots');
} finally { await browser.close(); await rm(staging,{recursive:true,force:true}); }
