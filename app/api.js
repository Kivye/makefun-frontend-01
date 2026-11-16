// Public GET responses are shared only within this page's lifetime.
const responses = new Map();
export function request(path) {
  if (!responses.has(path)) responses.set(path, fetch('https://make.fun/api' + path, {
    method: 'GET', credentials: 'omit', headers: {Accept: 'application/json'}, signal: AbortSignal.timeout(20000)
  }).then(async response => {
    if (!response.ok) throw Error(`Public API returned ${response.status}`);
    const data = await response.json();
    if (!data || typeof data !== 'object') throw Error('Invalid API response');
    return data;
  }).catch(error => { responses.delete(path); throw error; }));
  return responses.get(path);
}
const encoded = encodeURIComponent;
export const boardAPI = () => request('/competitions?status=open&activity=times&limit=50');
export const bountyAPI = slug => request(`/competitions/${encoded(slug)}?submissions=summary`);
export const leaderboardAPI = (slug, phase, view) => request(`/competitions/${encoded(slug)}/leaderboard?rows=first&phase=${encoded(phase)}&view=${encoded(view)}`);
export const profileAPI = handle => request('/profiles/' + encoded(handle));
