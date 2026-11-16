// Assemble only the static application, the three captures and the kit dossier.
import {cpSync,mkdirSync,readdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,join,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildDossier} from './vendor/makefun-frontend.ts';
const base=dirname(fileURLToPath(import.meta.url));
const destination=resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
if(destination===base || base.startsWith(destination+sep) || ['app','screenshots','vendor','tools'].some(n=>destination===join(base,n)||destination.startsWith(join(base,n)+sep))) throw Error('Choose a separate output directory');
const expected=['1-board.jpg','2-bounty.jpg','3-leaderboard.jpg'];
if(JSON.stringify(readdirSync(join(base,'screenshots')).sort())!==JSON.stringify(expected)) throw Error('Exactly three named JPEG captures are required');
mkdirSync(destination,{recursive:true});
for(const folder of ['app','screenshots']) {rmSync(join(destination,folder),{recursive:true,force:true});cpSync(join(base,folder),join(destination,folder),{recursive:true});}
writeFileSync(join(destination,'dossier.json'),buildDossier(destination,{text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216}));
for(const file of readdirSync(join(base,'app')).sort()) {
  const source=readFileSync(join(base,'app',file),'utf8');
  const declarations=[...source.matchAll(/(?:function|const)\s+(\w+)/g)].map(m=>m[1]);
  console.log(`${file}: ${declarations.join(', ') || 'document and layout'}`);
}
console.log('Dossier ready: '+destination);
