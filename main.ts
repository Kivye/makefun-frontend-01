import { buildDossier } from './vendor/makefun-frontend.ts';
import {fileURLToPath} from 'node:url';
import {resolve,join,relative,isAbsolute} from 'node:path';
import {mkdir,rm,cp,writeFile,readdir,stat} from 'node:fs/promises';
const root=fileURLToPath(new URL('.',import.meta.url));
const outputDir=resolve(process.env.MAKEFUN_OUTPUT_DIR||'/output');
if(outputDir===resolve(root)||['app','screenshots','vendor'].some(p=>{const r=relative(join(root,p),outputDir);return r===''||(!r.startsWith('..')&&!isAbsolute(r))}))throw Error('Unsafe output directory');
await mkdir(outputDir,{recursive:true});
for(const name of ['app','screenshots']){await rm(join(outputDir,name),{recursive:true,force:true});await cp(join(root,name),join(outputDir,name),{recursive:true});}
await writeFile(join(outputDir,'dossier.json'),buildDossier(outputDir,{text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216}));
const files=[];
async function walk(dir,prefix=''){for(const e of await readdir(dir,{withFileTypes:true})){const name=prefix+e.name,path=join(dir,e.name);if(e.isDirectory())await walk(path,name+'/');else files.push({name,bytes:(await stat(path)).size});}}
await walk(join(root,'app'));files.sort((a,b)=>a.name.localeCompare(b.name));
await writeFile(join(outputDir,'outline.json'),JSON.stringify(files,null,2)+'\n');
console.log(`Built ${files.length} app files to ${outputDir}`);
