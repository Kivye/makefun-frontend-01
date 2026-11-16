// Pending and completed GETs share the same page-lifetime cache.
const cache = new Map();
export function request(path) {
  if (!cache.has(path)) {
    const pending = fetch('https://make.fun/api' + path, {
      method: 'GET', credentials: 'omit', headers: {Accept: 'application/json'},
      signal: AbortSignal.timeout(20000)
    }).then(async r => {
      if (!r.ok) throw Error('Public API response: ' + r.status);
      const value = await r.json();
      if (!value || typeof value !== 'object') throw Error('Invalid public response');
      return value;
    }).catch(e => {cache.delete(path); throw e;});
    cache.set(path, pending);
  }
  return cache.get(path);
}
const encode = encodeURIComponent;
export const boardAPI = () => request('/competitions?status=open&activity=times&limit=50');
export const bountyAPI = slug => request('/competitions/' + encode(slug) + '?submissions=summary');
export const profileAPI = handle => request('/profiles/' + encode(handle));
export const leaderboardAPI = (slug, phase, view) => request('/competitions/' + encode(slug) + '/leaderboard?rows=first&phase=' + encode(phase) + '&view=' + encode(view));
