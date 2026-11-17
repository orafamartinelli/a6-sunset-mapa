// v6 (17/11/2026): palco e backstages pelas plantas técnicas (Cenário One), grade palco×backstage,
// público novo (corpo, cabeça, chapéu, braços, dança), cantores provisórios e cobertura total em arco
// que abre quando a página carrega + selo "100% coberto".
import fs from 'node:fs';
const ler = n => fs.readFileSync(new URL('../' + n, import.meta.url), 'utf8');
const grava = (n, t) => fs.writeFileSync(new URL('../' + n, import.meta.url), t);
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error('não achei: ' + de.slice(0, 80)); return txt.replace(de, para); };

let j = ler('app.js');

// ---------- A) palco pelas plantas ----------
j = troca(j, `caixa(18, 1.8, 8, 0x1b1b21, 0, 0.9 + 0.3, -26);
for (const [x, z] of [[-9.2, -22.3], [9.2, -22.3], [-9.2, -29.7], [9.2, -29.7]]) caixa(0.5, 10.5, 0.5, 0, x, 5.55, z, { material: metal });
caixa(19, 0.8, 0.6, 0, 0, 10.6, -22.3, { material: metal });
caixa(19, 0.8, 0.6, 0, 0, 10.6, -29.7, { material: metal });
caixa(0.6, 0.8, 8, 0, -9.2, 10.6, -26, { material: metal });
caixa(0.6, 0.8, 8, 0, 9.2, 10.6, -26, { material: metal });
caixa(19.4, 0.2, 8.6, 0x141418, 0, 11.1, -26);
for (const x of [-10.4, 10.4]) caixa(1.1, 4.2, 1.1, 0x111114, x, 7.6, -22.6);
// telão de LED
const ledCanvas = document.createElement('canvas'); ledCanvas.width = 1024; ledCanvas.height = 440;
const led = ledCanvas.getContext('2d');
const ledTex = new THREE.CanvasTexture(ledCanvas); ledTex.colorSpace = THREE.SRGBColorSpace;
const telao = new THREE.Mesh(new THREE.PlaneGeometry(15.5, 6.6), new THREE.MeshBasicMaterial({ map: ledTex, toneMapped: false }));
telao.position.set(0, 5.6, -29.35); cena.add(telao);`,
`// Medidas tiradas das plantas da Cenário One (escala pelos painéis de LED 0,5 × 1 m):
// telão central 10 × 5 m, telas laterais 4,5 × 4 m, treliça 12,7 m de boca × 11,4 m de fundo,
// 6,2 m de altura livre; backstages 8 × 10 m colados ao palco, NO MESMO NÍVEL, separados por grade.
const PISO_PALCO = 2.5;              // topo do piso do palco (praticável de 2,2 m)
const TOPO = PISO_PALCO + 6.2;       // topo da treliça
caixa(13, 2.2, 11.4, 0x1b1b21, 0, 0.3 + 1.1, -27.7);           // palco: z −33,4 a −22
caixa(11, 2.2, 2.8, 0x1b1b21, 0, 1.4, -34.8);                  // corredor backstage atrás do telão
const trelica = mat(0xb9bcc2, { metalness: 0.7, roughness: 0.35 });
const torre = (x, z) => caixa(0.42, TOPO - PISO_PALCO, 0.42, 0, x, (TOPO + PISO_PALCO) / 2, z, { material: trelica });
const viga = (x0, x1, z0, z1, y = TOPO) => caixa(Math.abs(x1 - x0) + 0.42, 0.42, Math.abs(z1 - z0) + 0.42, 0, (x0 + x1) / 2, y, (z0 + z1) / 2, { material: trelica });
for (const [x, z] of [[-6.5, -22.4], [6.5, -22.4], [-6.5, -33], [6.5, -33], [-12.2, -33], [12.2, -33]]) torre(x, z);
viga(-6.5, 6.5, -22.4, -22.4); viga(-12.2, 12.2, -33, -33);
viga(-6.5, -6.5, -33, -22.4); viga(6.5, 6.5, -33, -22.4);
for (const z of [-25, -27.6, -30.2]) viga(-6.5, 6.5, z, z, TOPO - 0.15);
// line arrays (PA) pendurados na boca do palco
for (const x of [-6.9, 6.9]) {
  const pa = caixa(1.1, 4.4, 0.9, 0x1a1a1f, x, PISO_PALCO + 2.7, -21.6);
  pa.rotation.x = -0.08;
}
// telão de LED (10 × 5 m) + telas laterais (4,5 × 4 m)
const ledCanvas = document.createElement('canvas'); ledCanvas.width = 1024; ledCanvas.height = 512;
const led = ledCanvas.getContext('2d');
const ledTex = new THREE.CanvasTexture(ledCanvas); ledTex.colorSpace = THREE.SRGBColorSpace;
const ledMat = new THREE.MeshBasicMaterial({ map: ledTex, toneMapped: false });
const telao = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), ledMat);
telao.position.set(0, PISO_PALCO + 2.65, -32.55); cena.add(telao);
for (const x of [-9.2, 9.2]) { const lat = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4), ledMat); lat.position.set(x, PISO_PALCO + 2.9, -32.7); cena.add(lat); }
// grade (gradil de show): plano com barras vazadas + corrimão
const gradeTex = (() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#a3a7ae'; g.fillRect(0, 0, 64, 7); g.fillRect(0, 30, 64, 4); g.fillRect(0, 58, 64, 6);
  for (let x = 4; x < 64; x += 16) g.fillRect(x, 0, 3, 64);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
})();
function grade(x0, z0, x1, z1, y, h = 1.1) {
  const L = Math.hypot(x1 - x0, z1 - z0);
  const tex = gradeTex.clone(); tex.needsUpdate = true; tex.repeat.set(L / 0.6, 1);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(L, h), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.5 }));
  m.position.set((x0 + x1) / 2, y + h / 2, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  cena.add(m); return m;
}
// cantores PROVISÓRIOS (serão trocados pelos bonecos 3D da dupla)
const cantores = new THREE.Group(); cena.add(cantores);
{
  const pele = mat(0xc99a78), preto = mat(0x15151a, { roughness: 0.6 }), jeans = mat(0x2b3a55);
  const fazCantor = (x, camisa, chapeu) => {
    const g = new THREE.Group();
    const add = (geo, m, y, px = 0, rz = 0) => { const k = new THREE.Mesh(geo, m); k.position.set(px, y, 0); k.rotation.z = rz; k.castShadow = true; g.add(k); return k; };
    add(new THREE.BoxGeometry(0.34, 0.86, 0.2), jeans, 0.43);
    add(new THREE.CapsuleGeometry(0.19, 0.44, 4, 12), mat(camisa), 1.15).scale.set(1.15, 1, 0.75);
    add(new THREE.SphereGeometry(0.12, 16, 12), pele, 1.64);
    add(new THREE.CapsuleGeometry(0.055, 0.5, 3, 8).translate(0, -0.3, 0), mat(camisa), 1.45, -0.24, -0.15);
    const bd = add(new THREE.CapsuleGeometry(0.055, 0.5, 3, 8).translate(0, -0.3, 0), mat(camisa), 1.45, 0.24, 2.5);
    const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.2, 8), preto); mic.position.set(0, -0.62, 0); bd.add(mic);
    if (chapeu) { add(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 24), mat(chapeu), 1.74); add(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16), mat(chapeu), 1.83); }
    else add(new THREE.SphereGeometry(0.128, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), preto, 1.66);
    g.position.set(x, PISO_PALCO, -25.2); g.rotation.y = x < 0 ? 0.12 : -0.12; cantores.add(g);
  };
  fazCantor(-1.3, 0x1c1c22, 0x2a1c14);
  fazCantor(1.3, 0xe8e2d8, null);
}`);

