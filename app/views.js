// Four compact public surfaces; ranking values come directly from the leaderboard.
import {esc,count,money,shortDate,remaining,accepting,statusOf,bountyURL,profileURL} from './format.js';
const pot = b => money(b.potUsd ?? b.rewardAmount);
const fee = b => Number(b.entryFeeUsd ?? b.entryFeesUsd) ? money(b.entryFeeUsd ?? b.entryFeesUsd) : 'Free';
const badge = b => {const [label,tone] = statusOf(b); return `<span class="status ${tone}">${label}</span>`;};
const rankingURL = b => bountyURL(b.slug) + '/leaderboard?phase=dev&view=performance';
export const sortBoardItems = (items, now = Date.now()) => [...items].sort((a,b) => Number(accepting(b,now))-Number(accepting(a,now)) || (accepting(a,now) ? Date.parse(a.deadline)-Date.parse(b.deadline) : Date.parse(b.deadline)-Date.parse(a.deadline)));
function deadlineRail(items) {
  const now = Date.now(), groups = [];
  for (const b of items.filter(b => accepting(b,now) && Date.parse(b.deadline)-now <= 604800000).slice(0,5)) {
    const group = groups.at(-1);
    if (group && Date.parse(b.deadline)-Date.parse(group[0].deadline) < 7200000) group.push(b);
    else groups.push([b]);
  }
  return `<section class="rail-wrap"><div class="rail-label"><b>DEADLINES</b><span>Next 7 days</span></div><div class="rail">${groups.map(group => {
    const first = group[0], title = group.length > 1 ? `${group.length} closing · ${shortDate(first.deadline)}` : first.title.replace(/^(build |make |the best |best |the )/i,'');
    return `<a class="rail-marker ${Date.parse(first.deadline)-now < 86400000 ? 'urgent' : ''}" href="${bountyURL(first.slug)}" title="${esc(group.map(b=>b.title).join(' · '))}"><b>${esc(title)}</b><span>${group.map(b=>`${pot(b)} · ${remaining(b.deadline,now)}`).join(' / ')}</span></a>`;
  }).join('') || '<span>No closing dates in the next week</span>'}</div></section>`;
}
export function boardRows(items) {
  return items.map(b => `<a class="board-row" href="${bountyURL(b.slug)}"><span class="title-cell"><b>${esc(b.title)}</b><small>${esc(b.category || 'General')} · ${(b.skills || []).slice(0,2).map(esc).join(' / ')}</small></span><strong>${pot(b)}</strong><span>${fee(b)}</span><span class="deadline-cell"><b data-deadline="${esc(b.deadline)}">${remaining(b.deadline)}</b><small>${shortDate(b.deadline)} UTC</small></span><span>${count(b.submissionCount)}</span>${badge(b)}</a>`).join('');
}
export function boardView(data) {
  const items = sortBoardItems(data.items || []);
  const categories = [...new Set(items.map(b=>b.category).filter(Boolean))].sort();
  return `<section class="hero"><div><p class="eyebrow">MAKE.FUN / PUBLIC BOUNTIES</p><h1>Bounty timetable</h1></div><p class="hero-note"><b>${items.filter(b=>accepting(b)).length}</b> accepting entries<br>Escrowed prizes · payouts follow published results</p></section>${deadlineRail(items)}<section class="board"><div class="board-head"><div><h2>Available work</h2><span>Open first · nearest deadline first</span></div><input id="search" type="search" placeholder="Search bounties" aria-label="Search bounties"><select id="category" aria-label="Category"><option value="">All categories</option>${categories.map(c=>`<option>${esc(c)}</option>`).join('')}</select><div class="filters" role="group" aria-label="Status">${['All','Open','Ended'].map(s=>`<button data-filter="${s.toLowerCase()}" aria-pressed="${s==='All'}">${s}</button>`).join('')}</div></div><div class="column-head"><span>BOUNTY</span><span>POT</span><span>FEE</span><span>DEADLINE / LEFT</span><span>ENTRIES</span><span>STATUS</span></div><div id="board-list">${boardRows(items)}</div><p id="result-count"></p></section>`;
}
function payouts(b) {
  const rewards = b.rewardsNow || b.rewards || [];
  const list = Array.isArray(rewards) ? rewards : Object.entries(rewards).map(([place,amountUsd])=>({place,amountUsd}));
  return list.slice(0,5).map((r,i)=>`<tr><td>${esc(r.place ?? r.rank ?? i+1)}</td><td>${esc(r.title ?? r.label ?? `Place ${i+1}`)}</td><td>${money(r.amountUsd ?? r.amount ?? r.prizeUsd)}</td></tr>`).join('') + (list.length>5 ? `<tr><td colspan="3">And ${list.length-5} more places</td></tr>` : '') || `<tr><td>Prize</td><td>Live bounty pot</td><td>${pot(b)}</td></tr>`;
}
export function bountyView(b) {
  return `<div class="crumb"><a href="#/">← All bounties</a><a href="${rankingURL(b)}">View leaderboard →</a></div><section class="detail-head"><div><p class="eyebrow">${esc(b.category || 'BOUNTY')} · ${esc(b.sponsor?.name || 'MAKE.FUN')}</p><h1>${esc(b.title)}</h1><p class="summary">${esc(b.summary || b.description?.split('\n')[0] || '')}</p></div>${badge(b)}</section><div class="trust-strip"><b>Escrow-backed prize</b><span>Funds held for published results</span><span>Read-only public listing</span></div><section class="metrics">${[['LIVE POT',pot(b)],['ENTRY FEE',fee(b)],['ENTRIES',count(b.submissionCount)],[accepting(b)?'DEADLINE':'CLOSED',`${shortDate(b.deadline)} · ${remaining(b.deadline)}`]].map(([label,value])=>`<div><small>${label}</small><b>${value}</b></div>`).join('')}</section><div class="detail-grid"><article><h2>Challenge brief</h2><div class="description">${esc(b.description || b.rules || 'No description published.')}</div>${b.rules && b.rules!==b.description ? `<h2>Rules</h2><div class="description">${esc(b.rules)}</div>` : ''}</article><aside><h2>Prize schedule</h2><table class="payout-table"><thead><tr><th>PLACE</th><th>AWARD</th><th>AMOUNT</th></tr></thead><tbody>${payouts(b)}</tbody></table><p class="aside-note">Live pot: ${pot(b)} · ${esc(b.escrowLifecycle?.state || 'Escrow status not provided')}</p><a href="${rankingURL(b)}">Open leaderboard →</a></aside></div>`;
}
export function leaderboardView(b,data,phase,view) {
  const columns = (data.columns || []).filter(c=>!c.hidden).slice(0,2);
  return `<div class="crumb"><a href="${bountyURL(b.slug)}">← ${esc(b.title)}</a><a href="#/">All bounties →</a></div><section class="ranking-head"><div><p class="eyebrow">PUBLIC RESULTS · PAGE SNAPSHOT</p><h1>Leaderboard</h1><p>${esc(b.title)} · ${esc(data.phase?.title || phase)}</p></div><div class="selects"><label>Phase<select id="phase">${(b.phases?.length ? b.phases : [{key:phase,title:phase}]).map(p=>`<option value="${esc(p.key)}" ${p.key===phase?'selected':''}>${esc(p.title)}</option>`).join('')}</select></label><label>View<select id="rank-view">${['performance','overall'].map(v=>`<option value="${v}" ${v===view?'selected':''}>${v==='performance'?'Performance':'Overall'}</option>`).join('')}</select></label></div></section><div class="table-scroll"><table class="ranking-table"><thead><tr><th>RANK</th><th>BUILDER / ENTRY</th>${columns.map(c=>`<th>${esc(c.title)}</th>`).join('')}</tr></thead><tbody>${(data.entries || []).map(e=>`<tr><td class="rank">${esc(e.rank ?? '—')}</td><td><a class="builder-name" href="${profileURL(e.handle)}">@${esc(e.handle ?? '—')}</a><small>${esc(e.title ?? e.submission_id ?? '')}</small></td>${columns.map(c=>`<td>${esc(e.display?.[c.key] ?? e.values?.[c.key] ?? '—')}</td>`).join('')}</tr>`).join('') || '<tr><td colspan="4">No public rankings for this view.</td></tr>'}</tbody></table></div><p class="aside-note">Scores and names are the fields returned by the public leaderboard endpoint.</p>`;
}
export function profileView(p) {
  const r=p.record || {};
  return `<div class="crumb"><a href="#/">← All bounties</a></div><section class="profile-head"><span class="avatar">@</span><div><p class="eyebrow">PUBLIC BUILDER PROFILE</p><h1>${esc(p.display_name || '@'+p.handle)}</h1><p>${esc(p.bio || 'No public bio.')}</p></div></section><section class="profile-stats">${[['Entered',count(r.competitions_entered)],['Placed',count(r.competitions_placed)],['Wins',count(r.competitions_won)],['Prizes',money(r.prize_usd)]].map(([label,value])=>`<div><b>${value}</b><span>${label}</span></div>`).join('')}</section><section class="activity"><h2>Recent entries</h2>${(p.solutions || []).map(s=>`<a href="${bountyURL(s.competition?.slug)}"><strong>${esc(s.title)}</strong><span>${esc(s.competition?.title || s.competition?.slug)}</span><small>${s.placement ? 'Place '+esc(s.placement) : 'Submission'} · ${shortDate(s.entered_at)}</small></a>`).join('') || '<p>No public entries.</p>'}</section>`;
}
