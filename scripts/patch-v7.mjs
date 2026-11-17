// v7 (17/11/2026): bistrôs 89–110 no 4º andar (nomes da Q2: 2º/3º/4º) + pista de pouso real
// (SSHN Recanto das Águias: RWY 10/28, asfalto 1.000 × 18 m, a oeste da represa — satélite + encontrodasaguias.com.br).
import fs from 'node:fs';
const ler = n => fs.readFileSync(new URL('../' + n, import.meta.url), 'utf8');
const grava = (n, t) => fs.writeFileSync(new URL('../' + n, import.meta.url), t);
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error('não achei: ' + de.slice(0, 80)); return txt.replace(de, para); };

let j = ler('app.js');

// ---------- bistrôs: 4º andar ----------
j = troca(j, `            txt: 'Mesa alta para 6 pessoas no deck mais alto, de frente para o palco.', vista: 'bis' },`,
`            txt: 'Mesa alta para 6 pessoas no deck do meio, de frente para o palco.', vista: 'bis' },
  bis4:   { nome: 'Bistrô 4º andar', curto: 'Bistrô · 4º andar', cor: '#d24fea', preco: 'Ver na Q2', obs: 'mesa para 6 pessoas', sub: 'Bistrôs 89 a 110',
            txt: 'O deck mais alto dos bistrôs: a pista e o palco inteiros à vista.', vista: 'bis' },`);
j = troca(j, `const decks = [{ x: 18, y: 1.6, setor: 'bis2', cols: [16.5, 19.5], base: 0 }, { x: 24, y: 3.2, setor: 'bis3', cols: [22.5, 25.5], base: 44 }];
const nBis = 88;`, `const decks = [{ x: 18, y: 1.6, setor: 'bis2', cols: [16.5, 19.5], base: 0 }, { x: 24, y: 3.2, setor: 'bis3', cols: [22.5, 25.5], base: 44 },
  { x: 28.7, y: 4.8, setor: 'bis4', cols: [28.7], base: 88, w: 3.4 }];
const nBis = 110;`);
j = troca(j, `    caixa(6, d.y, 37.4, 0, d.x, 0.3 + d.y / 2, BIS.z0 + 11 * BIS.passo + 0.2, { material: estrutura });
    caixa(6, 0.2, 37.4, 0, d.x, 0.3 + d.y + 0.1, BIS.z0 + 11 * BIS.passo + 0.2, { material: mat(0x8f9aa3) });
    caixa(0.06, 1.0, 37.4, 0, d.x - 3, 0.3 + d.y + 0.7, BIS.z0 + 11 * BIS.passo + 0.2, { material: vidro, sombra: false });`,
`    const dw = d.w || 6;
    caixa(dw, d.y, 37.4, 0, d.x, 0.3 + d.y / 2, BIS.z0 + 11 * BIS.passo + 0.2, { material: estrutura });
    caixa(dw, 0.2, 37.4, 0, d.x, 0.3 + d.y + 0.1, BIS.z0 + 11 * BIS.passo + 0.2, { material: mat(0x8f9aa3) });
    caixa(0.06, 1.0, 37.4, 0, d.x - dw / 2, 0.3 + d.y + 0.7, BIS.z0 + 11 * BIS.passo + 0.2, { material: vidro, sombra: false });`);
j = troca(j, `bis2: { lugar: 'b12' }, bis3: { lugar: 'b56' },`, `bis2: { lugar: 'b12' }, bis3: { lugar: 'b56' }, bis4: { lugar: 'b100' },`);
j = troca(j, `const ORDEM = ['vip', 'back', 'cam1', 'cam2', 'cam3', 'bis2', 'bis3', 'lounge'];`, `const ORDEM = ['vip', 'back', 'cam1', 'cam2', 'cam3', 'bis2', 'bis3', 'bis4', 'lounge'];`);
j = troca(j, `  if (n <= 88) ops.push(['b' + n, 'Bistrô ' + n]);`, `  if (n <= 110) ops.push(['b' + n, 'Bistrô ' + n]);`);
// cobertura mais larga para caber o deck novo (colunas continuam só na borda)
j = troca(j, `const COB = { x: 30, z0: -37.5,`, `const COB = { x: 33, z0: -37.5,`);

// ---------- pista de pouso real ----------
j = troca(j, `const LAGO = { cx: -14, cz: -132, R: 62 };`, `const LAGO = { cx: -14, cz: -132, R: 62 };
// pista SSHN: sai do canto sudoeste da represa e corre 1.000 m para oeste (−x)
const PISTA = { x0: -1075, x1: -75, z: -86, w: 18 };`);
j = troca(j, `  const longe = Math.max(0, Math.hypot(x + 30, z + 10) - 230);
  return 0.12 + Math.min(longe * 0.06, 14) * (0.6 + 0.4 * ruido(x * 0.6, z * 0.6)) + Math.min(d, 6) * 0.01;`,
`  const longe = Math.max(0, Math.hypot(x + 30, z + 10) - 230);
  const hh = 0.12 + Math.min(longe * 0.06, 14) * (0.6 + 0.4 * ruido(x * 0.6, z * 0.6)) + Math.min(d, 6) * 0.01;
  // terreno plano em volta da pista de pouso
  const dx = Math.max(0, PISTA.x0 - x, x - PISTA.x1), dz = Math.max(0, Math.abs(z - PISTA.z) - PISTA.w / 2 - 8);
  return THREE.MathUtils.lerp(0.12, hh, THREE.MathUtils.clamp(Math.hypot(dx, dz) / 45, 0, 1));`);
