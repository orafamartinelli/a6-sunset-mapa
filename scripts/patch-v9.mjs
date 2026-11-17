// v9 (17/11/2026): todo "Comprar" vai para o WhatsApp de vendas (+55 44 9857-9760) com o lugar na mensagem;
// camada de disponibilidade pronta (planilha da A6 entra depois em VENDAS.csv; ?demo=1 mostra a ideia).
import fs from 'node:fs';
const ler = n => fs.readFileSync(new URL('../' + n, import.meta.url), 'utf8');
const grava = (n, t) => fs.writeFileSync(new URL('../' + n, import.meta.url), t);
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error('não achei: ' + de.slice(0, 80)); return txt.replace(de, para); };

let j = ler('app.js');
j = troca(j, `for (const id of ['topoComprar', 'rodComprar', 'fComprar']) document.getElementById(id).href = Q2;`,
`// vendas: tudo pelo WhatsApp (pedido do Rafa 17/11) — a mensagem já leva o lugar escolhido
const ZAP = '554498579760';
const linkZap = lugar => 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(
  'Olá! Vi o mapa do Sunset Experience (Zezé Di Camargo & Luciano · 05/12) e quero comprar' + (lugar ? ': ' + lugar + '.' : ' ingresso.'));
for (const id of ['topoComprar', 'rodComprar', 'fComprar']) document.getElementById(id).href = linkZap('');
// disponibilidade: planilha da A6 publicada como CSV (colunas: lugar, status). Vazio = sem indicação.
const VENDAS = { csv: '', aCada: 60000 };
const vendidos = new Set();
let comVendas = false;`);

j = troca(j, `  const b = document.getElementById('fComprar');
  b.style.display = S.semVenda ? 'none' : '';`, `  const b = document.getElementById('fComprar');
  b.style.display = S.semVenda ? 'none' : '';
  b.href = linkZap(titulo); b.textContent = 'Compre agora'; b.onclick = null;`);

j = troca(j, `  else abreFicha('lounge', 'Lounge ' + l.num, 'Na beira da passarela');
  pinta();`, `  else abreFicha('lounge', 'Lounge ' + l.num, 'Na beira da passarela');
  if (comVendas && l.vendido) {
    document.getElementById('fPreco').textContent = 'Vendido';
    document.getElementById('fMiniPreco').textContent = 'Vendido';
    const b = document.getElementById('fComprar');
    b.textContent = 'Ver os livres deste setor'; b.href = '#';
    b.onclick = e => { e.preventDefault(); escolheSetor(l.setor); };
  }
  pinta();`);

// cores: livre destacado (dourado), vendido discreto — nada fica cinza
j = troca(j, `    if (l.inst != null) tampos.setColorAt(l.inst, sel ? COR_SOL : hov || doSetor ? COR_HOVER : COR_TAMPO);
    else if (l.mesh) { l.mesh.material.emissive.set(sel ? 0xffc21a : hov ? 0x6a4a10 : doSetor ? 0x3a2a08 : 0); l.mesh.material.emissiveIntensity = sel ? 0.9 : 1; }
    l.tag.classList.toggle('sel', sel);`,
`    const livre = comVendas && !l.vendido && l.tipo !== 'lounge', vend = comVendas && l.vendido;
    if (l.inst != null) tampos.setColorAt(l.inst, sel ? COR_SOL : hov || doSetor ? COR_HOVER : livre ? COR_LIVRE : vend ? COR_VENDIDO : COR_TAMPO);
    else if (l.mesh) { l.mesh.material.emissive.set(sel ? 0xffc21a : hov ? 0x6a4a10 : doSetor ? 0x3a2a08 : livre ? 0x5a3a00 : 0); l.mesh.material.emissiveIntensity = sel ? 0.9 : 1; }
    l.tag.classList.toggle('sel', sel);
    l.tag.classList.toggle('livre', livre); l.tag.classList.toggle('vendido', vend);`);
