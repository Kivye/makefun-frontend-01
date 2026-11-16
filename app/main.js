// Route generations prevent slower requests from replacing a newer surface.
import {boardAPI,bountyAPI,leaderboardAPI,profileAPI} from './api.js';
import {accepting,esc,gzipLength,bountyURL,remaining} from './format.js';
import {boardView,boardRows,sortBoardItems,bountyView,leaderboardView,profileView} from './views.js';
const main=document.querySelector('main');
let board, generation=0, query='', category='', filter='all';
const meter = Promise.all(['index.html','style.css','api.js','format.js','views.js','main.js'].map(async name=>{
  const response=await fetch(name,{cache:'no-store'});
  if(!response.ok) throw Error('Size unavailable');
  return gzipLength(await response.arrayBuffer());
})).then(sizes=>document.querySelector('#load-chip').textContent=`${(sizes.reduce((a,b)=>a+b,0)/1024).toFixed(1)} KB gzip · FIRST LOAD`).catch(()=>document.querySelector('#load-chip').textContent='First-load size unavailable');
function filterRows() {
  const items=sortBoardItems(board.items.filter(b=>(!query || `${b.title} ${b.category} ${(b.skills || []).join(' ')}`.toLowerCase().includes(query)) && (!category || b.category===category) && (filter==='all' || (filter==='open')===accepting(b))));
  document.querySelector('#board-list').innerHTML=boardRows(items);
  document.querySelector('#result-count').textContent=`${items.length} shown of ${board.items.length}`;
}
function bindBoard() {
  const search=document.querySelector('#search'), select=document.querySelector('#category');
  search.value=query; select.value=category;
  search.oninput=()=>{query=search.value.trim().toLowerCase();filterRows();};
  select.onchange=()=>{category=select.value;filterRows();};
  document.querySelectorAll('[data-filter]').forEach(button=>{
    button.setAttribute('aria-pressed',button.dataset.filter===filter);
    button.onclick=()=>{filter=button.dataset.filter;bindBoard();};
  });
  filterRows();
}
async function route() {
  const current=++generation;
  window.__shotReady=false;
  main.setAttribute('aria-busy','true');
  main.innerHTML='<p class="loading">Loading public make.fun data…</p>';
  scrollTo(0,0);
  try {
    const [path,search='']=(location.hash.slice(1)||'/').split('?');
    const parts=path.split('/').filter(Boolean).map(decodeURIComponent), params=new URLSearchParams(search);
    let html,title='Bounty timetable',bind=()=>{};
    if(!parts.length) {
      if(!board) {board=await boardAPI();document.querySelector('#fetched').textContent=`Fetched ${new Date().toISOString().slice(11,16)} UTC`;}
      document.querySelector('#total').textContent=`${board.items.length} public bounties`;
      html=boardView(board);bind=bindBoard;
    } else if(parts[0]==='bounty' && parts[1]) {
      const b=await bountyAPI(parts[1]);title=b.title;
      if(parts[2]==='leaderboard') {
        const phase=params.get('phase')||'dev',view=params.get('view')||'performance';
        html=leaderboardView(b,await leaderboardAPI(parts[1],phase,view),phase,view);
        title+=' · Leaderboard';
        bind=()=>{
          const change=()=>location.hash=`${bountyURL(parts[1])}/leaderboard?phase=${encodeURIComponent(document.querySelector('#phase').value)}&view=${encodeURIComponent(document.querySelector('#rank-view').value)}`;
          document.querySelector('#phase').onchange=change;document.querySelector('#rank-view').onchange=change;
        };
      } else html=bountyView(b);
    } else if(parts[0]==='profile' && parts[1]) {
      const p=await profileAPI(parts[1]);html=profileView(p);title='@'+p.handle;
    } else throw Error('This public route does not exist.');
    if(current!==generation) return;
    main.innerHTML=html;bind();document.title=title+' | make.fun';
  } catch(error) {
    if(current!==generation) return;
    main.innerHTML=`<section class="error"><h1>Could not load this page</h1><p>${esc(error.message)}</p><button id="retry">Retry</button></section>`;
    document.querySelector('#retry').onclick=route;
  }
  await meter;
  if(current===generation) {main.setAttribute('aria-busy','false');window.__shotReady=true;}
}
addEventListener('hashchange',route);
setInterval(()=>{if(document.querySelector('#board-list')) filterRows();else document.querySelectorAll('[data-deadline]').forEach(el=>el.textContent=remaining(el.dataset.deadline));},30000);
route();