j = troca(j, `    if (Math.abs(z + 300) < 20 && x > -200 && x < 300) continue;`, `    if (Math.abs(z - PISTA.z) < 45 && x > PISTA.x0 - 60 && x < PISTA.x1 + 25) continue;`);
j = troca(j, `caixa(520, 0.06, 22, 0x8e8b85, 60, 0.04, -300, { sombra: false });
for (let x = -180; x < 300; x += 22) caixa(10, 0.07, 0.8, 0xf2f2f2, x, 0.06, -300, { sombra: false });`,
`// pista de pouso SSHN — RWY 10/28, asfalto 1.000 × 18 m
{
  const L = PISTA.x1 - PISTA.x0, cx = (PISTA.x0 + PISTA.x1) / 2, Z = PISTA.z;
  caixa(L + 60, 0.04, PISTA.w + 26, 0x86a64a, cx, 0.13, Z, { sombra: false, material: mat(0x86a64a, { roughness: 1 }) });
  caixa(L, 0.08, PISTA.w, 0x45464a, cx, 0.17, Z, { sombra: false });
  for (const s of [-1, 1]) caixa(L, 0.09, 0.35, 0xf2f2f2, cx, 0.18, Z + s * (PISTA.w / 2 - 0.6), { sombra: false });
  for (let x = PISTA.x0 + 70; x < PISTA.x1 - 70; x += 30) caixa(15, 0.09, 0.45, 0xf2f2f2, x, 0.18, Z, { sombra: false });
  for (const [xe, s] of [[PISTA.x0, 1], [PISTA.x1, -1]]) for (const k of [-3, -2, -1, 1, 2, 3]) caixa(14, 0.09, 1.1, 0xf2f2f2, xe + s * 11, 0.18, Z + k * 2.3, { sombra: false });
  const numero = (txt, x, rot) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#f2f2f2'; g.font = '800 190px "Unbounded", "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 136);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(13, 13).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
    m.position.set(x, 0.2, Z); m.rotation.y = rot; cena.add(m);
  };
  numero('10', PISTA.x0 + 34, -Math.PI / 2);   // pouso rumo leste
  numero('28', PISTA.x1 - 34, Math.PI / 2);    // pouso rumo oeste
  // pátio com hangar e aviões, ao sul da cabeceira 28 (entre a pista e o evento)
  const hx = PISTA.x1 - 40, hz = Z + 30;
  caixa(46, 0.06, 26, 0x6d6e72, hx, 0.14, hz, { sombra: false });
  caixa(20, 5, 14, 0, hx - 12, 2.6, hz + 4, { material: mat(0xd9d6cf) });
  const teto = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 20.4, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), mat(0xb8bcc2, { metalness: 0.4, roughness: 0.5 }));
  teto.rotation.y = Math.PI / 2; teto.scale.set(1, 0.32, 1); teto.position.set(hx - 12, 5.1, hz + 4); teto.castShadow = true; cena.add(teto);
  const aviao = (x, z, rot, cor) => {
    const g = new THREE.Group(), branco = mat(0xf4f4f2, { roughness: 0.4 }), faixa = mat(cor);
    const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 5.2, 4, 12).rotateZ(Math.PI / 2), branco); fus.position.y = 1.3; g.add(fus);
    const asa = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 10), branco); asa.position.set(0.6, 1.85, 0); g.add(asa);
    const ponta = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 10.02), faixa); ponta.position.set(1.15, 1.86, 0); g.add(ponta);
    const lem = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.12), faixa); lem.position.set(-3.1, 2.2, 0); g.add(lem);
    const prof = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 3.4), branco); prof.position.set(-3.1, 1.55, 0); g.add(prof);
    for (const [px, pz] of [[1.6, 0], [-0.6, 1.1], [-0.6, -1.1]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 12).rotateX(Math.PI / 2), mat(0x1a1a1a)); r.position.set(px, 0.42, pz); g.add(r); }
    g.traverse(o => { o.castShadow = true; });
    g.position.set(x, 0.14, z); g.rotation.y = rot; cena.add(g);
  };
  aviao(hx + 6, hz - 4, 0.5, 0xc8312b);
  aviao(hx + 16, hz + 5, -0.3, 0x1f4fa8);
  // biruta
  caixa(0.15, 6, 0.15, 0, PISTA.x1 - 70, 3.1, Z - 22, { material: metal });
  const biruta = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.6, 12, 1, true).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xff6a1a, side: THREE.DoubleSide }));
  biruta.position.set(PISTA.x1 - 70 - 1.4, 5.8, Z - 22); cena.add(biruta);
  pilulaExtra.push({ t: 'PISTA DE POUSO', p: [PISTA.x1 - 160, 8, Z] });
}`);
grava('app.js', j);

let h = ler('index.html');
h = h.replace(/app\.js\?v=\d+/, 'app.js?v=10');
grava('index.html', h);
console.log('ok');
