// Feature: deadline rail, opportunity totals and status filters.
import { esc, num, money, date, shortDate, remaining, accepting, statusOf, bountyURL } from './format.js';
const statusChip = b => { const [label,tone]=statusOf(b); return `<span class="status ${tone}">${esc(label)}</span>`; };
const shortTitle = title => String(title||'Bounty').replace(/\b(the|for|with|make|best|your)\b/gi,'').trim().split(/\s+/).slice(0,1).join(' ');
export function timetable(items,now=Date.now()) {
  const day=86400000,start=new Date(now); start.setUTCHours(0,0,0,0);
  const end=start.getTime()+14*day;
  const ticks=Array.from({length:8},(_,i)=>`<span style="left:${i*100/7}%;top:0">${shortDate(start.getTime()+i*2*day)}</span>`).join('');
  const dated=items.filter(b=>Number.isFinite(Date.parse(b.deadline))&&Date.parse(b.deadline)>=start.getTime()&&Date.parse(b.deadline)<=end).sort((a,b)=>Date.parse(a.deadline)-Date.parse(b.deadline));
  const laneEnds=Array(5).fill(-1);
  const chips=dated.map(b=>{
    const at=(Date.parse(b.deadline)-start.getTime())/(end-start.getTime())*100;
    let lane=laneEnds.findIndex(x=>at-x>=12);
    if(lane<0)lane=laneEnds.indexOf(Math.min(...laneEnds));
    laneEnds[lane]=at+12;
    return `<a class="time-chip" style="--at:${at}%;top:${lane*19}px" href="${bountyURL(b.slug)}" title="${esc(b.title)} · ${date(b.deadline)}"><span>${esc(shortTitle(b.title))}</span><b>${money(b.potUsd??b.rewardAmount)}</b></a>`;
  }).join('');
  return `<section class="timetable"><div class="rail-head"><div><p class="eyebrow">NEXT 14 DAYS</p><h2>Deadlines, on the line</h2></div><span>${dated.length} scheduled</span></div><div class="rail" style="height:122px"><div class="rail-rules" style="top:98px">${Array.from({length:8},(_,i)=>`<i style="left:${i*100/7}%"></i>`).join('')}</div><div class="rail-chips">${chips||'<span class="rail-empty">No deadlines in this window</span>'}</div><div class="rail-dates" style="top:106px;bottom:auto;height:14px">${ticks}</div></div></section>`;
}
export function boardView(data) {
  const items=data.items||[],live=items.filter(accepting);
  const total=live.reduce((sum,b)=>sum+Number(b.potUsd??b.rewardAmount??0),0);
  const delta=items.map(b=>b.potDeltaTodayUsd??b.todayPotDeltaUsd??b.deltaTodayUsd).find(v=>v!=null);
  const categories=[...new Set(items.map(b=>b.category).filter(Boolean))].sort();
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow"><span class="pulse"></span> LIVE OPPORTUNITY</p><h1>Your next build.<br><em>On the clock.</em></h1><p>Make the window. Find the brief. Ship work worth rewarding.</p></div><aside class="hero-pot"><span class="eyebrow">LIVE PRIZE POOL</span><strong>${money(total)}</strong><span class="pot-caption">${num(live.length)} bounties accepting entries</span>${delta==null?'':`<span class="delta">${Number(delta)>=0?'+':''}${money(delta)} today</span>`}<span class="hero-rule"></span><small>${num(items.reduce((sum,b)=>sum+Number(b.submissionCount||0),0))} entries reported across this live feed</small></aside></section>${timetable(items)}<section class="board-section"><div class="section-head"><div><p class="eyebrow">THE LIVE BOARD</p><h2>Bounties <span class="count">${num(items.length)}</span></h2></div><span class="sort-note">Open first, then deadline</span></div><div class="filters"><label class="search"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search title or skill" aria-label="Search bounties"></label><select id="category" aria-label="Filter category"><option value="">Every category</option>${categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select><div class="filter-pills" role="group" aria-label="Bounty status">${[['all','All'],['open','Open'],['soon','Closing soon'],['paid','Paid']].map(([k,v])=>`<button class="filter-pill" data-filter="${k}" aria-pressed="${k==='all'}">${v}</button>`).join('')}</div></div><div class="table-head"><span>OPPORTUNITY</span><span>LIVE POT</span><span>ENTRY</span><span>DEADLINE / COUNTDOWN</span><span>STATUS</span><span>ENTRIES</span></div><div id="board-list"></div><div class="list-foot"><span id="result-count" role="status"></span></div></section>`;
}
export function boardRows(items) {
  return items.length?items.map(b=>{
    const close=Date.parse(b.deadline)>Date.now()?remaining(b.deadline):'Past deadline';
    const hours=(Date.parse(b.deadline)-Date.now())/3600000,tone=hours<24&&hours>=0?'urgent':hours<48&&hours>=0?'soon':'';
    return `<article class="bounty-row"><div class="opportunity"><span class="category-mark">${esc((b.category||'B').slice(0,1))}</span><div><a class="bounty-title" href="${bountyURL(b.slug)}">${esc(b.title)}</a><span class="category-line">${esc(b.category||'General')} · ${esc((b.skills||[]).slice(0,2).join(' / '))}</span></div></div><strong class="row-pot">${money(b.potUsd??b.rewardAmount)}</strong><span class="entry-fee">${Number(b.entryFeeUsd??b.entryFeesUsd)?money(b.entryFeeUsd??b.entryFeesUsd):'Free'}</span><span class="deadline-cell"><time class="countdown ${tone}" data-deadline="${esc(b.deadline)}">${close}</time><small>${shortDate(b.deadline)} · UTC</small></span><span>${statusChip(b)}</span><span class="entry-count">${num(b.submissionCount)}</span></article>`;
  }).join(''):'<div class="empty-inline">No bounties match these filters.</div>';
}

export function sortBoardItems(items,now=Date.now()) {
  const acceptingStatus=b=>{const [label]=statusOf(b,now);return label==='OPEN'||label==='CLOSING SOON';};
  return [...items].sort((a,b)=>Number(acceptingStatus(b))-Number(acceptingStatus(a))||Date.parse(a.deadline)-Date.parse(b.deadline));
}
