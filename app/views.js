// Feature: dense deadline rail, decision-ready board, payout summary, rankings and builder profile.
import { accepting, bountyURL, count, date, esc, money, profileURL, remaining, shortDate, statusOf } from './format.js';

const chip = bounty => { const [label, tone] = statusOf(bounty); return `<span class="status ${tone}">${label}</span>`; };
const pot = bounty => money(bounty.potUsd ?? bounty.rewardAmount);
export function sortBoardItems(items, now = Date.now()) {
  return [...items].sort((a, b) => Number(accepting(b, now)) - Number(accepting(a, now)) || (accepting(a, now) ? Date.parse(a.deadline) - Date.parse(b.deadline) : Date.parse(b.deadline) - Date.parse(a.deadline)));
}
function rail(items, now = Date.now()) {
  const start = now, end = now + 7 * 86400000;
  const upcoming = sortBoardItems(items.filter(b => accepting(b, now) && Date.parse(b.deadline) >= now && Date.parse(b.deadline) <= end), now).slice(0, 5);
  const groups = [];
  for (const item of upcoming) {
    const last = groups.at(-1);
    if (last && Date.parse(item.deadline) - Date.parse(last[0].deadline) < 2 * 3600000) last.push(item);
    else groups.push([item]);
  }
  const shortTitle = title => String(title).replace(/^(Build |Make |The )/i, '').replace(/^the best /i, '').replace(/^best /i, '');
  const markers = groups.map(group => {
    const first = group[0], hrs = (Date.parse(first.deadline) - now) / 3600000;
    const label = group.length > 1 ? `${group.length} closing · ${shortDate(first.deadline)}` : shortTitle(first.title);
    return `<a class="rail-marker ${hrs < 24 ? 'urgent' : ''}" href="${bountyURL(first.slug)}" title="${esc(group.map(x => x.title).join(' · '))}"><b>${esc(label)}</b><span>${group.map(x => `${pot(x)} · ${remaining(x.deadline, now)}`).join(' / ')}</span></a>`;
  }).join('');
  return `<section class="rail-wrap"><div class="rail-label"><strong>DEADLINES</strong><span>Next 7 days</span></div><div class="rail">${markers || '<span class="rail-empty">No closing dates in the next week</span>'}</div></section>`;
}

