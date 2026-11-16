// Keep missing and whitespace-only API numbers distinct from a real zero.
const entities = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'};
export const esc = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
const valid = value => value != null && String(value).trim() !== '' && Number.isFinite(Number(value));
export const count = value => valid(value) ? Number(value).toLocaleString('en-US') : '—';
export const money = value => valid(value) ? Number(value).toLocaleString('en-US', {style:'currency', currency:'USD', maximumFractionDigits:2}) : '—';
export const shortDate = value => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('en-GB', {day:'numeric', month:'short', timeZone:'UTC'}) : '—';
export function remaining(value, now = Date.now()) {
  const minutes = Math.ceil((Date.parse(value) - now) / 60000);
  if (!Number.isFinite(minutes)) return 'No deadline';
  if (minutes <= 0) return 'Ended';
  return minutes >= 1440 ? `${Math.floor(minutes/1440)}d ${Math.floor(minutes%1440/60)}h` : `${Math.floor(minutes/60)}h ${minutes%60}m`;
}
const state = item => String(item.status).trim().toLowerCase();
export const accepting = (item, now = Date.now()) => item.acceptingSubmissions !== false && Date.parse(item.deadline) > now && !['paid','closed','resolved','judging'].includes(state(item));
export function statusOf(item) {
  if (Number(item.prizesPaid) > 0 || state(item) === 'paid') return ['PAID','paid'];
  if (!accepting(item)) return ['ENDED','ended'];
  return Date.parse(item.deadline)-Date.now() < 86400000 ? ['CLOSING SOON','soon'] : ['OPEN','open'];
}
export const bountyURL = slug => '#/bounty/' + encodeURIComponent(slug || '');
export const profileURL = handle => '#/profile/' + encodeURIComponent(handle || '');
export async function gzipLength(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  return (await new Response(stream).arrayBuffer()).byteLength;
}