// ---------- B) backstages no nível do palco, com grade ----------
j = troca(j, `const backs = [];
for (const [x, z] of [[-21, -26], [21, -24]]) {
  caixa(12, 3, 8, 0, x, 1.8, z, { material: estrutura });
  backs.push(caixa(12, 0.3, 8, 0x1f6fe5, x, 3.45, z));
  for (const s of [-1, 1]) caixa(12, 1.0, 0.06, 0, x, 4.1, z + s * 4, { material: vidro, sombra: false });
}
caixa(12, 0.3, 3, 0x9a958d, 21, 0.45, -18.5);`,
`const backs = [];
for (const s of [-1, 1]) {
  const x = s * 10.5;                                            // de 6,5 a 14,5 m do centro
  caixa(8, 2.2, 10, 0, x, 1.4, -27, { material: estrutura });
  backs.push(caixa(8, 0.1, 10, 0x1f6fe5, x, PISO_PALCO + 0.05, -27));
  grade(s * 6.5, -32, s * 6.5, -22.2, PISO_PALCO);              // só uma grade entre o público e a dupla
  grade(s * 6.5, -22, s * 14.5, -22, PISO_PALCO);               // frente
  grade(s * 14.5, -32, s * 14.5, -26.4, PISO_PALCO);            // lateral (abertura da escada)
  grade(s * 14.5, -25.1, s * 14.5, -22, PISO_PALCO);
  // escada de acesso pelo lado de fora
  for (let k = 0; k < 10; k++) { const h = (k + 1) * 0.22; caixa(1.6, h, 0.5, 0, s * 15.3, 0.3 + h / 2, -21.25 - k * 0.5, { material: estrutura }); }
}`);

