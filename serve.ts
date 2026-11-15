import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const root = await realpath(new URL('./app',import.meta.url));
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };
const port = Number(process.argv[process.argv.indexOf('--port')+1]) || 8081;
createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method || '')) { res.writeHead(405).end(); return; }
    const path = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const file = await realpath(resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path)));
    if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) throw new Error('Not found');
    const bytes = await readFile(file);
    res.writeHead(200, {'Content-Type':(types[extname(file)] || 'application/octet-stream') + '; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404, {'Content-Type':'text/plain'}).end('Not found'); }
}).listen(port,'127.0.0.1',()=>console.log(`Bounty desk: http://127.0.0.1:${port}`));
