// Shared presentation keeps API strings escaped and deadlines in UTC.
export const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numeric = n => n != null && n !== '' && Number.isFinite(Number(n));
export const count = n => numeric(n) ? Number(n).toLocaleString('en-US') : '—';
export const money = n => numeric(n) ? Number(n).toLocaleString('en-US', {style:'currency',currency:'USD',maximumFractionDigits:2}) : '—';
export const shortDate = value => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}) : '—';
export function remaining(value, now = Date.now()) {
  const m = Math.ceil((Date.parse(value) - now) / 60000);
  return !Number.isFinite(m) ? 'No deadline' : m <= 0 ? 'Ended' : m >= 1440 ? `${Math.floor(m / 1440)}d ${Math.floor(m % 1440 / 60)}h` : `${Math.floor(m / 60)}h ${m % 60}m`;
}
export const accepting = (b, now = Date.now()) => b.acceptingSubmissions !== false && Date.parse(b.deadline) > now && !['paid','closed','resolved','judging'].includes(String(b.status).toLowerCase());
export function statusOf(b) {
  if (Number(b.prizesPaid) > 0 || String(b.status).toLowerCase() === 'paid') return ['PAID','paid'];
  if (!accepting(b)) return ['ENDED','ended'];
  return Date.parse(b.deadline) - Date.now() < 86400000 ? ['CLOSING SOON','soon'] : ['OPEN','open'];
}
export const bountyURL = slug => '#/bounty/' + encodeURIComponent(slug || '');
export const profileURL = handle => '#/profile/' + encodeURIComponent(handle || '');
export async function gzipLength(bytes) {
  return (await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()).byteLength;
}
