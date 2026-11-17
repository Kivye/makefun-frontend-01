import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=dirname(fileURLToPath(import.meta.url)),root=resolve(process.argv[2]||resolve(repo,'out/app'));
createServer(async(req,res)=>{try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url||'/', 'http://localhost').pathname));if(path!==root&&!path.startsWith(root+sep))throw Error('path');if((await stat(path)).isDirectory())path=resolve(path,'index.html');let body=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg'} as Record<string,string>)[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body)}catch{res.writeHead(404);res.end('Not found')}}).listen(8081,'127.0.0.1',()=>console.log('Serving '+root));
