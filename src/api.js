const cache = new Map();
const pending = new Map();
export async function get(path, force = false) {
  const url = 'https://make.fun/api' + path;
  const old = cache.get(url);
  if (!force && old && Date.now() - old.time < 60000) return old.data;
  if (pending.has(url)) return pending.get(url);
  const request = (async () => {
    const options = { method: 'GET', credentials: 'omit', headers: { Accept: 'application/json', ...(old?.etag ? { 'If-None-Match': old.etag } : {}) }, };
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(url, { ...options, signal: AbortSignal.timeout(45000) });
      if (![429,503].includes(response.status) || attempt === 2) break;
      await response.body?.cancel();
      const delay = Math.min(10, Math.max(1, Number(response.headers.get('retry-after')) || 4));
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }
    if (!response.ok && response.status !== 304) throw new Error(response.status === 404 ? 'This page could not be found.' : `The public API returned ${response.status}. Please try again.`);
    const data = response.status === 304 && old ? old.data : await response.json();
    cache.set(url, { data, time: Date.now(), etag: response.headers.get('etag') || old?.etag });
    if (cache.size > 70) cache.delete(cache.keys().next().value);
    return data;
  })();
  pending.set(url, request);
  try { return await request; } finally { pending.delete(url); }
}
export const boardAPI = cursor => get('/competitions?status=open&activity=times&limit=50' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''));
export const bountyAPI = slug => get('/competitions/' + encodeURIComponent(slug) + '?submissions=summary');
export const leaderboardAPI = (slug, phase, view) => get('/competitions/' + encodeURIComponent(slug) + '/leaderboard?rows=first&phase=' + encodeURIComponent(phase) + '&view=' + encodeURIComponent(view));
export const profileAPI = handle => get('/profiles/' + encodeURIComponent(handle));
