// Live contracts cover deadline semantics, escaping, API fields and shared requests.
import assert from 'node:assert/strict';
import {boardAPI,bountyAPI,leaderboardAPI,profileAPI,request} from '../app/api.js';
import {accepting,remaining,esc,statusOf} from '../app/format.js';
import {boardView,bountyView,leaderboardView,profileView,sortBoardItems} from '../app/views.js';
assert.equal(accepting({status:'open',deadline:'2020-01-01',acceptingSubmissions:true}),false);
assert.equal(accepting({status:'open',deadline:'2099-01-01',acceptingSubmissions:false}),false);
assert.equal(remaining('2020-01-01'),'Ended');
assert.equal(esc('<script>'),'&lt;script&gt;');
assert.equal(statusOf({status:'open',deadline:'2099-01-01',walletPaid:true})[0],'OPEN');
assert.deepEqual(sortBoardItems([{slug:'ended',deadline:'2020-01-01'},{slug:'open',deadline:'2099-01-01'}]).map(b=>b.slug),['open','ended']);
const [board,bounty,ranking,profile,competition]=await Promise.all([boardAPI(),bountyAPI('makefun-frontend-01'),leaderboardAPI('threejs-fps-02','dev','performance'),profileAPI('zkhiel'),bountyAPI('threejs-fps-02')]);
assert.ok(board.items.length>=12);assert.match(boardView(board),/Next 7 days/);
assert.match(bountyView(bounty),/payout-table/);assert.doesNotMatch(bountyView(bounty),/\[object Object\]|checklist/);
assert.match(leaderboardView(competition,ranking,'dev','performance'),/builder-name/);
assert.match(profileView(profile),/profile-stats/);
const native=globalThis.fetch;let calls=0;
globalThis.fetch=async(_url,options)=>{calls++;assert.equal(options.method,'GET');assert.equal(options.credentials,'omit');return new Response('{"verified":true}');};
try {await Promise.all([request('/verify-local-cache'),request('/verify-local-cache')]);assert.equal(calls,1);}finally{globalThis.fetch=native;}
console.log(`PASS: ${board.items.length} live board records, four renderers and GET cache contract`);
