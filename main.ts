import {cpSync,mkdirSync,readdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildDossier} from './vendor/makefun-frontend.ts';
const source=dirname(fileURLToPath(import.meta.url)),destination=resolve(process.env.MAKEFUN_OUTPUT_DIR||'/output');
if(destination===source||['app','screenshots','vendor'].some(s=>destination===join(source,s)||destination.startsWith(join(source,s)+sep)))throw Error('Output would replace source files');
const pictures=readdirSync(join(source,'screenshots')).filter(s=>/\.(jpe?g|png)$/i.test(s)).sort();
if(pictures.length!==3)throw Error('Three screenshots required');
mkdirSync(destination,{recursive:true});
for(const name of ['app','screenshots']){rmSync(join(destination,name),{force:true,recursive:true});cpSync(join(source,name),join(destination,name),{recursive:true})}
writeFileSync(join(destination,'dossier.json'),buildDossier(destination,{text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216}));
const outline=readdirSync(join(source,'app')).sort().map(name=>({name,bytes:readFileSync(join(source,'app',name)).length}));
writeFileSync(join(destination,'outline.json'),JSON.stringify(outline,null,2)+'\n');
console.log(`Packaged ${outline.length} app files and ${pictures.length} screenshots in ${destination}`);
