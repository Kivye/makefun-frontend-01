import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';
const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
if (output === root || ['app','screenshots'].some(dir => output === join(root,dir)) || output.startsWith(join(root, 'app') + '/') || output.startsWith(join(root, 'screenshots') + '/')) throw new Error('Output must be separate from source assets');
const shots = readdirSync(join(root, 'screenshots')).filter(n => !n.startsWith('.'));
if (shots.length !== 3) throw new Error('Exactly 3 live screenshots are required. Run tools/shoot.mjs with working network first.');
mkdirSync(output, { recursive: true });
for (const dir of ['app','screenshots']) {
  rmSync(join(output,dir), { recursive:true, force:true });
  cpSync(join(root,dir), join(output,dir), { recursive:true, dereference:false });
}
writeFileSync(join(output,'dossier.json'), buildDossier(output, { text_max_bytes:163840, screenshots:{max:3,max_bytes:262144}, app_max_files:993, app_max_bytes:16777216 }));
console.log('Wrote app, screenshots and deterministic dossier');
