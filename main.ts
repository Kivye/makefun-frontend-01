// Feature: stage the static frontend and live captures, summarize each source file, then write its deterministic dossier.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const protectedPaths = [root, join(root,'app'), join(root,'screenshots')];
if (protectedPaths.slice(1).some(path => output === path || output.startsWith(path + sep)) || output === root || root.startsWith(output + sep)) {
  throw new Error('Output must not replace or contain source files.');
}

const screenshotDir = join(root,'screenshots');
const screenshots = readdirSync(screenshotDir).filter(name => /\.(?:jpg|jpeg|png)$/i.test(name)).sort();
if (screenshots.length !== 3) throw new Error('Exactly three live screenshots are required before packaging.');
const requiredShots = ['1-board.jpg','2-bounty.jpg','3-leaderboard.jpg'];
if (screenshots.some((name,index) => name !== requiredShots[index])) throw new Error(`Expected exactly ${requiredShots.join(', ')}.`);

const sourceNames = readdirSync(join(root,'app')).filter(name => /\.(?:html|js|mjs|css|json)$/i.test(name)).sort();
const declarations = /\b(?:export\s+)?(?:async\s+)?(?:function|class)\s+([\w$]+)|\bexport\s+(?:const|let|var)\s+([\w$]+)/g;
const outline = sourceNames.map(name => {
  const source = readFileSync(join(root,'app',name),'utf8');
  const feature = source.match(/Feature:\s*([^\n*]+)/)?.[1]?.replace(/\s*-->/,'').trim() || 'No feature summary supplied.';
  const found = [...source.matchAll(declarations)].map(match => match[1] || match[2]);
  return { name, feature, declarations:[...new Set(found)] };
});

mkdirSync(output,{recursive:true});
for (const name of ['app','screenshots']) {
  rmSync(join(output,name),{recursive:true,force:true});
  cpSync(join(root,name),join(output,name),{recursive:true,dereference:false});
}
const caps = { text_max_bytes:163840, screenshots:{max:3,max_bytes:262144}, app_max_files:993, app_max_bytes:16777216 };
const dossier = buildDossier(output,caps);
writeFileSync(join(output,'dossier.json'),dossier);
// Keep the submission limited to the app, three captures and dossier.
for (const file of outline) {
  console.log(`app/${file.name}: ${file.declarations.join(', ') || 'page/style declarations'} — ${file.feature}`);
}
console.log(`Wrote ${screenshots.length} screenshots and deterministic dossier to ${output}`);