export function boardRows(items) {
  return items.map(b => `<a class="board-row" href="${bountyURL(b.slug)}"><span class="title-cell"><b>${esc(b.title)}</b><small>${esc(b.category || 'General')} · ${(b.skills || []).slice(0, 2).map(esc).join(' / ')}</small></span><strong class="pot-cell">${pot(b)}</strong><span>${Number(b.entryFeeUsd ?? b.entryFeesUsd) ? money(b.entryFeeUsd ?? b.entryFeesUsd) : 'Free'}</span><span class="deadline-cell"><b class="countdown" data-deadline="${esc(b.deadline)}">${remaining(b.deadline)}</b><small>${shortDate(b.deadline)} UTC</small></span><span>${count(b.submissionCount)}</span>${chip(b)}</a>`).join('');
}
export function boardView(data) {
  const items = sortBoardItems(data.items || []), open = items.filter(b => accepting(b)).length;
  const categories = [...new Set(items.map(b => b.category).filter(Boolean))].sort();
  return `<section class="hero"><div><p class="eyebrow">MAKE.FUN / PUBLIC BOUNTIES</p><h1>Bounty timetable</h1></div><p class="hero-note"><b>${open}</b> accepting entries<br>Escrowed prizes · payouts follow published results</p></section>${rail(items)}<section class="board"><div class="board-head"><div><h2>Available work</h2><span>Open first · nearest deadline first</span></div><label class="search"><span>⌕</span><input id="search" type="search" placeholder="Search bounties" aria-label="Search bounties"></label><select id="category" aria-label="Filter category"><option value="">All categories</option>${categories.map(x => `<option>${esc(x)}</option>`).join('')}</select><div class="filters" role="group" aria-label="Status filter"><button data-filter="all" aria-pressed="true">All</button><button data-filter="open" aria-pressed="false">Open</button><button data-filter="ended" aria-pressed="false">Ended</button></div></div><div class="column-head"><span>BOUNTY</span><span>POT</span><span>FEE</span><span>DEADLINE / LEFT</span><span>ENTRIES</span><span>STATUS</span></div><div id="board-list">${boardRows(items)}</div><p id="result-count" class="result-count"></p></section>`;
}
function payoutRows(bounty) {
  const prizes = bounty.rewardsNow || bounty.rewards || [], list = Array.isArray(prizes) ? prizes : Object.entries(prizes).map(([place, amountUsd]) => ({ place, amountUsd }));
  const rows = list.slice(0, 5).map((reward, i) => `<tr><td>${esc(reward.place ?? reward.rank ?? i + 1)}</td><td>${esc(reward.title ?? reward.label ?? `Place ${i + 1}`)}</td><td>${money(reward.amountUsd ?? reward.amount ?? reward.prizeUsd)}</td></tr>`).join('');
  return `${rows}${list.length > 5 ? `<tr><td colspan="3" class="muted">And ${list.length - 5} more places</td></tr>` : ''}${!list.length ? `<tr><td>Prize</td><td>Live bounty pot</td><td>${pot(bounty)}</td></tr>` : ''}`;
}
export function bountyView(bounty) {
  const acceptingEntries = accepting(bounty);
  return `<div class="crumb"><a href="#/">← All bounties</a><a href="${bountyURL(bounty.slug)}/leaderboard?phase=dev&view=performance">View leaderboard →</a></div><section class="detail-head"><div><p class="eyebrow">${esc(bounty.category || 'BOUNTY')} · ${esc(bounty.sponsor?.name || 'MAKE.FUN')}</p><h1>${esc(bounty.title)}</h1><p class="summary">${esc(bounty.summary || bounty.description?.split('\n')[0] || '')}</p></div>${chip(bounty)}</section><div class="trust-strip"><b>Escrow-backed prize</b><span>Funds held for published results</span><span>Read-only public listing</span></div><section class="metrics"><div><small>LIVE POT</small><b>${pot(bounty)}</b></div><div><small>ENTRY FEE</small><b>${Number(bounty.entryFeeUsd ?? bounty.entryFeesUsd) ? money(bounty.entryFeeUsd ?? bounty.entryFeesUsd) : 'Free'}</b></div><div><small>ENTRIES</small><b>${count(bounty.submissionCount)}</b></div><div><small>${acceptingEntries ? 'DEADLINE' : 'CLOSED'}</small><b>${shortDate(bounty.deadline)} · ${remaining(bounty.deadline)}</b></div></section><div class="detail-grid"><article><h2>Challenge brief</h2><div class="description">${esc(bounty.description || bounty.rules || 'No description published.').replace(/\n/g, '<br>')}</div>${bounty.rules && bounty.rules !== bounty.description ? `<h2>Rules</h2><div class="description">${esc(bounty.rules).replace(/\n/g, '<br>')}</div>` : ''}</article><aside><h2>Prize schedule</h2><table class="payout-table"><thead><tr><th>PLACE</th><th>AWARD</th><th>AMOUNT</th></tr></thead><tbody>${payoutRows(bounty)}</tbody></table><p class="aside-note">Live pot: ${pot(bounty)} · ${esc(bounty.escrowLifecycle?.state || 'Escrow status not provided')}</p><a class="text-link" href="${bountyURL(bounty.slug)}/leaderboard?phase=dev&view=performance">Open leaderboard →</a></aside></div>`;
}
export function leaderboardView(bounty, data, phase, view) {
  const entries = data.entries || [], columns = (data.columns || []).filter(c => !c.hidden).slice(0, 2);
  const headers = columns.map(c => `<th>${esc(c.title)}</th>`).join('');
  const rows = entries.map((entry, i) => `<tr><td class="rank">${entry.rank ?? i + 1}</td><td><a class="builder-name" href="${profileURL(entry.handle)}">@${esc(entry.handle || 'unknown')}</a><small>${esc(entry.title || entry.submission_id || '')}</small></td><td>${esc(entry.display?.[columns[0]?.key] ?? entry.values?.[columns[0]?.key] ?? entry.status ?? '—')}</td>${columns[1] ? `<td>${esc(entry.display?.[columns[1].key] ?? entry.values?.[columns[1].key] ?? '—')}</td>` : ''}</tr>`).join('');
  return `<div class="crumb"><a href="${bountyURL(bounty.slug)}">← ${esc(bounty.title)}</a><a href="#/">All bounties →</a></div><section class="ranking-head"><div><p class="eyebrow">PUBLIC RESULTS · PAGE SNAPSHOT</p><h1>Leaderboard</h1><p>${esc(bounty.title)} · ${esc(data.phase?.title || phase)}</p></div><div class="selects"><label>Phase <select id="phase">${(bounty.phases || []).map(p => `<option value="${esc(p.key)}" ${p.key === phase ? 'selected' : ''}>${esc(p.title)}</option>`).join('') || `<option>${esc(phase)}</option>`}</select></label><label>View <select id="rank-view"><option value="performance" ${view === 'performance' ? 'selected' : ''}>Performance</option><option value="overall" ${view === 'overall' ? 'selected' : ''}>Overall</option></select></label></div></section><div class="table-scroll"><table class="ranking-table"><thead><tr><th>RANK</th><th>BUILDER / ENTRY</th>${headers}</tr></thead><tbody>${rows || '<tr><td colspan="5">No public rankings for this view.</td></tr>'}</tbody></table></div><p class="aside-note">Scores and names are the fields returned by the public leaderboard endpoint.</p>`;
}
export function profileView(profile) {
  const record = profile.record || {}, solutions = profile.solutions || [], image = profile.avatar?.url || profile.image;
  return `<div class="crumb"><a href="#/">← All bounties</a></div><section class="profile-head">${image ? `<img crossorigin="anonymous" src="${esc(image.startsWith('/') ? `https://make.fun${image}` : image)}" alt="">` : '<span class="avatar-fallback">@</span>'}<div><p class="eyebrow">PUBLIC BUILDER PROFILE</p><h1>${esc(profile.display_name || `@${profile.handle}`)}</h1><p>${esc(profile.bio || 'No public bio.')}</p></div></section><section class="profile-stats"><div><b>${count(record.competitions_entered)}</b><span>Entered</span></div><div><b>${count(record.competitions_placed)}</b><span>Placed</span></div><div><b>${count(record.competitions_won)}</b><span>Wins</span></div><div><b>${money(record.prize_usd)}</b><span>Prizes</span></div></section><section class="activity"><h2>Recent entries</h2>${solutions.map(s => `<a href="${bountyURL(s.competition?.slug)}"><span>${esc(s.title)}</span><b>${esc(s.competition?.title || s.competition?.slug || 'Bounty')}</b><small>${s.placement ? `Place ${esc(s.placement)}` : 'Submission'} · ${esc(s.entered_at ? shortDate(s.entered_at) : '')}</small></a>`).join('') || '<p>No public entries.</p>'}</section>`;
}
