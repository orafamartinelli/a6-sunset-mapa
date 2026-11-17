// v4 (16/11/2026): ao entrar na "Sua vista", giro automático de ~170°: palco → esquerda → direita → palco.
import fs from 'node:fs';
const ler = n => fs.readFileSync(new URL('../' + n, import.meta.url), 'utf8');
const grava = (n, t) => fs.writeFileSync(new URL('../' + n, import.meta.url), t);
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error('não achei: ' + de.slice(0, 70)); return txt.replace(de, para); };

let j = ler('app.js');
// 1) ao terminar o voo até o lugar, começa o giro
j = troca(j, `  voo.aoFim = () => { if (noOlho) Object.assign(ctl, ORBITA_OLHO); };`,
`  voo.aoFim = () => { if (noOlho) { Object.assign(ctl, ORBITA_OLHO); comecaGiro(); } };`);
// 2) motor do giro (yaw em volta do olho; o alvo fica 0,8 m à frente)
j = troca(j, `function saiDoOlho() {
  if (!noOlho) return;`, `// roteiro do giro: [ângulo em graus (positivo = esquerda), duração em ms até chegar nele]
const GIRO = [[0, 0], [0, 500], [85, 2400], [85, 450], [-85, 3800], [-85, 450], [0, 2300]];
let giro = null;
function comecaGiro() {
  if (!noOlho) return;
  const dir = ctl.target.clone().sub(cam.position); dir.y = 0;
  const alt = ctl.target.y - cam.position.y;
  giro = { olho: cam.position.clone(), dir: dir.normalize(), alt, t0: performance.now() };
}
function paraGiro() { giro = null; }
const EIXO_Y = new THREE.Vector3(0, 1, 0), vGiro = new THREE.Vector3();
function passoGiro() {
  if (!giro) return;
  let t = performance.now() - giro.t0, ang = 0, fim = true;
  for (let i = 1; i < GIRO.length; i++) {
    const [a0] = GIRO[i - 1], [a1, ms] = GIRO[i];
    if (t <= ms) { const k = ms ? t / ms : 1; ang = a0 + (a1 - a0) * ease(k); fim = false; break; }
    t -= ms; ang = a1;
  }
  vGiro.copy(giro.dir).applyAxisAngle(EIXO_Y, THREE.MathUtils.degToRad(ang)).multiplyScalar(0.8);
  vGiro.y = giro.alt;
  cam.position.copy(giro.olho);
  ctl.target.copy(giro.olho).add(vGiro);
  if (fim) giro = null;
}
function saiDoOlho() {
  if (!noOlho) return;
  paraGiro();`);
// 3) toque na tela interrompe o giro
j = troca(j, `  voo = null; esconderDica(); recolheFicha();`, `  voo = null; paraGiro(); esconderDica(); recolheFicha();`);
// 4) roda o giro a cada quadro, antes do ctl.update()
j = troca(j, `  ctl.update();
  // sombra acompanha o evento`, `  passoGiro();
  ctl.update();
  // sombra acompanha o evento`);
// 5) botão "olhar em volta de novo"
j = troca(j, `document.getElementById('olhoVoltar').onclick = voltaDoOlho;`, `document.getElementById('olhoVoltar').onclick = voltaDoOlho;
document.getElementById('olhoGirar').onclick = () => {
  if (!noOlho) return;
  if (giro) return;
  // volta o olhar ao palco antes de girar, para o giro sempre começar centrado
  const o = selId ? olhoDoLugar(porId.get(selId)) : (OLHO_SETOR[setorAtivo].lugar ? olhoDoLugar(porId.get(OLHO_SETOR[setorAtivo].lugar)) : OLHO_SETOR[setorAtivo]);
  const olho = new THREE.Vector3(...o.pos), dir = new THREE.Vector3(...o.alvo).sub(olho).normalize();
  cam.position.copy(olho); ctl.target.copy(olho).addScaledVector(dir, 0.8);
  comecaGiro();
  document.body.classList.remove('olhoUI');
};`);
grava('app.js', j);

let h = ler('index.html');
h = troca(h, `        <button class="btn vidro" id="olhoVoltar">↩ Voltar ao mapa</button>`, `        <button class="btn vidro" id="olhoVoltar">↩ Voltar ao mapa</button>
        <button class="btn vidro" id="olhoGirar" aria-label="Olhar em volta de novo">↔ Olhar em volta</button>`);
h = troca(h, `.olhoAcoes{display:flex;gap:8px}`, `.olhoAcoes{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}`);
h = h.replace(/app\.js\?v=\d+/, 'app.js?v=6');
grava('index.html', h);
console.log('ok');