// ---------- C) sai a lona dos camarotes (vira cobertura total) ----------
j = troca(j, `// cobertura tensionada sobre os camarotes
{
  const lona = new THREE.Mesh(new THREE.PlaneGeometry(13, 42, 12, 24), new THREE.MeshStandardMaterial({ color: 0xfff6ea, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }));
  const p = lona.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getY(i) / 42 + 0.5) * Math.PI * 6) * 0.35 * Math.cos(p.getX(i) / 13 * Math.PI));
  lona.geometry.computeVertexNormals();
  lona.rotation.x = -Math.PI / 2; lona.rotation.y = -0.12;
  lona.position.set(-21.2, 12.2, 0.5); lona.castShadow = true; cena.add(lona);
  for (const z of [-20, -6, 8, 21]) for (const x of [-27]) caixa(0.22, x < -20 ? 13.4 : 11.6, 0.22, 0, x, (x < -20 ? 13.4 : 11.6) / 2 + 0.3, z, { material: metal });
}`,
`// ---------------------------------------------------------------------------
// cobertura total em arco (evento 100% coberto) — sem pilar dentro: colunas só nas bordas (x = ±30)
// ---------------------------------------------------------------------------
const COB = { x: 30, z0: -37.5, z1: 22.5, beiral: 10, flecha: 8, n: 8 };
const yArco = x => COB.beiral + COB.flecha * (1 - (x / COB.x) ** 2);
const passoCob = (COB.z1 - COB.z0) / COB.n;
function geoLona(comp) {
  const sx = 30, sv = 6, pos = [], idx = [];
  for (let jj = 0; jj <= sv; jj++) for (let i = 0; i <= sx; i++) { const x = -COB.x + 2 * COB.x * i / sx, v = jj / sv; pos.push(x, yArco(x) - Math.sin(Math.PI * v) * 0.55, v * comp); }
  for (let jj = 0; jj < sv; jj++) for (let i = 0; i < sx; i++) { const a = jj * (sx + 1) + i, b = a + 1, c = a + sx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const paineis = [];
const lonaFantasma = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false });
{
  const gL = geoLona(passoCob);
  for (let k = 0; k < COB.n; k++) {
    const z = COB.z0 + k * passoCob;
    const m = new THREE.Mesh(gL, new THREE.MeshStandardMaterial({ color: 0xfbf6ee, roughness: 0.85, side: THREE.DoubleSide, transparent: true, opacity: 0.97 }));
    m.position.z = z; cena.add(m); paineis.push(m);
    const f = new THREE.Mesh(gL, lonaFantasma); f.position.z = z; f.renderOrder = 3; cena.add(f);
  }
  const metalCob = mat(0xe4e0d8, { metalness: 0.55, roughness: 0.4 });
  const pts = []; for (let i = 0; i <= 40; i++) { const x = -COB.x + 2 * COB.x * i / 40; pts.push(new THREE.Vector3(x, yArco(x) + 0.05, 0)); }
  const gArco = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.16, 6, false);
  for (let k = 0; k <= COB.n; k++) {
    const z = COB.z0 + k * passoCob;
    const a = new THREE.Mesh(gArco, metalCob); a.position.z = z; cena.add(a);
    for (const x of [-COB.x, COB.x]) caixa(0.36, COB.beiral, 0.36, 0, x, COB.beiral / 2 + 0.05, z, { material: metalCob });
  }
  for (const x of [-COB.x, COB.x]) caixa(0.3, 0.3, COB.z1 - COB.z0, 0, x, COB.beiral, (COB.z0 + COB.z1) / 2, { material: metalCob });
}
let cob = { k: 0, de: 0, para: 0, t0: 0, ms: 1, mexeu: false };
const btCob = document.getElementById('cobertoBtn');
function abreCobertura(abrir, ms = 2600) {
  cob = { ...cob, de: cob.k, para: abrir ? 1 : 0, t0: performance.now(), ms };
  btCob.setAttribute('aria-pressed', String(!abrir));
  btCob.title = abrir ? 'Ver a cobertura do evento' : 'Abrir para ver por dentro';
}
function passoCobertura() {
  const kk = Math.min(1, (performance.now() - cob.t0) / cob.ms);
  cob.k = cob.de + (cob.para - cob.de) * ease(kk);
  for (let i = 0; i < COB.n; i++) {
    const ordem = COB.n - 1 - i;                                   // abre da entrada para o palco
    const ki = THREE.MathUtils.clamp(cob.k * 1.8 - ordem / COB.n * 0.8, 0, 1);
    const p = paineis[i]; p.scale.z = Math.max(0.001, 1 - ease(ki)); p.visible = ki < 0.995;
    p.material.opacity = 0.97 - ki * 0.35;
  }
  lonaFantasma.opacity = 0.06 * cob.k;
  document.body.classList.toggle('cobFechada', cob.k < 0.35);
}
btCob.addEventListener('click', () => { cob.mexeu = true; abreCobertura(cob.para === 0); });`);

