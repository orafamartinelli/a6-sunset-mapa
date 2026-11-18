// Grava o voo de abertura do mapa 3D em vídeo vertical (story 9:16), sem interface e sem áudio.
// Relógio virtual: cada quadro avança exatamente 1/FPS s, então o vídeo sai liso mesmo se o PC for lento.
//   node gravar-story.mjs <largura> <altura> <fps> <saida.mp4> [url]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [, , W = '720', H = '1280', FPS = '30', SAIDA = 'story.mp4', URL = 'https://orafamartinelli.com.br/sunset/'] = process.argv;
const w = +W, h = +H, fps = +FPS, escala = w / 360;
const DUR_VOO = 32 / 1.25 + 0.4, SEGURA = 3.5;      // roteiro 32 s ÷ VEL_INTRO 1,25 + respiro; 3,5 s parado no fim
const total = process.env.QUADROS ? +process.env.QUADROS : Math.round((DUR_VOO + SEGURA) * fps);
const pasta = fs.mkdtempSync(path.join(process.env.TEMP || 'C:/tmp', 'story-'));
const FF = fs.readdirSync('C:/Users/User/AppData/Local/Microsoft/WinGet/Packages').filter(d => d.startsWith('Gyan.FFmpeg'))
  .map(d => path.join('C:/Users/User/AppData/Local/Microsoft/WinGet/Packages', d))
  .flatMap(d => fs.readdirSync(d).filter(x => x.startsWith('ffmpeg-')).map(x => path.join(d, x, 'bin', 'ffmpeg.exe')))[0];

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=d3d11'] });
const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: escala, isMobile: true, hasTouch: true });
await page.addInitScript(() => {
  let T = 0; const fila = [];
  performance.now = () => T;
  window.requestAnimationFrame = cb => { fila.push(cb); return fila.length; };
  window.__passo = ms => { T += ms; const l = fila.splice(0); for (const f of l) f(T); };
});
// sem interface: só o logo no alto e os textos da cena
await page.addStyleTag({ content: '' }).catch(() => { });
await page.goto(URL + (URL.includes('?') ? '&' : '?') + 'gravar=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.addStyleTag({ content: `.painel,.ctrl,.pular,.dica,.legVendas,#topoComprar,.faixaDemo,.ficha,.aviso{display:none!important}
  .topo{background:linear-gradient(180deg,rgba(27,11,28,.55),rgba(27,11,28,0))!important} .carregando{transition:none!important}
  html,body{overflow:hidden!important}` });
await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 30000 }).catch(() => { });
await page.waitForTimeout(2500);
// esquenta até a abertura começar (o mapa dispara a abertura no 3º quadro)
for (let i = 0; i < 6; i++) { await page.evaluate(() => window.__passo(16)); await page.waitForTimeout(150); }
await page.waitForTimeout(1500);   // texturas e fontes do telão
const passo = 1000 / fps;
console.log(`gravando ${total} quadros ${w}x${h} @${fps} em ${pasta}`);
const t0 = Date.now();
for (let i = 0; i < total; i++) {
  await page.evaluate(ms => window.__passo(ms), passo);
  await page.screenshot({ path: path.join(pasta, `q${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93 });
  if (i % 60 === 0) console.log(`  ${i}/${total} (${Math.round((Date.now() - t0) / 1000)} s)`);
}
await browser.close();
execFileSync(FF, ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(pasta, 'q%05d.jpg'),
  '-vf', `scale=${w}:${h}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', w > 800 ? '17' : '21',
  '-movflags', '+faststart', '-an', SAIDA], { stdio: 'inherit' });
fs.rmSync(pasta, { recursive: true, force: true });
console.log('ok:', SAIDA, (fs.statSync(SAIDA).size / 1e6).toFixed(1) + ' MB', Math.round((Date.now() - t0) / 1000) + ' s');
