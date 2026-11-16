import {mkdirSync,readdirSync,readFileSync,writeFileSync,cpSync,rmSync} from 'node:fs';
import {resolve,join,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {buildDossier} from './vendor/makefun-frontend.ts';
const root=dirname(fileURLToPath(import.meta.url)),output=resolve(process.env.MAKEFUN_OUTPUT_DIR||'/output');
if(output===root||['app','vendor','screenshots'].some(n=>output===join(root,n)||output.startsWith(join(root,n)+sep)))throw Error('Choose an output outside source directories');
const shell=['index.html','style.css','main.js','views.js','api.js','format.js'],bytes=shell.reduce((n,f)=>n+gzipSync(readFileSync(join(root,'app',f)),{level:9}).length,0);
writeFileSync(join(root,'app/shell.json'),JSON.stringify({bytes})+'\n');
const images=readdirSync(join(root,'screenshots')).filter(f=>/\.(jpg|jpeg|png)$/i.test(f));if(images.length!==3)throw Error('Exactly three screenshot images required');
mkdirSync(output,{recursive:true});for(const name of ['app','screenshots']){rmSync(join(output,name),{recursive:true,force:true});cpSync(join(root,name),join(output,name),{recursive:true})}
writeFileSync(join(output,'outline.json'),JSON.stringify(readdirSync(join(root,'app')).sort().map(name=>({name,bytes:readFileSync(join(root,'app',name)).length})),null,2)+'\n');
writeFileSync(join(output,'dossier.json'),buildDossier(output,{text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216}));
console.log('Shell gzip-9: '+bytes+' bytes; dossier: '+output);
