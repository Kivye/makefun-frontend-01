import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, extname } from 'node:path';
import { boardView, boardRows, bountyView, leaderboardView, profileView, solutionRows } from '../app/views.js';
import { accepting, remaining, esc, safeURL } from '../app/format.js';
import { get } from '../app/api.js';
const fixtureDir = process.env.MAKEFUN_FIXTURE_DIR;
if (!fixtureDir) throw new Error('Set MAKEFUN_FIXTURE_DIR to the documented public API sample directory.');
const data = {};
for (const kind of ['board','bounty','leaderboard','profile']) data[kind] = JSON.parse(await readFile(join(fixtureDir,kind+'.json'),'utf8'));
assert.equal(accepting({status:'open',deadline:'2020-01-01'}),false);
assert.equal(remaining('2020-01-01'),'Ended');
assert.equal(accepting({status:'resolved',deadline:'2099-01-01'}),false);
assert.equal(safeURL('javascript:alert(1)'),'');
assert.equal(esc('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
assert.match(boardView(data.board),/id="category"/);
assert.match(boardRows(data.board.items),/data-label="Live pot"/);
assert.match(bountyView(data.bounty),/Live amounts, including entry fees/);
assert.match(bountyView(data.bounty),/Key dates/);
const leaderboard = leaderboardView(data.bounty,data.leaderboard,'dev','performance');
assert.equal((leaderboard.match(/class="builder-link"/g)||[]).length,Math.min(10,data.leaderboard.entries.length));
assert.match(leaderboard,/Judge win rate/);
assert.match(profileView(data.profile),/crossorigin="anonymous" src=/);
assert.match(profileView(data.profile),/Payouts/);
assert.ok(solutionRows(data.profile.solutions.slice(0,10)).includes('class="solution"'));
const originalFetch = globalThis.fetch, originalNow = Date.now;
let calls = 0, clock = originalNow(), conditional = false;
Date.now = () => clock;
globalThis.fetch = async (_url,options) => {
  calls++; assert.equal(options.credentials,'omit'); assert.equal(options.method,'GET');
  conditional = options.headers['If-None-Match'] === '"minute"';
  return conditional ? new Response(null,{status:304}) : new Response('{"live":true}',{status:200,headers:{etag:'"minute"'}});
};
try {
  const [a,b] = await Promise.all([get('/cache-test'),get('/cache-test')]);
  assert.deepEqual(a,b); assert.equal(calls,1);
  await get('/cache-test'); assert.equal(calls,1);
  clock += 60001; const c = await get('/cache-test'); assert.equal(c.live,true); assert.equal(calls,2); assert.equal(conditional,true);
  globalThis.fetch = async () => new Response('',{status:404});
  await assert.rejects(get('/missing'),/could not be found/);
} finally { globalThis.fetch = originalFetch; Date.now = originalNow; }
console.log('PASS: four renderers, deadline semantics, API metrics, top-ten cap, escaping, URL safety, request deduplication, cache, ETag 304 and API errors');
if (process.argv.includes('--browser')) {
  const require = createRequire(import.meta.url);
  const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
  const root = fileURLToPath(new URL('../',import.meta.url));
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:800}});
    const errors = []; page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://desk.test/**',async route=>{
      const name = new URL(route.request().url()).pathname.slice(1) || 'index.html';
      const body = await readFile(join(root,'app',name));
      await route.fulfill({body,contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(name)]});
    });
    await page.route('https://make.fun/api/**',async route=>{
      const path = new URL(route.request().url()).pathname;
      const kind = path.includes('/leaderboard') ? 'leaderboard' : path.includes('/profiles/') ? 'profile' : path==='/api/competitions' ? 'board' : 'bounty';
      await route.fulfill({json:data[kind],headers:{'Access-Control-Allow-Origin':'*'}});
    });
    for (const hash of ['#/','#/bounty/threejs-fps-02','#/bounty/threejs-fps-02/leaderboard','#/profile/zkhiel']) {
      await page.goto('https://desk.test/' + hash); await page.waitForFunction(()=>window.__shotReady===true);
      assert.equal(await page.locator('main[aria-busy="false"]').count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
    await page.goto('https://desk.test/#/');await page.waitForFunction(()=>window.__shotReady===true);
    await page.locator('#search').fill('no-such-bounty-93830');assert.equal(await page.locator('.bounty-row').count(),0);
    await page.locator('#search').fill('');assert.ok(await page.locator('.bounty-row').count()>0);
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.deepEqual(errors,[]);
    await mkdir(join(root,'test-results'),{recursive:true});
    await page.screenshot({path:join(root,'test-results','fixture-mobile.jpg'),type:'jpeg',quality:80});
    console.log('PASS: browser deep links, filter, mobile width, no runtime exceptions (FIXTURE DATA, not live screenshots)');
  } finally { await browser.close(); }
}
