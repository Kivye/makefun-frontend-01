// Feature: live API/render checks, request deduplication and optional Chromium route checks.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { boardAPI, bountyAPI, leaderboardAPI, profileAPI, request } from '../app/api.js';
import { boardRows, boardView, sortBoardItems, timetable } from '../app/views.js';
import { bountyView, leaderboardView, profileView, solutionRows } from '../app/detail.js';
import { accepting, esc, remaining, statusOf } from '../app/format.js';

assert.equal(accepting({status:'open',deadline:'2020-01-01'}),false);
assert.equal(accepting({status:'resolved',deadline:'2099-01-01'}),false);
assert.equal(remaining('2020-01-01'),'Ended');
assert.deepEqual(statusOf({status:'open',deadline:new Date(Date.now()+12*3600000).toISOString()}),['CLOSING SOON','urgent']);
assert.equal(esc('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
const sortNow=Date.parse('2026-11-15T12:00:00Z');
const sortCases=[
  {slug:'open-later',status:'open',deadline:'2026-11-18T12:00:00Z'},
  {slug:'judging-soon',status:'judging',deadline:'2026-11-16T00:00:00Z'},
  {slug:'paid-past',status:'paid',deadline:'2026-11-14T00:00:00Z'},
  {slug:'closing-soon',status:'open',deadline:'2026-11-16T00:00:00Z'}
];
assert.deepEqual(sortBoardItems(sortCases,sortNow).map(item=>item.slug),['closing-soon','open-later','paid-past','judging-soon']);

const [board,bounty,leaderboard,profile]=await Promise.all([
  boardAPI(),bountyAPI('makefun-frontend-01'),leaderboardAPI('threejs-fps-02','dev','performance'),profileAPI('zkhiel')
]);
assert.ok(board.items.length>=12,'the live board should contain at least 12 rows');
assert.match(boardView(board),/Your next build/);
assert.match(boardView(board),/Open first, then deadline/);
assert.match(timetable(board.items),/NEXT 14 DAYS/);
assert.ok((boardRows(board.items).match(/class="bounty-row"/g)||[]).length>=12);
assert.match(boardRows(board.items),/CLOSING SOON|JUDGING|PAID|OPEN/);
assert.match(bountyView(bounty),/trust-strip/);
assert.match(bountyView(bounty),/reward-bars/);
assert.match(bountyView(bounty),/Participation checklist/);
assert.match(bountyView(bounty),/Full challenge description/);
const records=Object.fromEntries(await Promise.all((leaderboard.entries||[]).slice(0,10).map(async entry=>[entry.handle,await profileAPI(entry.handle)])));
const rankings=leaderboardView(await bountyAPI('threejs-fps-02'),leaderboard,'dev','performance',records);
assert.match(rankings,/TOTAL EARNED/);
assert.match(rankings,/WIN RATE/);
assert.match(rankings,/STREAK/);
assert.match(rankings,/Tie-break/);
assert.match(profileView(profile),/activity-grid/);
assert.match(profileView(profile),/badge-shelf/);
assert.match(profileView(profile),/payout-proof/);
assert.match(solutionRows(profile.solutions||[]),/activity-item|No activity/);

const originalFetch=globalThis.fetch;
let calls=0;
globalThis.fetch=async(_url,options)=>{
  calls++;
  assert.equal(options.credentials,'omit');
  assert.equal(options.headers.Accept,'application/json');
  assert.equal(options.method||'GET','GET');
  return new Response('{"verified":true}',{status:200});
};
try {
  const path='/verify-cache-'+Date.now();
  const [first,second]=await Promise.all([request(path),request(path)]);
  assert.deepEqual(first,second);assert.equal(calls,1);
  await request(path);assert.equal(calls,1);
} finally { globalThis.fetch=originalFetch; }
console.log(`PASS: live API data, ${board.items.length} board rows, timetable, four renderers and read-only request cache`);

if(process.argv.includes('--browser')){
  const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox'],proxy:{server:process.env.SHOT_PROXY||'http://127.0.0.1:18080'}});
  try {
    const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    for(const hash of ['#/','#/bounty/makefun-frontend-01','#/bounty/threejs-fps-02/leaderboard?phase=dev&view=performance','#/profile/zkhiel']){
      if(!page.url().startsWith('http://127.0.0.1:8081/'))await page.goto('http://127.0.0.1:8081/'+hash);
      else await page.evaluate(route=>{window.__shotReady=false;location.hash=route},hash);
      await page.waitForFunction(()=>window.__shotReady===true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
    for(const width of [900,800,768,700,650,390]){
      await page.setViewportSize({width,height:844});
      if(width<=900)await page.waitForFunction(()=>Array.from(document.querySelectorAll('link[rel=stylesheet]')).some(link=>link.href.endsWith('/mobile.css')&&link.sheet));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`horizontal overflow at ${width}px`);
    }
    assert.deepEqual(errors,[]);
    await page.close();
  } finally { await browser.close(); }
  console.log('PASS: Chromium deep links, mobile layout and no runtime exceptions');
}
