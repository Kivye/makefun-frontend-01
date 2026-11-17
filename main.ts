import {buildDossier} from './vendor/makefun-frontend.ts';
import {cp,mkdir,rm,writeFile,readdir,stat} from 'node:fs/promises';
import {dirname,resolve,isAbsolute,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=dirname(fileURLToPath(import.meta.url));
const outputDir=resolve(process.env.MAKEFUN_OUTPUT_DIR||'/output');
const within=(a:string,b:string)=>a===b||(!relative(b,a).startsWith('..')&&!isAbsolute(relative(b,a)));
if(outputDir===repo||['app','screenshots','vendor'].some(p=>within(outputDir,resolve(repo,p))))throw Error('Unsafe output directory');
await mkdir(outputDir,{recursive:true});
for(const name of ['app','screenshots']){await rm(resolve(outputDir,name),{recursive:true,force:true});await cp(resolve(repo,name),resolve(outputDir,name),{recursive:true});}
await writeFile(resolve(outputDir,'dossier.json'),buildDossier(outputDir,{text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216}));
async function files(dir:string,prefix=''):Promise<{name:string,bytes:number}[]>{let result=[];for(const n of await readdir(dir)){const path=resolve(dir,n),s=await stat(path),name=prefix+n;if(s.isDirectory())result.push(...await files(path,name+'/'));else result.push({name,bytes:s.size});}return result;}
await writeFile(resolve(outputDir,'outline.json'),JSON.stringify((await files(resolve(repo,'app'))).sort((a,b)=>a.name.localeCompare(b.name)),null,2)+'\n');
console.log('Built app, screenshots, canonical dossier and source outline → '+outputDir);
