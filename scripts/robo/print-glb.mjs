// Print do visualizador de forma 3D (scripts/noite-bonecos/ver-glb.html). node print-glb.mjs <url> <saida.jpg>
import { chromium } from 'playwright-core';
const [, , URL, SAIDA] = process.argv;
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=d3d11'] });
const p = await b.newPage({ viewport: { width: 1200, height: 500 } });
p.on('pageerror', e => console.log('erro:', e.message));
await p.goto(URL);
await p.waitForFunction(() => document.title.startsWith('pronto'), null, { timeout: 120000 });
console.log(await p.title());
await p.screenshot({ path: SAIDA, type: 'jpeg', quality: 90 });
await b.close();
