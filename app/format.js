// Feature: escaped labels, money, dates, countdowns and deadline-based entry status.
export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const money = value => value == null || value === '' ? '—' : Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
export const count = value => value == null ? '—' : Number(value).toLocaleString('en-US');
export const date = value => !value || !Number.isFinite(Date.parse(value)) ? 'Not announced' : new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
export const shortDate = value => !Number.isFinite(Date.parse(value)) ? '—' : new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
export function remaining(value, now = Date.now()) {
  const minutes = Math.ceil((Date.parse(value) - now) / 60000);
  if (!Number.isFinite(minutes)) return 'No deadline';
  if (minutes <= 0) return 'Ended';
  return minutes >= 1440 ? `${Math.floor(minutes / 1440)}d ${Math.floor(minutes % 1440 / 60)}h` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
export const accepting = (bounty, now = Date.now()) => bounty?.acceptingSubmissions !== false && Date.parse(bounty?.deadline) > now && !['closed', 'resolved', 'paid', 'judging'].includes(String(bounty?.status).toLowerCase());
export function statusOf(bounty, now = Date.now()) {
  const status = String(bounty?.status || '').toLowerCase(), hours = (Date.parse(bounty?.deadline) - now) / 3600000;
  if (Number(bounty?.prizesPaid) > 0 || status === 'paid') return ['PAID', 'paid'];
  if (accepting(bounty, now)) return hours < 24 ? ['CLOSING SOON', 'soon'] : ['OPEN', 'open'];
  return ['ENDED', 'ended'];
}
export const bountyURL = slug => `#/bounty/${encodeURIComponent(slug || '')}`;
export const profileURL = handle => `#/profile/${encodeURIComponent(handle || '')}`;

export async function gzipLength(buffer) {
  if (!globalThis.CompressionStream) throw new Error('Gzip measurement unsupported');
  const compressed = new Blob([buffer]).stream().pipeThrough(new CompressionStream('gzip'));
  return (await new Response(compressed).arrayBuffer()).byteLength;
}
