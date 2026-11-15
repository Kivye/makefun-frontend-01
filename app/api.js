// Feature: small, read-only client for the public competition and profile API.
const cache = new Map();
const active = new Map();
export async function request(path) {
  const key = `https://make.fun/api${path}`;
  if (cache.has(key)) return cache.get(key);
  if (active.has(key)) return active.get(key);
  const job = fetch(key, { headers: { Accept: 'application/json' }, credentials: 'omit', signal: AbortSignal.timeout(30000) })
    .then(async response => {
      if (!response.ok) throw new Error(response.status === 404 ? 'This public page is not available.' : `make.fun returned ${response.status}.`);
      const data = await response.json();
      cache.set(key, data);
      return data;
    }).finally(() => active.delete(key));
  active.set(key, job);
  return job;
}
export const boardAPI = () => request('/competitions?status=open&activity=times&limit=50');
export const bountyAPI = slug => request(`/competitions/${encodeURIComponent(slug)}?submissions=summary`);
export const leaderboardAPI = (slug, phase, view) => request(`/competitions/${encodeURIComponent(slug)}/leaderboard?rows=first&phase=${encodeURIComponent(phase)}&view=${encodeURIComponent(view)}`);
export const profileAPI = handle => request(`/profiles/${encodeURIComponent(handle)}`);
