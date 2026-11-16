import {boardAPI,bountyAPI,leaderboardAPI,profileAPI} from './api.js';
import {accepting,esc,gzipLength,bountyURL,remaining} from './format.js';
import {boardView,boardRows,sortBoardItems,bountyView,leaderboardView,profileView} from './views.js';
const $ = selector => document.querySelector(selector), main=$('main');
let board, version=0, query='', category='', filter='all';
const measurement=Promise.all(['index.html','style.css','api.js','format.js','views.js','main.js'].map(async file=>{
  const r=await fetch(file,{cache:'no-store'});
  if (!r.ok) throw Error('Measurement failed');
  return gzipLength(await r.arrayBuffer());
})).then(sizes=>$('#load-chip').textContent=(sizes.reduce((a,b)=>a+b,0)/1024).toFixed(1)+' KB gzip · FIRST LOAD').catch(()=>$('#load-chip').textContent='First-load size unavailable');
function updateRows() {
  const items=board.items.filter(b=>(!query||`${b.title} ${b.category} ${(b.skills||[]).join(' ')}`.toLowerCase().includes(query))&&(!category||b.category===category)&&(filter==='all'||(filter==='open')===accepting(b)));
  $('#board-list').innerHTML=boardRows(sortBoardItems(items));
  $('#result-count').textContent=items.length+' shown of '+board.items.length;
}
function bindBoard() {
  $('#search').value=query; $('#category').value=category;
  $('#search').oninput=e=>{query=e.target.value.trim().toLowerCase();updateRows();};
  $('#category').onchange=e=>{category=e.target.value;updateRows();};
  document.querySelectorAll('[data-filter]').forEach(button=>{
    button.setAttribute('aria-pressed',button.dataset.filter===filter);
    button.onclick=()=>{filter=button.dataset.filter;bindBoard();};
  });
  updateRows();
}
async function route() {
  const ticket=++version;
  window.__shotReady=false;main.setAttribute('aria-busy','true');
  main.innerHTML='<p class="loading">Loading public make.fun data…</p>';scrollTo(0,0);
  try {
    const [path,search='']=(location.hash.slice(1)||'/').split('?');
    const parts=path.split('/').filter(Boolean).map(decodeURIComponent), params=new URLSearchParams(search);
    let html, title='Bounty timetable', bind=()=>{};
    if (!parts.length) {
      if (!board) {board=await boardAPI();$('#fetched').textContent='Fetched '+new Date().toISOString().slice(11,16)+' UTC';}
      $('#total').textContent=board.items.length+' public bounties';
      html=boardView(board);bind=bindBoard;
    } else if (parts[0]==='bounty'&&parts[1]) {
      const item=await bountyAPI(parts[1]); title=item.title;
      if (parts[2]==='leaderboard') {
        const phase=params.get('phase')||'dev', view=params.get('view')||'performance';
        html=leaderboardView(item,await leaderboardAPI(parts[1],phase,view),phase,view);title+=' · Leaderboard';
        bind=()=>{
          const change=()=>location.hash=bountyURL(parts[1])+'/leaderboard?phase='+encodeURIComponent($('#phase').value)+'&view='+encodeURIComponent($('#rank-view').value);
          $('#phase').onchange=change;$('#rank-view').onchange=change;
        };
      } else html=bountyView(item);
    } else if (parts[0]==='profile'&&parts[1]) {
      const profile=await profileAPI(parts[1]);html=profileView(profile);title='@'+profile.handle;
    } else throw Error('Unknown public route');
    if (ticket!==version) return;
    main.innerHTML=html;bind();document.title=title+' | make.fun';
  } catch(e) {
    if (ticket!==version) return;
    main.innerHTML=`<section class="error"><h1>Could not load this page</h1><p>${esc(e.message)}</p><button id="retry">Retry</button></section>`;
    $('#retry').onclick=route;
  }
  await measurement;
  if (ticket===version) {main.setAttribute('aria-busy','false');window.__shotReady=true;}
}
addEventListener('hashchange',route);
setInterval(()=>{
  if ($('#board-list')) updateRows();
  else document.querySelectorAll('[data-deadline]').forEach(el=>el.textContent=remaining(el.dataset.deadline));
},30000);
route();
