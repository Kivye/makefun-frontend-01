// Apply a reproducible local minifier to the hand-authored static modules.
import { createRequire } from 'node:module';
import { readdir, writeFile, readFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const esbuild = require(process.env.ESBUILD_MODULE || 'esbuild');
for (const name of await readdir('src')) {
  if (!name.endsWith('.js') && !name.endsWith('.css')) continue;
  const result = await esbuild.transform(await readFile('src/' + name,'utf8'),{loader:name.endsWith('.css')?'css':'js',minify:true,target:'es2022'});
  await writeFile('app/' + (name.endsWith('.css')?'style.css':name),result.code);
}
