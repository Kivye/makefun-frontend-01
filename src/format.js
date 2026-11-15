export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export const money = value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', minimumFractionDigits: Number(value) % 1 ? 2 : 0, maximumFractionDigits:2 }).format(Number(value) || 0);
export const number = value => new Intl.NumberFormat('en-US', { maximumFractionDigits:6 }).format(Number(value) || 0);
export const date = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'UTC' }).format(new Date(value)) + ' UTC' : 'Not announced';
export const accepting = bounty => Date.parse(bounty.deadline) > Date.now() && !['closed','resolved'].includes(bounty.status);
export function remaining(value) {
  const m = Math.ceil((Date.parse(value) - Date.now()) / 60000);
  if (!Number.isFinite(m)) return 'No deadline';
  if (m <= 0) return 'Ended';
  return m >= 1440 ? `${Math.floor(m / 1440)}d ${Math.floor(m % 1440 / 60)}h left` : `${Math.floor(m / 60)}h ${m % 60}m left`;
}
export const bountyURL = slug => '#/bounty/' + encodeURIComponent(slug);
export const profileURL = handle => '#/profile/' + encodeURIComponent(handle);
export const safeURL = value => { if (!value) return ''; try { const u = new URL(value, 'https://make.fun'); return u.protocol === 'https:' ? esc(u.href) : ''; } catch { return ''; } };
export function prose(value) {
  const source = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return esc(source || '').split(/\n\n+/).map(block => /^#{1,4} /.test(block) ? '<h3>' + block.replace(/^#{1,4} /, '') + '</h3>' : '<p>' + block.replace(/\n/g, '<br>') + '</p>').join('');
}
