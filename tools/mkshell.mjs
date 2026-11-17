import {gzipSync} from 'node:zlib';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const bytes=gzipSync(await readFile(resolve(root,'app/index.html')),{level:9}).length;
await writeFile(resolve(root,'app/shell.json'),JSON.stringify({bytes}));
console.log(bytes);
