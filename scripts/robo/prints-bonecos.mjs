// Prints de conferência dos bonecos (v14): voo por cima da dupla, vista geral, palco de média distância
// e "Sua vista" do backstage. Relógio virtual igual ao gravar-story.mjs.
//   node prints-bonecos.mjs <url> <pasta> <largura>x<altura> <prefixo>
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const [, , URL, PASTA, TAM = '1400x900', PRE = 'pc'] = process.argv;
const [w, h] = TAM.split('x').map(Number);
const celular = w < 600;
fs.mkdirSync(PASTA, { recursive: true });
const erros = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=d3d11'] });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: celular ? 2 : 1, isMobile: celular, hasTouch: celular });
page.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
page.on('pageerror', e => erros.push('pageerror: ' + e.message));
page.on('requestfailed', r => erros.push('falhou: ' + r.url()));
await page.addInitScript(() => {
  let T = 0; const fila = [];
  performance.now = () => T;
  window.requestAnimationFrame = cb => { fila.push(cb); return fila.length; };
  window.__passo = ms => { T += ms; const l = fila.splice(0); for (const f of l) f(T); };
  window.__T = () => T;
});
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 30000 }).catch(() => { });
await page.waitForTimeout(2500);
for (let i = 0; i < 6; i++) { await page.evaluate(() => window.__passo(16)); await page.waitForTimeout(150); }
await page.waitForTimeout(2000);   // texturas dos bonecos
const anda = async ms => { for (let f = 0; f < ms; f += 33) await page.evaluate(() => window.__passo(33)); };
const foto = async nome => { await page.waitForTimeout(250); await page.screenshot({ path: path.join(PASTA, `${PRE}-${nome}.jpg`), type: 'jpeg', quality: 88 }); };
// voo da abertura: entra no palco ~18,1 s, passa por cima da dupla ~19,4 s
await anda(18300); await foto('voo1');
await anda(700); await foto('voo2');
await anda(500); await foto('voo3');
await anda(12000); await foto('geral');
await page.evaluate(() => { location.hash = 'back'; });
await anda(2500); await foto('palco');
await page.click('#fVista').catch(e => erros.push('clique fVista: ' + e.message));
await anda(900); await foto('vista-back');
await anda(1500); await foto('vista-back-giro');
await anda(4000);
await page.evaluate(() => { const s = document.getElementById('horaSel'); s.value = 360; s.dispatchEvent(new Event('input')); });
await anda(800); await foto('vista-back-noite');
await browser.close();
console.log(erros.length ? 'ERROS:\n' + erros.join('\n') : 'sem erros no console');
