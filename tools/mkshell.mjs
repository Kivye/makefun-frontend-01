import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
const root=new URL('../',import.meta.url);
const bytes=gzipSync(await readFile(new URL('app/index.html',root)),{level:9}).length;
await writeFile(new URL('app/shell.json',root),JSON.stringify({bytes}));
console.log(`${bytes} B gzip-9 · one file`);
