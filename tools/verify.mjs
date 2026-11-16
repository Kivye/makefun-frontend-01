// Feature: live API and renderer contract checks for the dense v4 surfaces.
import assert from 'node:assert/strict';
import { boardAPI, bountyAPI, leaderboardAPI, profileAPI, request } from '../app/api.js';
import { accepting, esc, remaining, statusOf } from '../app/format.js';
import { boardRows, boardView, bountyView, leaderboardView, profileView, sortBoardItems } from '../app/views.js';
assert.equal(remaining('2020-01-01'), 'Ended');
assert.equal(accepting({ status: 'open', deadline: '2020-01-01', acceptingSubmissions: true }), false);
assert.equal(accepting({ status: 'open', deadline: '2099-01-01', acceptingSubmissions: false }), false);
assert.deepEqual(statusOf({ status: 'open', deadline: new Date(Date.now() + 12 * 3600000).toISOString() }), ['CLOSING SOON', 'soon']);
assert.equal(esc('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
const sortNow = Date.parse('2026-11-15T12:00:00Z');
assert.deepEqual(sortBoardItems([{ slug: 'later', status: 'open', deadline: '2026-11-18T12:00:00Z' }, { slug: 'soon', status: 'open', deadline: '2026-11-16T00:00:00Z' }, { slug: 'ended', status: 'paid', deadline: '2026-11-14T00:00:00Z' }], sortNow).map(x => x.slug), ['soon', 'later', 'ended']);
const [board, bounty, leaderboard, profile] = await Promise.all([boardAPI(), bountyAPI('makefun-frontend-01'), leaderboardAPI('threejs-fps-02', 'dev', 'performance'), profileAPI('zkhiel')]);
assert.ok(board.items.length >= 12);
assert.match(boardView(board), /Next 7 days/);
assert.ok((boardRows(board.items).match(/class="board-row"/g) || []).length >= 12);
assert.match(bountyView(bounty), /payout-table/);
assert.match(bountyView(bounty), /Escrow-backed prize/);
assert.doesNotMatch(bountyView(bounty), /\[object Object\]/);
assert.notEqual(statusOf({ status: 'open', walletPaid: true, deadline: '2099-01-01' })[0], 'PAID');
assert.doesNotMatch(bountyView(bounty), /checklist/);
assert.match(leaderboardView(await bountyAPI('threejs-fps-02'), leaderboard, 'dev', 'performance'), /builder-name/);
assert.match(profileView(profile), /profile-stats/);
const originalFetch = globalThis.fetch; let calls = 0;
globalThis.fetch = async (_url, options) => { calls++; assert.equal(options.credentials, 'omit'); return new Response('{"ok":true}', { status: 200 }); };
try { const path = `/verify-cache-${Date.now()}`; await Promise.all([request(path), request(path)]); assert.equal(calls, 1); } finally { globalThis.fetch = originalFetch; }
console.log(`PASS: live API data, ${board.items.length} board rows, compact payout, leaderboard and profile renderers`);
