import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {realpath,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=await realpath(new URL('app/',import.meta.url));
const index=process.argv.indexOf('--port'), port=index<0?8081:Number(process.argv[index+1]);
if (!Number.isInteger(port)||port<1||port>65535) throw Error('Port must be 1–65535');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript'};
createServer(async (request,response)=>{
  if (!['GET','HEAD'].includes(request.method||'')) {response.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  try {
    let path=decodeURIComponent(new URL(request.url||'/','http://localhost').pathname);
    if (path.endsWith('/')) path+='index.html';
    const file=await realpath(resolve(root,'.'+path));
    if (!file.startsWith(root+sep)||!(await stat(file)).isFile()) throw Error('Missing file');
    response.writeHead(200,{'Content-Type':(mime[extname(file)]||'application/octet-stream')+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if (request.method==='HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {response.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('Static app listening at 127.0.0.1:'+port));
