// Feature: client router, live API state, measured first-load weight and local board controls.
import { boardAPI, bountyAPI, leaderboardAPI, profileAPI } from './api.js';
import { boardView, boardRows, sortBoardItems } from './views.js';
import { esc, statusOf, remaining, gzipLength, shortBytes, bountyURL } from './format.js';

const main = document.querySelector('#content');
const assets = ['index.html','style.css','main.js','views.js','api.js','format.js'];
let board = { items:[] };
let query = '';
let category = '';
let statusFilter = 'all';
let routeGeneration = 0;
let updatedAt;

async function measureFirstLoad() {
  try {
    const files = [...assets];
    if (window.matchMedia('(max-width:900px)').matches) files.push('mobile.css');
    const sizes = await Promise.all(files.map(async file => {
      const response = await fetch(file, { cache:'no-store' });
      if (!response.ok) throw new Error(`Cannot measure ${file}`);
      const bytes = await response.arrayBuffer();
      return gzipLength(bytes);
    }));
    return { gzip:sizes.reduce((n,x)=>n+x,0) };
  } catch { return null; }
}
let detailViews;
let detailStyles;
let mobileStyles;
function loadMobileStyles() {
  if (!window.matchMedia('(max-width:900px)').matches || mobileStyles) return mobileStyles || Promise.resolve();
  mobileStyles = new Promise((resolve,reject) => {
    const link=document.createElement('link'); link.rel='stylesheet'; link.href='mobile.css';
    link.onload=resolve; link.onerror=()=>reject(new Error('Could not load mobile styles.'));
    document.head.append(link);
  });
  return mobileStyles;
}
async function loadDetailSurface() {
  if (!detailStyles) detailStyles = new Promise((resolve,reject) => {
    const link=document.createElement('link'); link.rel='stylesheet'; link.href='detail.css';
    link.onload=resolve; link.onerror=()=>reject(new Error('Could not load detail styles.'));
    document.head.append(link);
  });
  if (!detailViews) detailViews = import('./detail.js');
  await Promise.all([detailStyles,detailViews]);
  return detailViews;
}
function setMeta(measurement) {
  const weight = measurement ? `${shortBytes(measurement.gzip)} gzip` : 'gzip size unavailable';
  document.querySelector('#load-chip').textContent = `${weight} · FIRST LOAD`;
  document.querySelector('#footer-size').textContent = `First load ${measurement?shortBytes(measurement.gzip)+' gzip':'unavailable'}`;
  document.querySelector('#footer-count').textContent = `Bounties ${board.items.length} loaded`;
  document.querySelector('#footer-updated').textContent = `Updated ${new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(updatedAt)} UTC`;
}
function filteredItems() {
  const now = Date.now();
  const items = board.items.filter(b => {
    const text = `${b.title||''} ${b.category||''} ${(b.skills||[]).join(' ')}`.toLowerCase();
    const [label] = statusOf(b,now);
    const statusOK = statusFilter==='all' || statusFilter==='open' && label==='OPEN' || statusFilter==='soon' && label==='CLOSING SOON' || statusFilter==='paid' && label==='PAID';
    return (!query || text.includes(query)) && (!category || b.category===category) && statusOK;
  });
  return sortBoardItems(items,now);
}
function renderBoardRows() {
  const list = document.querySelector('#board-list');
  if (!list) return;
  const items = filteredItems();
  list.innerHTML = boardRows(items);
  document.querySelector('#result-count').textContent = `Showing ${items.length} of ${board.items.length} API results`;
}
function bindBoard() {
  const search = document.querySelector('#search');
  const select = document.querySelector('#category');
  search.value = query; select.value = category;
  search.oninput = () => { query=search.value.toLowerCase().trim(); renderBoardRows(); };
  select.onchange = () => { category=select.value; renderBoardRows(); };
  document.querySelectorAll('.filter-pill').forEach(button => {
    button.setAttribute('aria-pressed',String(button.dataset.filter===statusFilter));
    button.onclick = () => { statusFilter=button.dataset.filter; document.querySelectorAll('.filter-pill').forEach(x=>x.setAttribute('aria-pressed',String(x===button))); renderBoardRows(); };
  });
  renderBoardRows();
}
function routeParts() {
  const raw=location.hash.slice(1)||'/';
  const [path,qs='']=raw.split('?');
  const parts=path.split('/').filter(Boolean).map(s=>{try{return decodeURIComponent(s)}catch{return s}});
  return {parts,params:new URLSearchParams(qs)};
}
async function leaderboardRecords(entries) {
  const handles=[...new Set(entries.slice(0,10).map(x=>x.handle).filter(Boolean))];
  const pairs=await Promise.all(handles.map(async h=>[h,await profileAPI(h).catch(()=>null)]));
  return Object.fromEntries(pairs.filter(([,p])=>p));
}
export async function route() {
  const token=++routeGeneration;
  window.__shotReady=false;
  main.setAttribute('aria-busy','true');
  const {parts,params}=routeParts();
  main.innerHTML='<section class="loading"><span class="loader"></span><p>Reading live public data…</p></section>';
  try {
    await loadMobileStyles();
    const [listing,measurement]=await Promise.all([boardAPI(),measureFirstLoad()]);
    board=listing; updatedAt??=Date.now();
    if (token!==routeGeneration) return;
    setMeta(measurement);
    let surface='board', title='Bounties';
    if (parts[0]==='bounty'&&parts[1]) {
      const bounty=await bountyAPI(parts[1]);
      if (token!==routeGeneration) return;
      const detail=await loadDetailSurface();
      setMeta(measurement);
      title=bounty.title||parts[1];
      if (parts[2]==='leaderboard') {
        const phase=params.get('phase')||'dev', view=params.get('view')||'performance';
        const lb=await leaderboardAPI(parts[1],phase,view);
        if (token!==routeGeneration) return;
        const records=await leaderboardRecords(lb.entries||[]);
        if (token!==routeGeneration) return;
        main.innerHTML=detail.leaderboardView(bounty,lb,phase,view,records); surface='leaderboard'; title+=' · Leaderboard';
      } else { main.innerHTML=detail.bountyView(bounty); surface='bounty'; }
    } else if (parts[0]==='profile'&&parts[1]) {
      const profile=await profileAPI(parts[1]);
      if (token!==routeGeneration) return;
      const detail=await loadDetailSurface();
      setMeta(measurement);
      main.innerHTML=detail.profileView(profile);
      const target=document.querySelector('#solutions'); let shown=8;
      const update=()=>{target.innerHTML=detail.solutionRows((profile.solutions||[]).slice(0,shown));document.querySelector('#more-solutions').hidden=shown>=(profile.solutions||[]).length;};
      document.querySelector('#more-solutions').onclick=()=>{shown+=8;update();}; update();
      surface='profile'; title='@'+profile.handle;
    } else if (parts.length) {
      throw new Error('That public page was not found.');
    } else {
      main.innerHTML=boardView(board); surface='board';
      bindBoard();
    }
    if (token!==routeGeneration) return;
    main.dataset.surface=surface;
    document.title=`${title} · make.fun Bounty timetable`;
    document.querySelector('#nav-board').toggleAttribute('aria-current',surface==='board');
    if (surface==='leaderboard') {
      const change=()=>{location.hash=`${bountyURL(parts[1])}/leaderboard?phase=${encodeURIComponent(document.querySelector('#phase').value)}&view=${encodeURIComponent(document.querySelector('#rank-view').value)}`;};
      document.querySelector('#phase').onchange=change; document.querySelector('#rank-view').onchange=change;
    }
    main.setAttribute('aria-busy','false');
    window.__shotReady=true;
  } catch (error) {
    if (token!==routeGeneration) return;
    main.innerHTML=`<section class="error-state"><p class="eyebrow">LIVE DATA UNAVAILABLE</p><h1>Could not load the public API.</h1><p>${esc(error.message)}</p><button id="retry">Retry ↻</button></section>`;
    main.setAttribute('aria-busy','false'); document.querySelector('#retry').onclick=route;
    document.querySelector('#footer-updated').textContent='Updated unavailable';
  }
}
window.addEventListener('hashchange',route);
window.addEventListener('online',route);
window.addEventListener('resize',()=>loadMobileStyles().then(measureFirstLoad).then(setMeta));
setInterval(()=>document.querySelectorAll('[data-deadline]').forEach(el=>el.textContent=remaining(el.dataset.deadline)),15000);
route();