// ---------- D) público novo ----------
j = troca(j, `{
  const roupas = [0xf3eee6, 0x1d1d22, 0x3b5f8a, 0xb23a3a, 0xd9c3a0, 0x6e7f5a, 0xff8a6a, 0x8a5a9a].map(c => new THREE.Color(c));
  const n = 520, gente = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.22, 0.95, 3, 8), mat(0xffffff, { roughness: 0.9 }), n);
  const o = new THREE.Object3D(); let i = 0;
  const poe = (x, y, z) => { o.position.set(x, y + 0.7, z); o.updateMatrix(); gente.setMatrixAt(i, o.matrix); gente.setColorAt(i, roupas[(Math.random() * roupas.length) | 0]); i++; };
  while (i < 400) { const z = -15 + Math.pow(Math.random(), 1.6) * 35, x = (Math.random() - 0.5) * 28; poe(x, 0.38, z); }
  for (const l of lugares) {
    if (i >= n) break;
    if (l.tipo === 'cam' && Math.random() < 0.7) { for (let k = 0; k < 3 && i < n; k++) poe(l.topo.x + (Math.random() - 0.5) * 2.6, l.topo.y - 1.6 + 0.14, l.topo.z + (Math.random() - 0.5) * 2); }
    if (l.tipo === 'bis' && Math.random() < 0.35 && i < n) poe(l.topo.x + 0.62, l.topo.y - 1.5, l.topo.z);
  }
  gente.count = i; gente.castShadow = true; gente.instanceColor.needsUpdate = true; cena.add(gente);
}`,
`// público: pernas, tronco, cabeça, cabelo ou chapéu, dois braços (parte dança com braço pra cima)
const GENTE = [];
const animaGente = (() => {
  const rnd = (a) => a[(Math.random() * a.length) | 0];
  const pessoa = (x, y, z, o = {}) => GENTE.push({ x, y, z, rot: Math.atan2(0 - x, -28 - z), cima: !!o.cima, danca: !!o.danca,
    fase: Math.random() * 6.28, vel: 2.2 + Math.random() * 1.0, chapeu: Math.random() < (o.pChapeu ?? 0.22), esc: 0.9 + Math.random() * 0.16 });
  for (let i = 0; i < 420; i++) {
    const z = -14.5 + Math.pow(Math.random(), 1.5) * 34, x = (Math.random() - 0.5) * 27.5;
    pessoa(x, 0.38, z, { danca: true, cima: Math.random() < (z < 0 ? 0.32 : 0.14) });
  }
  for (const s of [-1, 1]) for (let i = 0; i < 18; i++) {
    const x = s * (7.0 + Math.pow(Math.random(), 1.6) * 6.8), z = -31.5 + Math.random() * 9;
    pessoa(x, PISO_PALCO + 0.1, z, { danca: true, cima: Math.random() < 0.25 });
  }
  for (const l of lugares) {
    if (l.tipo === 'cam' && Math.random() < 0.7) for (let k = 0; k < 3; k++) pessoa(l.topo.x + (Math.random() - 0.5) * 2.6, l.topo.y - 1.46, l.topo.z + (Math.random() - 0.5) * 2, { danca: Math.random() < 0.5 });
    if (l.tipo === 'bis' && Math.random() < 0.35) pessoa(l.topo.x + 0.62, l.topo.y - 1.5, l.topo.z);
  }
  for (const l of lounges) for (let k = 0; k < 3; k++) pessoa(l.x + (Math.random() - 0.5) * 3, 0.8, -17.6 + Math.random() * 1.6, { pChapeu: 0.1 });
  const N = GENTE.length;
  const g = {
    pernas: new THREE.BoxGeometry(0.32, 0.8, 0.2).translate(0, 0.4, 0),
    tronco: new THREE.CapsuleGeometry(0.18, 0.42, 4, 10).scale(1.15, 1, 0.72).translate(0, 1.12, 0),
    cabeca: new THREE.SphereGeometry(0.115, 12, 10).translate(0, 1.6, 0),
    cabelo: new THREE.SphereGeometry(0.124, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.55).translate(0, 1.62, 0),
    aba: new THREE.CylinderGeometry(0.29, 0.29, 0.025, 16).translate(0, 1.7, 0),
    copa: new THREE.CylinderGeometry(0.115, 0.135, 0.15, 12).translate(0, 1.79, 0),
    braco: new THREE.CapsuleGeometry(0.05, 0.48, 3, 6).translate(0, -0.29, 0),
  };
  const im = {};
  for (const k of ['pernas', 'tronco', 'cabeca', 'cabelo', 'aba', 'copa', 'bracoE', 'bracoD']) {
    im[k] = new THREE.InstancedMesh(k.startsWith('braco') ? g.braco : g[k], mat(0xffffff, { roughness: 0.85 }), N);
    im[k].frustumCulled = false; cena.add(im[k]);
  }
  im.tronco.castShadow = im.pernas.castShadow = true;
  const C = a => a.map(c => new THREE.Color(c));
  const roupas = C([0xf3eee6, 0x1d1d22, 0x3b5f8a, 0xb23a3a, 0xd9c3a0, 0x6e7f5a, 0xff8a6a, 0x8a5a9a, 0xffffff, 0x2a6f6a, 0xe6b84a]);
  const calcas = C([0x23314d, 0x2b3a55, 0x1b1b20, 0x4a4f5a, 0xcfc6b5, 0x3b2e26]);
  const peles = C([0xf1c9a5, 0xe0ac84, 0xc68d62, 0x9a6a46, 0x6e4a31]);
  const cabelos = C([0x1a1410, 0x2e2118, 0x4a3324, 0x7a5a3a, 0xc9a46a, 0x111111]);
  const chapeus = C([0xd8c9a0, 0x2a1c14, 0x111114, 0x6b4a2e, 0xf0ead8]);
  GENTE.forEach((p, i) => {
    const pele = rnd(peles), chap = rnd(chapeus);
    im.pernas.setColorAt(i, rnd(calcas)); im.tronco.setColorAt(i, rnd(roupas)); im.cabeca.setColorAt(i, pele);
    im.cabelo.setColorAt(i, rnd(cabelos)); im.aba.setColorAt(i, chap); im.copa.setColorAt(i, chap);
    const manga = Math.random() < 0.5 ? pele : null;
    p.manga = manga;
  });
  const tmp = new THREE.Color();
  GENTE.forEach((p, i) => { im.tronco.getColorAt(i, tmp); const c = p.manga || tmp; im.bracoE.setColorAt(i, c); im.bracoD.setColorAt(i, c); });
  for (const k in im) im[k].instanceColor.needsUpdate = true;
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0), B = new THREE.Matrix4(), L = new THREE.Matrix4(), M = new THREE.Matrix4();
  const V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), EY = new THREE.Vector3(0, 1, 0), EZ = new THREE.Vector3(0, 0, 1), Q2b = new THREE.Quaternion(), UM = new THREE.Vector3(1, 1, 1);
  const poe = (i, p, t) => {
    const pulo = p.danca ? Math.abs(Math.sin(t * p.vel + p.fase)) * 0.055 : 0;
    B.compose(V.set(p.x, p.y + pulo, p.z), Q.setFromAxisAngle(EY, p.rot), S.setScalar(p.esc));
    im.pernas.setMatrixAt(i, B); im.tronco.setMatrixAt(i, B); im.cabeca.setMatrixAt(i, B);
    im.cabelo.setMatrixAt(i, p.chapeu ? ZERO : B); im.aba.setMatrixAt(i, p.chapeu ? B : ZERO); im.copa.setMatrixAt(i, p.chapeu ? B : ZERO);
    const onda = p.danca ? Math.sin(t * p.vel * 0.5 + p.fase) * (p.cima ? 0.2 : 0.06) : 0;
    for (const [lado, mesh] of [[-1, im.bracoE], [1, im.bracoD]]) {
      const ang = lado * (p.cima ? Math.PI - 0.42 + onda * lado : 0.12 + Math.abs(onda));
      L.compose(V.set(lado * 0.24, 1.42, 0), Q2b.setFromAxisAngle(EZ, ang), UM);
      mesh.setMatrixAt(i, M.multiplyMatrices(B, L));
    }
  };
  GENTE.forEach((p, i) => poe(i, p, 0));
  const dancam = GENTE.map((p, i) => [p, i]).filter(([p]) => p.danca);
  return t => {
    for (const [p, i] of dancam) poe(i, p, t);
    for (const k in im) im[k].instanceMatrix.needsUpdate = true;
  };
})();`);

