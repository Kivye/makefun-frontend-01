import {cpSync,existsSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {buildDossier} from './tools/dossier.ts';
// vendor/makefun-frontend.ts in the inherited tree is empty and remains untouched.
// tools/dossier.ts is the unmodified official kit helper.
const out=process.env.MAKEFUN_OUTPUT_DIR||'/output';
const html=readFileSync('app/index.html');
const bytes=gzipSync(html,{level:9}).length;
if(!html.includes('Number(\"'+bytes+'\")'))throw Error('Update embedded size label to the measured gzip-9 size: '+bytes);
rmSync('app/shell.json',{force:true});writeFileSync('app/shell.json',JSON.stringify({bytes,method:'one file · gzip-9',files:['index.html']})+'\n');
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
cpSync('app',out+'/app',{recursive:true});
mkdirSync(out+'/screenshots',{recursive:true});
if(existsSync('screenshots'))cpSync('screenshots',out+'/screenshots',{recursive:true});
writeFileSync(out+'/dossier.json',buildDossier(out,{text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216}));
console.log('Dossier built; one file:',bytes,'B gzip-9');