j = troca(j, `const COR_TAMPO = new THREE.Color(0xf6f0e6), COR_SOL = new THREE.Color(0xffc21a), COR_HOVER = new THREE.Color(0xffe8a3);`,
`const COR_TAMPO = new THREE.Color(0xf6f0e6), COR_SOL = new THREE.Color(0xffc21a), COR_HOVER = new THREE.Color(0xffe8a3);
const COR_LIVRE = new THREE.Color(0xffd36b), COR_VENDIDO = new THREE.Color(0xa8a097);`);

// "Sua vista": botão comprar também vai pro WhatsApp com o lugar
j = troca(j, `  comprar.href = Q2; comprar.style.display = SETORES[st].semVenda ? 'none' : '';`, `  comprar.href = linkZap(nome); comprar.style.display = SETORES[st].semVenda ? 'none' : '';`);

// carga da disponibilidade (antes do laço)
j = troca(j, `// ---------------------------------------------------------------------------
// laço
// ---------------------------------------------------------------------------`, `// ---------------------------------------------------------------------------
// disponibilidade (planilha da A6 → CSV público). ?demo=1 simula vendidos só para mostrar a ideia.
// ---------------------------------------------------------------------------
const idDoTexto = t => {
  const s = String(t).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim(), n = parseInt((s.match(/\\d+/) || [])[0], 10);
  if (!n) return null;
  return /^c|cam/.test(s) ? 'c' + n : /^b|bis/.test(s) ? 'b' + n : null;
};
async function carregaVendas() {
  const demo = new URLSearchParams(location.search).has('demo');
  const novos = new Set();
  try {
    if (demo) {
      for (const l of lugares) if (l.tipo !== 'lounge' && ((l.num * 37 + (l.tipo === 'cam' ? 11 : 3)) % 10) < 4) novos.add(l.id);
    } else if (VENDAS.csv) {
      const txt = await (await fetch(VENDAS.csv + (VENDAS.csv.includes('?') ? '&' : '?') + 't=' + Date.now())).text();
      for (const linha of txt.split(/\\r?\\n/).slice(1)) {
        const [lugar, status] = linha.split(',').map(x => (x || '').replace(/^"|"$/g, ''));
        const id = idDoTexto(lugar); if (id && /vend/i.test(status)) novos.add(id);
      }
    } else return;
  } catch (e) { return; }                       // sem planilha: o mapa segue sem indicação
  comVendas = true; vendidos.clear(); novos.forEach(v => vendidos.add(v));
  for (const l of lugares) l.vendido = vendidos.has(l.id);
  document.body.classList.add('comVendas');
  pinta();
}
carregaVendas();
if (VENDAS.csv) setInterval(carregaVendas, VENDAS.aCada);

// ---------------------------------------------------------------------------
// laço
// ---------------------------------------------------------------------------`);
grava('app.js', j);

let h = ler('index.html');
h = troca(h, `.num.longe{opacity:0;pointer-events:none}`, `.num.longe{opacity:0;pointer-events:none}
.num.livre{background:var(--sol);color:#3a0d12;border-color:#fff3c4;box-shadow:0 0 0 0 rgba(255,194,26,.6);animation:livre 2.2s infinite}
.num.vendido{background:rgba(20,8,18,.45);color:rgba(255,255,255,.55);border-color:transparent;text-decoration:line-through}
.num.livre.sel{animation:none}
@keyframes livre{70%{box-shadow:0 0 0 7px rgba(255,194,26,0)}100%{box-shadow:0 0 0 0 rgba(255,194,26,0)}}
.legVendas{display:none;gap:12px;align-items:center;background:var(--vidro);backdrop-filter:blur(12px);border:1px solid var(--linha);border-radius:999px;padding:7px 12px;font:700 11px var(--f-txt);color:var(--creme)}
.legVendas i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
body.comVendas .legVendas{display:inline-flex}`);
h = troca(h, `      <button class="coberto" id="cobertoBtn"`, `      <div class="legVendas"><span><i style="background:var(--sol)"></i>Livre</span><span><i style="background:rgba(255,255,255,.3)"></i>Vendido</span></div>
      <button class="coberto" id="cobertoBtn"`);
h = h.replace(/>Comprar na Q2</g, '>Compre agora<');
h = h.replace(/app\.js\?v=\d+/, 'app.js?v=12');
grava('index.html', h);
console.log('ok');
