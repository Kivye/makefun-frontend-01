import {esc,count,money,shortDate,remaining,accepting,statusOf,bountyURL,profileURL} from './format.js';
const pot = item => money(item.potUsd ?? item.rewardAmount);
const fee = item => Number(item.entryFeeUsd ?? item.entryFeesUsd) ? money(item.entryFeeUsd ?? item.entryFeesUsd) : 'Free';
const badge = item => {const [text,tone]=statusOf(item); return `<span class="status ${tone}">${text}</span>`;};
const ranking = item => bountyURL(item.slug)+'/leaderboard?phase=dev&view=performance';
export function sortBoardItems(items, now=Date.now()) {
  return [...items].sort((a,b) => Number(accepting(b,now))-Number(accepting(a,now)) || (accepting(a,now) ? Date.parse(a.deadline)-Date.parse(b.deadline) : Date.parse(b.deadline)-Date.parse(a.deadline)));
}
function rail(items) {
  const now=Date.now(), groups=[];
  for (const item of items.filter(b=>accepting(b,now) && Date.parse(b.deadline)-now<=604800000).slice(0,5)) {
    const last=groups.at(-1);
    if (last && Date.parse(item.deadline)-Date.parse(last[0].deadline)<7200000) last.push(item);
    else groups.push([item]);
  }
  return `<section class="rail-wrap"><div class="rail-label"><b>DEADLINES</b><span>Next 7 days</span></div><div class="rail">${groups.map(group=>{
    const item=group[0], title=group.length>1 ? group.length+' closing · '+shortDate(item.deadline) : item.title.replace(/^(build |make |the best |best |the )/i,'');
    return `<a class="rail-marker ${Date.parse(item.deadline)-now<86400000?'urgent':''}" href="${bountyURL(item.slug)}" title="${esc(group.map(b=>b.title).join(' · '))}"><b>${esc(title)}</b><span>${group.map(b=>pot(b)+' · '+remaining(b.deadline,now)).join(' / ')}</span></a>`;
  }).join('') || '<span>No deadlines within this week</span>'}</div></section>`;
}
export const boardRows = items => items.map(item=>`<a class="board-row" href="${bountyURL(item.slug)}"><span class="title-cell"><b>${esc(item.title)}</b><small>${esc(item.category || 'General')} · ${(item.skills||[]).slice(0,2).map(esc).join(' / ')}</small></span><strong>${pot(item)}</strong><span>${fee(item)}</span><span class="deadline-cell"><b data-deadline="${esc(item.deadline)}">${remaining(item.deadline)}</b><small>${shortDate(item.deadline)} UTC</small></span><span>${count(item.submissionCount)}</span>${badge(item)}</a>`).join('');
export function boardView(data) {
  const items=sortBoardItems(data.items||[]), categories=[...new Set(items.map(b=>b.category).filter(Boolean))].sort();
  return `<section class="hero"><div><p class="eyebrow">MAKE.FUN / PUBLIC BOUNTIES</p><h1>Bounty timetable</h1></div><p class="hero-note"><b>${items.filter(b=>accepting(b)).length}</b> accepting entries<br>Escrowed prizes · payouts follow published results</p></section>${rail(items)}<section class="board"><div class="board-head"><div><h2>Available work</h2><span>Open first · nearest deadline first</span></div><input id="search" type="search" aria-label="Search bounties" placeholder="Search bounties"><select id="category" aria-label="Category"><option value="">All categories</option>${categories.map(c=>`<option>${esc(c)}</option>`).join('')}</select><div class="filters" role="group" aria-label="Status">${['All','Open','Ended'].map(s=>`<button data-filter="${s.toLowerCase()}" aria-pressed="${s==='All'}">${s}</button>`).join('')}</div></div><div class="column-head"><span>BOUNTY</span><span>POT</span><span>FEE</span><span>DEADLINE / LEFT</span><span>ENTRIES</span><span>STATUS</span></div><div id="board-list">${boardRows(items)}</div><p id="result-count"></p></section>`;
}
function awards(item) {
  const source=item.rewardsNow||item.rewards||[], rows=Array.isArray(source)?source:Object.entries(source).map(([place,amountUsd])=>({place,amountUsd}));
  if (!rows.length) return `<tr><td>Prize</td><td>Live bounty pot</td><td>${pot(item)}</td></tr>`;
  return rows.slice(0,5).map((r,i)=>`<tr><td>${esc(r.place??r.rank??i+1)}</td><td>${esc(r.title??r.label??'Place '+(i+1))}</td><td>${money(r.amountUsd??r.amount??r.prizeUsd)}</td></tr>`).join('')+(rows.length>5?`<tr><td colspan="3">And ${rows.length-5} more places</td></tr>`:'');
}
const stats = values => values.map(([label,value])=>`<div><small>${label}</small><b>${value}</b></div>`).join('');
export function bountyView(item) {
  return `<div class="crumb"><a href="#/">← All bounties</a><a href="${ranking(item)}">View leaderboard →</a></div><section class="detail-head"><div><p class="eyebrow">${esc(item.category||'BOUNTY')} · ${esc(item.sponsor?.name||'MAKE.FUN')}</p><h1>${esc(item.title)}</h1><p class="summary">${esc(item.summary||item.description?.split('\n')[0]||'')}</p></div>${badge(item)}</section><div class="trust-strip"><b>Escrow-backed prize</b><span>Funds held for published results</span><span>Read-only public listing</span></div><section class="metrics">${stats([['LIVE POT',pot(item)],['ENTRY FEE',fee(item)],['ENTRIES',count(item.submissionCount)],[accepting(item)?'DEADLINE':'CLOSED',shortDate(item.deadline)+' · '+remaining(item.deadline)]])}</section><div class="detail-grid"><article><h2>Challenge brief</h2><div class="description">${esc(item.description||item.rules||'No description published.')}</div>${item.rules&&item.rules!==item.description?`<h2>Rules</h2><div class="description">${esc(item.rules)}</div>`:''}</article><aside><h2>Prize schedule</h2><table class="payout-table"><thead><tr><th>PLACE</th><th>AWARD</th><th>AMOUNT</th></tr></thead><tbody>${awards(item)}</tbody></table><p class="aside-note">Live pot: ${pot(item)} · ${esc(item.escrowLifecycle?.state||'Escrow status not provided')}</p><a href="${ranking(item)}">Open leaderboard →</a></aside></div>`;
}
export function leaderboardView(item,data,phase,view) {
  const columns=(data.columns||[]).filter(c=>!c.hidden).slice(0,2), phases=item.phases?.length?item.phases:[{key:phase,title:phase}];
  return `<div class="crumb"><a href="${bountyURL(item.slug)}">← ${esc(item.title)}</a><a href="#/">All bounties →</a></div><section class="ranking-head"><div><p class="eyebrow">PUBLIC RESULTS · PAGE SNAPSHOT</p><h1>Leaderboard</h1><p>${esc(item.title)} · ${esc(data.phase?.title||phase)}</p></div><div class="selects"><label>Phase<select id="phase">${phases.map(p=>`<option value="${esc(p.key)}" ${p.key===phase?'selected':''}>${esc(p.title)}</option>`).join('')}</select></label><label>View<select id="rank-view">${['performance','overall'].map(v=>`<option value="${v}" ${v===view?'selected':''}>${v==='overall'?'Overall':'Performance'}</option>`).join('')}</select></label></div></section><div class="table-scroll"><table class="ranking-table"><thead><tr><th>RANK</th><th>BUILDER / ENTRY</th>${columns.map(c=>`<th>${esc(c.title)}</th>`).join('')}</tr></thead><tbody>${(data.entries||[]).map(e=>`<tr><td class="rank">${esc(e.rank??'—')}</td><td><a class="builder-name" href="${profileURL(e.handle)}">@${esc(e.handle??'—')}</a><small>${esc(e.title??e.submission_id??'')}</small></td>${columns.map(c=>`<td>${esc(e.display?.[c.key]??e.values?.[c.key]??'—')}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${columns.length+2}">No public rankings for this view.</td></tr>`}</tbody></table></div><p class="aside-note">Scores and names are the fields returned by the public leaderboard endpoint.</p>`;
}
export function profileView(profile) {
  const record=profile.record||{};
  return `<div class="crumb"><a href="#/">← All bounties</a></div><section class="profile-head"><span class="avatar">@</span><div><p class="eyebrow">PUBLIC BUILDER PROFILE</p><h1>${esc(profile.display_name||'@'+profile.handle)}</h1><p>${esc(profile.bio||'No public bio.')}</p></div></section><section class="profile-stats">${stats([['Entered',count(record.competitions_entered)],['Placed',count(record.competitions_placed)],['Wins',count(record.competitions_won)],['Prizes',money(record.prize_usd)]])}</section><section class="activity"><h2>Recent entries</h2>${(profile.solutions||[]).map(s=>`<a href="${bountyURL(s.competition?.slug)}"><strong>${esc(s.title)}</strong><span>${esc(s.competition?.title||s.competition?.slug)}</span><small>${s.placement?'Place '+esc(s.placement):'Submission'} · ${shortDate(s.entered_at)}</small></a>`).join('')||'<p>No public entries.</p>'}</section>`;
}