// ---------- E) feixes na treliça nova ----------
j = troca(j, `m.position.set(-8 + i * (16 / 7), 10.1, -22.6);`, `m.position.set(-6 + i * (12 / 7), TOPO - 0.3, -22.8);`);
j = troca(j, `luzPalco.position.set(0, 10, -20);`, `luzPalco.position.set(0, TOPO + 1, -20);`);

// ---------- F) rótulos ----------
j = troca(j, `  { t: 'PALCO', p: [0, 12.6, -26], cls: 'branca', st: 'palco', cor: '#fff', txtCor: '#2a2a30' },
  { t: 'BACKSTAGE', p: [-21, 5.6, -27], cls: 'branca', st: 'back', perto: 70 },
  { t: 'BACKSTAGE', p: [21, 5.6, -25], cls: 'branca', st: 'back' },`,
`  { t: 'PALCO', p: [0, TOPO + 1.6, -28], cls: 'branca', st: 'palco', cor: '#fff', txtCor: '#2a2a30' },
  { t: 'BACKSTAGE', p: [-10.5, PISO_PALCO + 2.6, -27], cls: 'branca', st: 'back', perto: 70 },
  { t: 'BACKSTAGE', p: [10.5, PISO_PALCO + 2.6, -27], cls: 'branca', st: 'back' },`);
