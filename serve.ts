// A loopback static server with path containment and no write methods.
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {realpath,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const directory=await realpath(new URL('./app',import.meta.url));
const position=process.argv.indexOf('--port');
const port=position<0?8081:Number(process.argv[position+1]);
if(!Number.isInteger(port)||port<1||port>65535) throw Error('Invalid port');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript'};
createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method||'')) {res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  try {
    const path=decodeURIComponent(new URL(req.url||'/','http://localhost').pathname);
    const file=await realpath(resolve(directory,'.'+(path.endsWith('/')?path+'index.html':path)));
    if(!file.startsWith(directory+sep)||!(await stat(file)).isFile()) throw Error('Missing');
    res.writeHead(200,{'Content-Type':(types[extname(file)]||'application/octet-stream')+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD') res.end();else createReadStream(file).pipe(res);
  } catch {res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Serving on http://127.0.0.1:${port}`));
