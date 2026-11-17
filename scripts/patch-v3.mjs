// v3 (16/11/2026): na "Sua vista" some TUDO; um toque mostra os controles por 3 s. + cache dos arquivos.
import fs from 'node:fs';
const ler = n => fs.readFileSync(new URL('../' + n, import.meta.url), 'utf8');
const grava = (n, t) => fs.writeFileSync(new URL('../' + n, import.meta.url), t);
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error('não achei: ' + de.slice(0, 70)); return txt.replace(de, para); };

let h = ler('index.html');
// controles do modo vista só aparecem com body.olhoUI (toque na tela)
h = troca(h, `body.olho .olhoBarra{opacity:1;transform:translate(-50%,0);pointer-events:auto}`,
  `body.olho.olhoUI .olhoBarra{opacity:1;transform:translate(-50%,0);pointer-events:auto}
body.olho .ctrl{opacity:0;pointer-events:none;transition:opacity .4s}
body.olho.olhoUI .ctrl{opacity:1;pointer-events:auto}
body.olho.olhoUI .ctrl .zoom{display:none}`);
// faixas de cinema mais finas: o foco é a vista
h = troca(h, `.cinema::before,.cinema::after{content:"";position:absolute;left:0;right:0;height:9%;`, `.cinema::before,.cinema::after{content:"";position:absolute;left:0;right:0;height:5%;`);
h = troca(h, `.olhoBarra{position:absolute;left:50%;bottom:calc(9% + 14px);`, `.olhoBarra{position:absolute;left:50%;bottom:calc(5% + 14px);`);
h = troca(h, `.cinema .vinheta{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%)}`, `.cinema .vinheta{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 62%,rgba(0,0,0,.4) 100%)}`);
// selo que aparece sozinho por 2 s ao entrar
h = troca(h, `.olhoDica{`, `.olhoEntrada{position:absolute;left:50%;top:14%;transform:translateX(-50%);z-index:6;text-align:center;font:800 11px var(--f-tit);letter-spacing:.24em;text-transform:uppercase;color:var(--creme);text-shadow:0 2px 12px rgba(0,0,0,.8);opacity:0;pointer-events:none;transition:opacity .6s}
.olhoEntrada b{display:block;font-size:clamp(20px,4vw,30px);letter-spacing:-.01em;text-transform:none;color:#fff;margin-top:4px}
body.olho.olhoSelo1 .olhoEntrada{opacity:1}
.olhoDica{`);
h = troca(h, `    <div class="olhoBarra" id="olhoBarra">
      <div class="olhoSelo">Sua vista<b id="olhoNome">Camarote 14</b></div>`, `    <div class="olhoEntrada">Sua vista<b id="olhoNome2">Camarote 14</b></div>
    <div class="olhoBarra" id="olhoBarra">
      <div class="olhoSelo">Sua vista<b id="olhoNome">Camarote 14</b></div>`);
h = troca(h, `<div class="olhoDica">Arraste para olhar em volta · mude o horário no alto</div>`, `<div class="olhoDica">Arraste para olhar em volta</div>`);
// versão nos arquivos (o celular guardava o app.js velho)
h = troca(h, `<script type="module" src="app.js"></script>`, `<script type="module" src="app.js?v=3"></script>`);
grava('index.html', h);

let j = ler('app.js');
j = troca(j, `  document.getElementById('olhoNome').textContent = nome;`, `  document.getElementById('olhoNome').textContent = nome;
  document.getElementById('olhoNome2').textContent = nome;
  document.body.classList.remove('olhoUI');
  document.body.classList.add('olhoSelo1'); clearTimeout(entraNoOlho.t); entraNoOlho.t = setTimeout(() => document.body.classList.remove('olhoSelo1'), 2600);`);
j = troca(j, `  document.body.classList.remove('olho');`, `  document.body.classList.remove('olho', 'olhoUI', 'olhoSelo1');`);
// toque na tela no modo vista: mostra controles por 3 s
j = troca(j, `canvas.addEventListener('pointerdown', e => {
  baixo = [e.clientX, e.clientY];`, `function mostraControlesOlho() {
  if (!noOlho) return;
  document.body.classList.remove('olhoSelo1');
  document.body.classList.add('olhoUI');
  clearTimeout(mostraControlesOlho.t);
  mostraControlesOlho.t = setTimeout(() => document.body.classList.remove('olhoUI'), 3000);
}
canvas.addEventListener('pointerup', () => mostraControlesOlho());
document.getElementById('olhoBarra').addEventListener('pointerdown', () => mostraControlesOlho());
canvas.addEventListener('pointerdown', e => {
  baixo = [e.clientX, e.clientY];`);
grava('app.js', j);

// cabeçalhos: html/js/css sempre revalidam (nada de versão velha presa no celular)
grava('vercel.json', JSON.stringify({
  headers: [
    { source: '/(.*)\\.(html|js|css)', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
    { source: '/', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
  ],
}, null, 2) + '\n');
console.log('ok');
