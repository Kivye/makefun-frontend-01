export function render(root, data) {
  const x=data.competition, e=data.entries||[], cash=Math.max(1,Math.round((x.submissionCount||0)/Object.keys(x.rewards||{}).length));
  root.innerHTML=`<main><a href="#/">← Bounty desk</a><h1>${x.title}</h1><p>${x.description||''}</p><h2>Should I enter?</h2><p>${x.potUsd} USD pot · ${x.entryFeeUsd||'0.00'} fee · ${x.submissionCount} entries · 1 in ${cash} cashes</p><h2>Rewards</h2>${Object.entries(x.rewards||{}).map(([p,n])=>`<div>#${p} · $${n}</div>`).join('')}<h2>Recent activity · ${e.length} entries</h2>${e.slice(0,20).map(v=>`<div>${v.hunter} · ${v.title}</div>`).join('')}</main>`;
}
