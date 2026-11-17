import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,join,extname,sep} from 'node:path';
const root=resolve(process.argv[2]||fileURLToPath(new URL('out',import.meta.url)));
const base=join(root,'app');
createServer(async(req,res)=>{try{const path=resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(path!==base&&!path.startsWith(base+sep))throw Error();const file=(await stat(path)).isDirectory()?join(path,'index.html'):path;res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}}).listen(8081,'127.0.0.1',()=>console.log(`Serving ${base}`));
