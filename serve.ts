import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
const root=resolve(process.env.MAKEFUN_OUTPUT_DIR||'out','app');
createServer((q,s)=>{try{const name=decodeURIComponent(new URL(q.url||'/', 'http://localhost').pathname);const file=resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+'/'))throw Error('path');s.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'})[extname(file)]||'application/octet-stream');s.setHeader('Cache-Control','no-store');s.end(readFileSync(file))}catch{s.writeHead(404);s.end('Not found')}}).listen(8081,'127.0.0.1',()=>console.log('Serving 127.0.0.1:8081'));
