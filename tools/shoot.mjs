// Feature: capture exactly three verified live routes after the app reports readiness.
import { createRequire } from 'node:module';
import { mkdir, rm, copyFile, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = new URL('../', import.meta.url).pathname;
const shots = JSON.parse(await readFile(join(root, 'shots.json'), 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'], proxy: { bypass: '<-loopback>', server: process.env.SHOT_PROXY || 'http://127.0.0.1:18080' } });
const staging = join(root, 'test-results', 'live-shots');
await mkdir(staging, { recursive: true });
try {
  const page = await browser.newPage({ viewport: shots[0].viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [index, shot] of shots.entries()) {
    if (index === 0) await page.goto(`http://127.0.0.1:8081/${shot.route}`, { timeout: 20000, waitUntil: 'domcontentloaded' });
    else await page.evaluate(route => { window.__shotReady = false; location.hash = route; }, shot.route);
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 45000 });
    await page.waitForTimeout(700);
    if (await page.locator('.error').count()) throw new Error(await page.locator('.error').innerText());
    await page.locator(shot.expect).first().waitFor({ timeout: 5000 });
    await page.waitForFunction(() => !document.querySelector('#load-chip').textContent.includes('Measuring'), null, { timeout: 5000 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Horizontal overflow: ${shot.route}`);
    if (errors.length) throw new Error(errors.join('\n'));
    const file = join(staging, shot.file);
    await page.screenshot({ path: file, type: 'jpeg', quality: 82, fullPage: false });
    if ((await stat(file)).size > 262144) throw new Error(`Screenshot exceeds cap: ${shot.file}`);
    console.log(`captured ${shot.route}`);
  }
  await page.close();
  await mkdir(join(root, 'screenshots'), { recursive: true });
  for (const shot of shots) await copyFile(join(staging, shot.file), join(root, 'screenshots', shot.file));
} finally { await browser.close(); await rm(staging, { recursive: true, force: true }); }
console.log('Captured three live screenshots.');