j = troca(j, `{ t: 'ACESSOS', p: [21, 2.0, -18.5],`, `{ t: 'ACESSOS', p: [15.3, 3.4, -23.5],`);

// ---------- G/H) vistas e "sua vista" ----------
j = troca(j, `  back:   { pos: [2, 22, 18],    alvo: [0, 3, -24] },`, `  back:   { pos: [2, 20, 10],    alvo: [0, 3, -27] },`);
j = troca(j, `  palco:  { pos: [0, 7, 8],      alvo: [0, 5, -26] },`, `  palco:  { pos: [0, 8, 6],      alvo: [0, 4.5, -28] },`);
j = troca(j, `const PALCO_OLHAR = [0, 5.6, -27];`, `const PALCO_OLHAR = [0, PISO_PALCO + 1.9, -28.5];`);
j = troca(j, `  back: { pos: [-17.5, 5.3, -23], alvo: [0, 3.6, -25] },`, `  back: { pos: [-7.4, PISO_PALCO + 1.65, -25.6], alvo: [0, PISO_PALCO + 1.6, -26.6] },`);
j = troca(j, `  palco: { pos: [0, 3.9, -24.5], alvo: [0, 2.5, 12] },`, `  palco: { pos: [0, PISO_PALCO + 1.7, -24.2], alvo: [0, 2.5, 12] },`);

