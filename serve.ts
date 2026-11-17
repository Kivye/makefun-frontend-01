import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const base=fileURLToPath(new URL('.',import.meta.url));
const root=resolve(base,process.argv[2]||'app');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'));if(!path.startsWith(root+sep))throw Error();const body=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body)}catch{res.writeHead(404);res.end('Not found')}}).listen(8081,'127.0.0.1',()=>console.log('Serving '+root));
