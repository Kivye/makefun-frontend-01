import { boardAPI, bountyAPI, leaderboardAPI, profileAPI } from './api.js';
import { boardView, boardRows, bountyView, leaderboardView, profileView, solutionRows } from './views.js';
import { esc, accepting, remaining, bountyURL } from './format.js';
const main = document.querySelector('main');
let generation = 0;
let boardState = { items: [], next_cursor: null };
let filterState = { text: '', category: '', open: false };
let activeSurface = '';
function renderBoardRows() {
  const items = boardState.items.filter(b => (!filterState.text || (b.title + ' ' + b.category + ' ' + (b.skills || []).join(' ')).toLowerCase().includes(filterState.text)) && (!filterState.category || b.category === filterState.category) && (!filterState.open || accepting(b))).sort((a,b) => Number(accepting(b))-Number(accepting(a)) || (accepting(a) ? Date.parse(a.deadline)-Date.parse(b.deadline) : Date.parse(b.deadline)-Date.parse(a.deadline)));
  document.querySelector('#board-list').innerHTML = boardRows(items);
  document.querySelector('#result-count').textContent = `Showing ${items.length} of ${boardState.items.length} bounties`;
}
function bindBoard() {
  const search = document.querySelector('#search'), category = document.querySelector('#category'), open = document.querySelector('#open-only');
  search.value = filterState.text; category.value = filterState.category; open.checked = filterState.open;
  search.oninput = () => { filterState.text = search.value.toLowerCase(); renderBoardRows(); };
  category.onchange = () => { filterState.category = category.value; renderBoardRows(); };
  open.onchange = () => { filterState.open = open.checked; renderBoardRows(); };
  document.querySelector('#load-more').onclick = async event => {
    const token = generation, button = event.currentTarget;
    button.disabled = true; button.textContent = 'Loading…';
    try {
      const next = await boardAPI(boardState.next_cursor);
      if (token !== generation) return;
      const known = new Set(boardState.items.map(b=>b.slug));
      boardState.items.push(...next.items.filter(b=>!known.has(b.slug))); boardState.next_cursor = next.next_cursor;
      button.hidden = !next.next_cursor; renderBoardRows();
    } catch { if (token === generation) document.querySelector('#result-count').textContent = 'Could not load more. Try again.'; }
    finally { button.disabled = false; button.textContent = 'Load more bounties ↓'; }
  };
  renderBoardRows();
}
export async function route(refresh = false) {
  const token = ++generation;
  window.__shotReady = false;
  main.setAttribute('aria-busy','true');
  const raw = location.hash.slice(1) || '/';
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(p => { try { return decodeURIComponent(p); } catch { return p; } });
  const params = new URLSearchParams(query);
  if (!refresh) main.innerHTML = '<section class="loading" role="status"><span class="loader"></span><h1>Opening the desk…</h1><p>Fetching the latest public data.</p></section>';
  try {
    let html, title;
    if (!parts.length) {
      boardState = await boardAPI(); html = boardView(boardState); title = 'Bounties'; activeSurface = 'board';
    } else if (parts[0] === 'bounty' && parts[1]) {
      const bounty = await bountyAPI(parts[1]);
      if (parts[2] === 'leaderboard') {
        const phase = params.get('phase') === 'final' ? 'final' : 'dev';
        const view = ['overall','performance','cost','efficiency'].includes(params.get('view')) ? params.get('view') : 'overall';
        const lb = await leaderboardAPI(parts[1],phase,view);
        html = leaderboardView(bounty,lb,phase,view); activeSurface = 'leaderboard';
      } else { html = bountyView(bounty); activeSurface = 'bounty'; }
      title = bounty.title + (parts[2] === 'leaderboard' ? ' · Rankings' : '');
    } else if (parts[0] === 'profile' && parts[1]) {
      const profile = await profileAPI(parts[1]);
      html = profileView(profile); title = '@' + profile.handle; activeSurface = 'profile';
      if (token !== generation) return;
      main.innerHTML = html;
      let shown = 10;
      const update = () => { document.querySelector('#solutions').innerHTML = solutionRows((profile.solutions || []).slice(0,shown)); document.querySelector('#more-solutions').hidden = shown >= (profile.solutions || []).length; };
      document.querySelector('#more-solutions').onclick = () => { shown += 10; update(); }; update();
    } else { throw new Error('This page could not be found.'); }
    if (token !== generation) return;
    if (activeSurface !== 'profile') main.innerHTML = html;
    if (activeSurface === 'board') bindBoard();
    if (activeSurface === 'leaderboard') {
      const change = () => { location.hash = bountyURL(parts[1]) + '/leaderboard?phase=' + document.querySelector('#phase').value + '&view=' + document.querySelector('#rank-view').value; };
      document.querySelector('#phase').onchange = change; document.querySelector('#rank-view').onchange = change;
    }
    main.dataset.surface = activeSurface;
    document.title = title + ' · make.fun Bounty desk';
    document.querySelector('#nav-board').toggleAttribute('aria-current', activeSurface === 'board');
    document.querySelector('#freshness').textContent = 'Checked ' + new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}) + ' UTC · Read only';
    main.setAttribute('aria-busy','false'); window.__shotReady = true;
    if (!refresh) { window.scrollTo(0,0); main.focus({preventScroll:true}); }
  } catch (error) {
    if (token !== generation) return;
    main.innerHTML = `<section class="empty error"><p class="eyebrow">CONNECTION PAUSED</p><h1>Let's try that again.</h1><p>${esc(error.message)}</p><p>The desk needs a connection to make.fun's public API.</p><button id="retry">Retry loading ↗</button> <a href="#/">Back to bounties</a></section>`;
    main.setAttribute('aria-busy','false'); document.querySelector('#retry').onclick = () => route();
    document.querySelector('#freshness').textContent = 'Unable to refresh · Data not loaded';
  }
}
window.addEventListener('hashchange',()=>route());
window.addEventListener('online',()=>route(true));
setInterval(() => { if (!document.hidden && !main.contains(document.activeElement?.closest('input,select,button,details')) && main.getAttribute('aria-busy') !== 'true') route(true); },60000);
setInterval(() => { document.querySelectorAll('[data-deadline]').forEach(el=>el.textContent=remaining(el.dataset.deadline)); },15000);
route();
