// Feature: hash router, compact filters, true first-load gzip meter and route readiness signal.
import { boardAPI, bountyAPI, leaderboardAPI, profileAPI } from './api.js';
import { accepting, bountyURL, esc, gzipLength, remaining, statusOf } from './format.js';
import { boardRows, boardView, bountyView, leaderboardView, profileView, sortBoardItems } from './views.js';

const main = document.querySelector('#content');
const firstLoad = ['index.html', 'style.css', 'main.js', 'api.js', 'format.js', 'views.js'];
let board, query = '', category = '', status = 'all', generation = 0, updatedAt;
const sizeLabel = bytes => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
async function measureLoad() {
  try {
    const sizes = await Promise.all(firstLoad.map(async file => {
      const response = await fetch(file, { cache: 'no-store' });
      if (!response.ok) throw new Error('measurement unavailable');
      return gzipLength(await response.arrayBuffer());
    }));
    document.querySelector('#load-chip').textContent = `${sizeLabel(sizes.reduce((a, b) => a + b, 0))} gzip · FIRST LOAD`;
  } catch { document.querySelector('#load-chip').textContent = 'First-load size unavailable'; }
}
function metadata() {
  document.querySelector('#footer-count').textContent = `${board?.items?.length || 0} public bounties`;
  document.querySelector('#footer-updated').textContent = updatedAt ? `Fetched ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(updatedAt)} UTC` : 'Fetched this page';
}
function routeParts() {
  const [path, search = ''] = (location.hash.slice(1) || '/').split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), params: new URLSearchParams(search) };
}
function filterRows() {
  const list = document.querySelector('#board-list');
  if (!list) return;
  const now = Date.now();
  const items = sortBoardItems((board.items || []).filter(b => {
    const text = `${b.title} ${b.category} ${(b.skills || []).join(' ')}`.toLowerCase();
    const [label] = statusOf(b, now);
    return (!query || text.includes(query)) && (!category || category === b.category) && (status === 'all' || status === 'open' && accepting(b, now) || status === 'ended' && label === 'ENDED');
  }), now);
  list.innerHTML = boardRows(items);
  document.querySelector('#result-count').textContent = `${items.length} shown of ${board.items.length}`;
}
function bindBoard() {
  const search = document.querySelector('#search'), select = document.querySelector('#category');
  search.oninput = () => { query = search.value.toLowerCase().trim(); filterRows(); };
  select.onchange = () => { category = select.value; filterRows(); };
  document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => {
    status = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterRows();
  });
  filterRows();
}
export async function route() {
  const token = ++generation;
  window.__shotReady = false;
  main.setAttribute('aria-busy', 'true');
  window.scrollTo(0, 0);
  main.innerHTML = '<p class="loading">Loading public make.fun data...</p>';
  try {
    const { parts, params } = routeParts();
    board ||= await boardAPI();
    updatedAt ||= Date.now();
    if (token !== generation) return;
    metadata();
    let title = 'Bounty timetable';
    if (!parts.length) {
      main.innerHTML = boardView(board); bindBoard();
      document.querySelector('#search').value = query;
      document.querySelector('#category').value = category;
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === status)));
    } else if (parts[0] === 'bounty' && parts[1]) {
      const bounty = await bountyAPI(parts[1]);
      if (token !== generation) return;
      title = bounty.title || parts[1];
      if (parts[2] === 'leaderboard') {
        const phase = params.get('phase') || 'dev', view = params.get('view') || 'performance';
        const data = await leaderboardAPI(parts[1], phase, view);
        if (token !== generation) return;
        main.innerHTML = leaderboardView(bounty, data, phase, view); title += ' · Leaderboard';
        const update = () => { location.hash = `${bountyURL(parts[1])}/leaderboard?phase=${encodeURIComponent(document.querySelector('#phase').value)}&view=${encodeURIComponent(document.querySelector('#rank-view').value)}`; };
        document.querySelector('#phase').onchange = update;
        document.querySelector('#rank-view').onchange = update;
      } else main.innerHTML = bountyView(bounty);
    } else if (parts[0] === 'profile' && parts[1]) {
      const profile = await profileAPI(parts[1]);
      if (token !== generation) return;
      main.innerHTML = profileView(profile); title = `@${profile.handle}`;
    } else throw new Error('That public page was not found.');
    if (token !== generation) return;
    document.title = `${title} | make.fun`;
    main.setAttribute('aria-busy', 'false');
    window.__shotReady = true;
  } catch (error) {
    if (token !== generation) return;
    main.innerHTML = `<section class="error"><p class="eyebrow">PUBLIC DATA UNAVAILABLE</p><h1>Could not load this page.</h1><p>${esc(error.message)}</p><button id="retry">Retry</button></section>`;
    document.querySelector('#retry').onclick = route;
    main.setAttribute('aria-busy', 'false');
    window.__shotReady = true;
  }
}
measureLoad();
window.addEventListener('hashchange', route);
window.addEventListener('online', route);
setInterval(() => {
  document.querySelectorAll('[data-deadline]').forEach(el => { el.textContent = remaining(el.dataset.deadline); });
  if (document.querySelector('#board-list')) filterRows();
}, 30000);
route();
