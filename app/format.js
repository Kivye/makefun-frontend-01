// Feature: API-safe text, money, deadline and status formatting.
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const num=v=>v==null?'—':Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
export const money=v=>v==null||v===''?'—':Number(v).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2});
export const date=v=>!v||!Number.isFinite(Date.parse(v))?'Not announced':new Date(v).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC';
export const shortDate=v=>{const t=typeof v==='number'?v:Date.parse(v);return!Number.isFinite(t)?'—':new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'});};
export function remaining(v,now=Date.now()){
 const m=Math.ceil((Date.parse(v)-now)/60000);
 return !Number.isFinite(m)?'No deadline':m<=0?'Ended':m>=1440?`${Math.floor(m/1440)}d ${Math.floor(m%1440/60)}h`:`${Math.floor(m/60)}h ${m%60}m`;
}
export const accepting=b=>b?.acceptingSubmissions===true||b?.acceptingSubmissions==null&&Date.parse(b?.deadline)>Date.now()&&!['closed','resolved','paid'].includes(String(b?.status).toLowerCase());
export function statusOf(b,now=Date.now()){
 const s=String(b?.status||'').toLowerCase(),h=(Date.parse(b?.deadline)-now)/36e5;
 if(b?.walletPaid||Number(b?.prizesPaid)>0||s==='paid')return['PAID','paid'];
 if(['judging','judged','resolving','resolved'].includes(s)||h<=0&&!accepting(b))return['JUDGING','judging'];
 if(accepting(b)&&h<48)return['CLOSING SOON',h<24?'urgent':'soon'];
 return accepting(b)?['OPEN','open']:[s.toUpperCase()||'CLOSED','judging'];
}
export const bountyURL=s=>'#/bounty/'+encodeURIComponent(s||'');
export const profileURL=h=>'#/profile/'+encodeURIComponent(h||'');
export async function gzipLength(bytes){return(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()).byteLength;}
export const shortBytes=n=>n<1024?`${n} B`:`${(n/1024).toFixed(1)} KB`;
