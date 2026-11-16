import {mkdirSync,rmSync,cpSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildDossier} from './vendor/makefun-frontend.ts';
const root=fileURLToPath(new URL('.',import.meta.url));
const output=resolve(process.env.MAKEFUN_OUTPUT_DIR||'/output');
if (resolve(root)===output || resolve(root).startsWith(output+sep) || ['app','vendor','screenshots','tools'].some(name=>output===join(root,name)||output.startsWith(join(root,name)+sep))) throw Error('Output would overwrite source files');
const names=['1-board.jpg','2-bounty.jpg','3-leaderboard.jpg'];
if (JSON.stringify(readdirSync(join(root,'screenshots')).sort())!==JSON.stringify(names)) throw Error('Three named JPEGs required');
mkdirSync(output,{recursive:true});
for (const folder of ['app','screenshots']) {
  rmSync(join(output,folder),{recursive:true,force:true});
  cpSync(join(root,folder),join(output,folder),{recursive:true});
}
const dossier=buildDossier(output,{text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216});
writeFileSync(join(output,'dossier.json'),dossier);
console.log('Static dossier written to '+output);
