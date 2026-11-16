// Feature: de-duplicated, read-only public API requests cached for this page lifetime.
const cache = new Map();
const pending = new Map();
export async function request(path) {
  const url = `https://make.fun/api${path}`;
  if (cache.has(url)) return cache.get(url);
  if (pending.has(url)) return pending.get(url);
  const task = fetch(url, { method: 'GET', credentials: 'omit', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
    .then(async response => {
      if (!response.ok) throw new Error(response.status === 404 ? 'This public page is unavailable.' : `make.fun returned ${response.status}.`);
      const data = await response.json();
      if (!data || typeof data !== 'object') throw new Error('Invalid public API response.');
      cache.set(url, data);
      return data;
    }).finally(() => pending.delete(url));
  pending.set(url, task);
  return task;
}
export const boardAPI = () => request('/competitions?status=open&activity=times&limit=50');
export const bountyAPI = slug => request(`/competitions/${encodeURIComponent(slug)}?submissions=summary`);
export const leaderboardAPI = (slug, phase, view) => request(`/competitions/${encodeURIComponent(slug)}/leaderboard?rows=first&phase=${encodeURIComponent(phase)}&view=${encodeURIComponent(view)}`);
export const profileAPI = handle => request(`/profiles/${encodeURIComponent(handle)}`);
