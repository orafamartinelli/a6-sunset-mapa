// v8 (17/11/2026): abertura cinematográfica pedida pelo Rafa — pista de avião → volta 360° (passando
// sobre a represa) → entra por cima dos camarotes → atravessa o palco pela lateral, por cima da dupla →
// sai do outro lado → por cima dos bistrôs → o teto abre → vista diagonal afastada para escolher a área.
import fs from 'node:fs';
const ler = n => fs.readFileSync(new URL('../' + n, import.meta.url), 'utf8');
const grava = (n, t) => fs.writeFileSync(new URL('../' + n, import.meta.url), t);
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error('não achei: ' + de.slice(0, 80)); return txt.replace(de, para); };

let j = ler('app.js');
j = troca(j, `  intro:  { pos: [150, 140, 260], alvo: [-10, 0, -90] },`, `  intro:  { pos: [-760, 90, -40], alvo: [-380, 18, -86] },`);

j = troca(j, `function voa(pos, alvo, ms = 1300) {`, `// ---------------------------------------------------------------------------
// abertura cinematográfica (roteiro fixo): [segundos, posição da câmera, para onde olha]
// ---------------------------------------------------------------------------
const ROTEIRO = [
  [0,    [-760, 90, -40],  [-380, 18, -86]],   // por cima da pista de avião, olhando a pista
  [3.2,  [-330, 48, -86],  [-60, 6, -70]],      // segue a pista rumo ao evento
  [6.0,  [-145, 50, -45],  [0, 4, -25]],        // começa a volta de 360°
  [8.6,  [-25, 46, -178],  [0, 4, -25]],        // por cima da represa
  [11.2, [145, 50, -35],   [0, 4, -25]],
  [13.8, [10, 48, 120],    [0, 4, -25]],
  [16.0, [-95, 30, 55],    [-21, 6, 5]],        // fecha a volta e desce
  [17.8, [-42, 9.5, 30],   [-21, 7, 0]],        // entra por baixo do beiral
  [19.4, [-21, 12.5, 10],  [-21, 8, -16]],      // por cima dos camarotes
  [21.0, [-20, 10.5, -14], [-8, 5, -27]],
  [22.6, [-13, 5.8, -27],  [0, 5, -27]],        // entra no palco pela lateral (backstage)
  [24.2, [0, 5.7, -26.8],  [9, 5, -26.6]],      // por cima da dupla
  [25.8, [13, 5.8, -27],   [24, 5, -12]],       // sai do outro lado
  [27.4, [20, 11, -13],    [24, 5, 5]],
  [29.0, [24, 11.5, 6],    [20, 4, 16]],        // por cima dos bistrôs — o teto começa a abrir
  [32.0, VISTAS.geral.pos, VISTAS.geral.alvo],  // diagonal afastada: escolher a área
];
const curvaPos = new THREE.CatmullRomCurve3(ROTEIRO.map(r => new THREE.Vector3(...r[1])), false, 'centripetal');
const curvaAlvo = new THREE.CatmullRomCurve3(ROTEIRO.map(r => new THREE.Vector3(...r[2])), false, 'centripetal');
let intro = null;
function comecaIntro() { intro = { t0: performance.now(), teto: false }; document.body.classList.add('intro'); }
function passoIntro() {
  if (!intro) return false;
  const s = (performance.now() - intro.t0) / 1000, n = ROTEIRO.length;
  let i = 0; while (i < n - 2 && s > ROTEIRO[i + 1][0]) i++;
  let u = THREE.MathUtils.clamp((s - ROTEIRO[i][0]) / (ROTEIRO[i + 1][0] - ROTEIRO[i][0]), 0, 1);
  if (i === n - 2) u = 1 - (1 - u) * (1 - u);               // pousa suave na vista final
  const k = (i + u) / (n - 1);
  curvaPos.getPoint(k, cam.position); curvaAlvo.getPoint(k, ctl.target); cam.lookAt(ctl.target);
  document.body.classList.toggle('introAviso', s > 3.5 && s < 14);
  if (!intro.teto && s > 26.6) { intro.teto = true; abreCobertura(true, 3000); }
  if (s >= ROTEIRO[n - 1][0]) terminaIntro();
  return true;
}
function terminaIntro() { intro = null; document.body.classList.remove('intro', 'introAviso'); if (cob.para === 0) abreCobertura(true, 1200); }
function pulaIntro() { if (!intro) return; terminaIntro(); voa(VISTAS.geral.pos, VISTAS.geral.alvo, 1400); }
document.getElementById('pularIntro').addEventListener('click', pulaIntro);
canvas.addEventListener('wheel', pulaIntro, { passive: true });

function voa(pos, alvo, ms = 1300) {`);

// laço: durante a abertura a câmera segue o roteiro (sem OrbitControls)
j = troca(j, `  passoGiro();
  ctl.update();`, `  passoGiro();
  if (!passoIntro()) ctl.update();`);
// início: roda a abertura (link com #lugar pula direto)
j = troca(j, `    if (!leHash()) vista('geral', 5200);
    // entra com o evento FECHADO (100% coberto) e a cobertura recolhe sozinha
    setTimeout(() => { if (!cob.mexeu && cob.para === 0) abreCobertura(true, 2800); }, leHash() ? 600 : 2000);`,
`    // abertura: evento FECHADO (100% coberto) do começo até os bistrôs; o teto abre no fim
    if (!leHash()) comecaIntro(); else setTimeout(() => abreCobertura(true, 900), 300);`);
// toque durante a abertura pula para o fim
j = troca(j, `canvas.addEventListener('pointerdown', e => {
  baixo = [e.clientX, e.clientY];`, `canvas.addEventListener('pointerdown', e => {
  if (intro) { pulaIntro(); baixo = null; return; }
  baixo = [e.clientX, e.clientY];`);
// o pôr do sol acontece durante o voo
j = troca(j, `let animHora = { de: 16.4, para: horaDoSlider(), t0: performance.now(), ms: 5200 };`, `let animHora = { de: 16.4, para: horaDoSlider(), t0: performance.now(), ms: 26000 };`);
grava('app.js', j);

let h = ler('index.html');
h = troca(h, `    <div class="cobAviso" aria-hidden="true"><b>☂ Evento 100% coberto</b><small>toque para ver por dentro</small></div>`,
`    <div class="cobAviso" aria-hidden="true"><b>☂ Evento 100% coberto</b><small>Represa Sendeski · Maringá</small></div>
    <button class="pular" id="pularIntro">Pular ›</button>`);
h = troca(h, `body.cobFechada .cobAviso{opacity:1}`, `body.introAviso .cobAviso{opacity:1}
.pular{position:absolute;right:max(16px, env(safe-area-inset-right,0px));bottom:18px;z-index:6;display:none;background:rgba(20,8,18,.55);backdrop-filter:blur(8px);border:1px solid var(--linha);color:var(--creme);border-radius:999px;padding:9px 16px;font:800 12px var(--f-tit);letter-spacing:.06em;cursor:pointer}
body.intro .pular{display:block}
body.intro .painel, body.intro .ctrl, body.intro .dica{opacity:0!important;pointer-events:none!important;transition:opacity .5s}`);
h = h.replace(/app\.js\?v=\d+/, 'app.js?v=11');
grava('index.html', h);
console.log('ok');