// ---------- I) laço: cobertura + dança; abre a cobertura na entrada ----------
j = troca(j, `  renderer.render(cena, cam);
  if (!introFeita && quadroN === 3) {
    introFeita = true;
    document.getElementById('carregando').classList.add('fora');
    if (!leHash()) vista('geral', 5200);
  }`, `  passoCobertura();
  if (quadroN % 2 === 0) animaGente(t);
  cantores.children.forEach((c, i) => { c.position.y = PISO_PALCO + Math.abs(Math.sin(t * 2.1 + i * 1.7)) * 0.03; });
  renderer.render(cena, cam);
  if (!introFeita && quadroN === 3) {
    introFeita = true;
    document.getElementById('carregando').classList.add('fora');
    if (!leHash()) vista('geral', 5200);
    // entra com o evento FECHADO (100% coberto) e a cobertura recolhe sozinha
    setTimeout(() => { if (!cob.mexeu && cob.para === 0) abreCobertura(true, 2800); }, leHash() ? 600 : 2000);
  }`);

// ---------- K/L) toque com a cobertura fechada abre; "sua vista" abre ----------
j = troca(j, `  if (noOlho) return;
  if (!baixo || Math.hypot(e.clientX - baixo[0], e.clientY - baixo[1]) > 6) return;`,
`  if (noOlho) return;
  if (!baixo || Math.hypot(e.clientX - baixo[0], e.clientY - baixo[1]) > 6) return;
  if (cob.para === 0) { cob.mexeu = true; abreCobertura(true, 1500); return; }`);
j = troca(j, `  const st = selId ? porId.get(selId).setor : setorAtivo;
  noOlho = true;`, `  const st = selId ? porId.get(selId).setor : setorAtivo;
  if (cob.para === 0) abreCobertura(true, 700);
  noOlho = true;`);
grava('app.js', j);

// ---------- index.html ----------
let h = ler('index.html');
h = troca(h, `    <div class="ctrl">
      <div class="hora">`, `    <div class="cobAviso" aria-hidden="true"><b>☂ Evento 100% coberto</b><small>toque para ver por dentro</small></div>
    <div class="ctrl">
      <button class="coberto" id="cobertoBtn" aria-pressed="true" title="Abrir para ver por dentro"><i>☂</i> 100% coberto</button>
      <div class="hora">`);
h = troca(h, `.topo{transition:opacity .4s}`, `.coberto{display:inline-flex;align-items:center;gap:8px;background:var(--vidro);backdrop-filter:blur(12px);border:1px solid var(--linha);border-radius:999px;padding:9px 14px;color:var(--creme);font:800 12px var(--f-tit);letter-spacing:.04em;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.18)}
.coberto i{font-style:normal;color:var(--sol);font-size:16px;line-height:1}
.coberto[aria-pressed=true]{background:var(--creme);color:#3a0d12;border-color:var(--creme)}
.coberto[aria-pressed=true] i{color:var(--coral)}
.cobAviso{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);z-index:4;text-align:center;color:#fff;opacity:0;transition:opacity .7s;pointer-events:none;white-space:nowrap}
.cobAviso b{display:block;font:800 clamp(20px,3.4vw,34px) var(--f-tit);letter-spacing:-.01em;text-shadow:0 2px 20px rgba(0,0,0,.55)}
.cobAviso small{display:block;margin-top:8px;font:700 11px var(--f-txt);letter-spacing:.16em;text-transform:uppercase;color:var(--creme);text-shadow:0 1px 8px rgba(0,0,0,.6)}
body.cobFechada .cobAviso{opacity:1}
body.olho .cobAviso{opacity:0}
.camada{transition:opacity .5s}
body.cobFechada .camada{opacity:0;pointer-events:none}
.topo{transition:opacity .4s}`);
h = h.replace(/app\.js\?v=\d+/, 'app.js?v=9');
grava('index.html', h);
console.log('ok');
