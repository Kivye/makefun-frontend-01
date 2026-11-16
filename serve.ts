import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = await realpath(new URL('./app', import.meta.url));
const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const portArgument = process.argv.indexOf('--port');
const port = Number(process.argv[portArgument + 1]) || 8081;

createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method || '')) {
      response.writeHead(405).end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const file = await realpath(resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname)));
    if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) throw new Error('Not found');
    const bytes = await readFile(file);
    response.writeHead(200, {
      'Content-Type': (contentTypes[extname(file)] || 'application/octet-stream') + '; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Bounty desk: http://127.0.0.1:${port}`));
