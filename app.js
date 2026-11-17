import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================================
// Sunset Experience na Represa — mapa 3D (planta oficial do flyer, em metros aprox.)
// Palco ao fundo (z negativo), pista VIP no centro, camarotes à esquerda (3 andares),
// bistrôs à direita (2 andares), represa a oeste (x negativo), sol se pondo sobre ela.
// ============================================================================

const Q2 = 'https://q2ingressos.com.br/events/sunset-experience-na-represa-com-zeze-di-camargo-luciano?utm_source=mapa3d&utm_medium=site&utm_campaign=sunset-zeze';
for (const id of ['topoComprar', 'rodComprar', 'fComprar']) document.getElementById(id).href = Q2;

const SETORES = {
  vip:    { nome: 'VIP Premium', curto: 'VIP Premium', cor: '#2e8b14', preco: 'R$ 210', obs: 'a partir de · + taxas', sub: 'Pista em frente ao palco',
            txt: 'A pista do show: de frente para o palco, a passarela e o pôr do sol na represa.', vista: 'vip' },
  back:   { nome: 'Backstage elevado', curto: 'Backstage', cor: '#1f6fe5', preco: 'R$ 500', obs: '+ taxas', sub: 'Plataformas dos dois lados do palco',
            txt: 'Plataformas elevadas coladas ao palco, uma de cada lado. A vista mais perto da dupla.', vista: 'back' },
  cam1:   { nome: 'Camarote 1º andar', curto: 'Camarote · 1º andar', cor: '#4b4bf0', preco: 'R$ 8.400', obs: 'por camarote · lote 1 · + taxas', sub: 'Camarotes 1 a 12',
            txt: 'A fileira mais próxima da pista. Confira na Q2 quantas pessoas cada camarote leva.', vista: 'cam', andar: 1 },
  cam2:   { nome: 'Camarote 2º andar', curto: 'Camarote · 2º andar', cor: '#4b4bf0', preco: 'R$ 7.800', obs: 'por camarote · lote 1 · + taxas', sub: 'Camarotes 13 a 24',
            txt: 'Um andar acima, com a pista inteira e o palco no campo de visão.', vista: 'cam', andar: 2 },
  cam3:   { nome: 'Camarote 3º andar', curto: 'Camarote · 3º andar', cor: '#4b4bf0', preco: 'R$ 7.200', obs: 'por camarote · lote 1 · + taxas', sub: 'Camarotes 25 a 36',
            txt: 'O ponto mais alto do evento: dá para ver a represa por cima da pista.', vista: 'cam', andar: 3 },
  bis2:   { nome: 'Bistrô 2º andar', curto: 'Bistrô · 2º andar', cor: '#d24fea', preco: 'R$ 2.400', obs: 'mesa para 6 pessoas · lote 1 · + taxas', sub: 'Bistrôs 1 a 44',
            txt: 'Mesa alta para 6 pessoas no deck elevado, ao lado da pista.', vista: 'bis' },
  bis3:   { nome: 'Bistrô 3º andar', curto: 'Bistrô · 3º andar', cor: '#d24fea', preco: 'R$ 2.400', obs: 'mesa para 6 pessoas · lote 1 · + taxas', sub: 'Bistrôs 45 a 88',
            txt: 'Mesa alta para 6 pessoas no deck mais alto, de frente para o palco.', vista: 'bis' },
  lounge: { nome: 'Lounge patrocinador', curto: 'Lounge', cor: '#2f6b3d', preco: 'Exclusivo', obs: 'para patrocinadores', sub: 'Lounges 1 a 6, na beira da passarela',
            txt: 'Espaços dos patrocinadores, colados na passarela. Não estão à venda na Q2.', vista: 'lounge', semVenda: true },
  palco:  { nome: 'Palco', curto: 'Palco', cor: '#2a2a30', preco: 'Zezé & Luciano', obs: 'a partir das 16h', sub: 'Com passarela até a pista',
            txt: 'Zezé Di Camargo & Luciano no palco, com o pôr do sol atrás da represa.', vista: 'palco', semVenda: true },
};

const VISTAS = {
  geral:  { pos: [22, 21, 72],   alvo: [-16, 7, -24] },
  vip:    { pos: [4, 20, 52],    alvo: [0, 1, -6] },
  back:   { pos: [2, 22, 18],    alvo: [0, 3, -24] },
  cam:    { pos: [16, 20, 34],   alvo: [-21, 4, 0] },
  bis:    { pos: [-12, 18, 34],  alvo: [21, 3, 1] },
  lounge: { pos: [0, 11, 4],     alvo: [0, 1, -18] },
  palco:  { pos: [0, 7, 8],      alvo: [0, 5, -26] },
  intro:  { pos: [150, 140, 260], alvo: [-10, 0, -90] },
};

// ---------------------------------------------------------------------------
// renderer / cena
// ---------------------------------------------------------------------------
const canvas = document.getElementById('cena');
const tela = canvas.parentElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const cena = new THREE.Scene();
cena.fog = new THREE.Fog(0xf0a070, 220, 1100);
const cam = new THREE.PerspectiveCamera(40, 1, 0.5, 3000);
cam.position.set(...VISTAS.intro.pos);

const ctl = new OrbitControls(cam, canvas);
ctl.enableDamping = true; ctl.dampingFactor = 0.07;
ctl.minDistance = 6; ctl.maxDistance = 260;
ctl.maxPolarAngle = Math.PI * 0.47;
ctl.target.set(...VISTAS.intro.alvo);
ctl.screenSpacePanning = false;

const hemi = new THREE.HemisphereLight(0xffc8a8, 0x4a3020, 0.7);
cena.add(hemi);
const sol = new THREE.DirectionalLight(0xffc080, 2);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 10, far: 400 });
sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.04;
cena.add(sol, sol.target);

// ---------------------------------------------------------------------------
// céu (domo com gradiente, sol e estrelas)
// ---------------------------------------------------------------------------
const U = {
  top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, hor: { value: new THREE.Color() },
  sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() },
  night: { value: 0 }, time: { value: 0 }, deep: { value: new THREE.Color(0x1d2a2a) },
};
const SKY_FN = /* glsl */`
  uniform vec3 top, mid, hor, sunCol, sunDir; uniform float night, time;
  vec3 ceu(vec3 d){
    float h = d.y;
    vec3 c = mix(hor, mid, smoothstep(0.0, 0.16, h));
    c = mix(c, top, smoothstep(0.16, 0.75, h));
    if (h < 0.0) c = mix(hor, hor * 0.45, smoothstep(0.0, -0.25, h));
    float s = max(dot(d, sunDir), 0.0);
    c += sunCol * (pow(s, 5.0) * 0.32 + pow(s, 48.0) * 0.55);
    return c;
  }`;
const ceu = new THREE.Mesh(
  new THREE.SphereGeometry(1500, 48, 24),
  new THREE.ShaderMaterial({
    uniforms: U, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: SKY_FN + `
      varying vec3 vD;
      void main(){
        vec3 d = normalize(vD);
        vec3 c = ceu(d);
        float s = max(dot(d, sunDir), 0.0);
        c += sunCol * smoothstep(0.99955, 0.99975, s) * 4.0;
        if (night > 0.0) {
          vec3 p = floor(d * 380.0);
          float r = fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
          float tw = 0.6 + 0.4 * sin(time * 2.0 + r * 60.0);
          c += vec3(step(0.9972, r)) * night * smoothstep(0.04, 0.35, d.y) * tw * 1.2;
        }
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
);
ceu.renderOrder = -1;
cena.add(ceu);

// ---------------------------------------------------------------------------
// terreno + represa
// ---------------------------------------------------------------------------
const LAGO = { cx: -14, cz: -132, R: 62 };
const raioLago = a => LAGO.R * (1 + 0.13 * Math.sin(3 * a + 1.1) + 0.07 * Math.sin(5 * a + 2.3) + 0.04 * Math.sin(9 * a + 0.4));
const distLago = (x, z) => { const dx = x - LAGO.cx, dz = z - LAGO.cz; return Math.hypot(dx, dz) - raioLago(Math.atan2(dz, dx)); };
const ruido = (x, z) => Math.sin(x * 0.05 + Math.sin(z * 0.03) * 2) * Math.cos(z * 0.045 + Math.sin(x * 0.02)) ;
function altura(x, z) {
  const d = distLago(x, z);
  if (d < 0) return -0.9 + Math.max(-2.6, d * 0.2);
  const longe = Math.max(0, Math.hypot(x + 30, z + 10) - 230);
  return 0.12 + Math.min(longe * 0.06, 14) * (0.6 + 0.4 * ruido(x * 0.6, z * 0.6)) + Math.min(d, 6) * 0.01;
}
{
  const g = new THREE.PlaneGeometry(2400, 2400, 220, 220);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, cores = [];
  const grama = new THREE.Color(0x6e9a3a), grama2 = new THREE.Color(0x9aae4a), areia = new THREE.Color(0xc2a274), fundo = new THREE.Color(0x2f3a2a), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i, altura(x, z));
    const d = distLago(x, z);
    c.copy(grama).lerp(grama2, 0.5 + 0.5 * ruido(x * 2.1, z * 1.7));
    if (d < 5 && d > -2) c.lerp(areia, 1 - Math.abs(d - 1.5) / 3.5);
    if (d <= -2) c.copy(fundo);
    cores.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
  g.computeVertexNormals();
  const chao = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  chao.receiveShadow = true;
  cena.add(chao);
}
const agua = new THREE.Mesh(
  new THREE.CircleGeometry(LAGO.R * 1.5, 128).rotateX(-Math.PI / 2),
  new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: SKY_FN + `
      uniform vec3 deep; varying vec3 vW;
      void main(){
        vec2 p = vW.xz; float t = time;
        vec3 n = normalize(vec3(
          sin(p.x*0.32 + t*1.1)*0.045 + sin(p.y*0.55 - t*1.3)*0.03 + sin((p.x+p.y)*1.6 + t*2.2)*0.018,
          1.0,
          cos(p.y*0.38 + t*0.9)*0.045 + cos(p.x*0.66 - t*1.4)*0.03 + sin((p.x-p.y)*1.8 - t*1.9)*0.018));
        vec3 v = normalize(vW - cameraPosition);
        vec3 r = reflect(v, n);
        float fres = 0.05 + 0.95 * pow(1.0 - max(dot(-v, n), 0.0), 4.0);
        vec3 c = mix(deep * (0.35 + 0.65 * (1.0 - night)), ceu(r), clamp(fres * 1.15, 0.0, 1.0));
        float sp = pow(max(dot(r, sunDir), 0.0), 260.0);
        c += sunCol * sp * 7.0;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
);
agua.position.set(LAGO.cx, 0.06, LAGO.cz);
cena.add(agua);

// ---------------------------------------------------------------------------
// utilidades de geometria
// ---------------------------------------------------------------------------
const MAT = {};
const mat = (cor, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.75, metalness: 0.05, ...extra });
function caixa(w, h, d, cor, x, y, z, { sombra = true, recebe = true, material } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material || mat(cor));
  m.position.set(x, y, z); m.castShadow = sombra; m.receiveShadow = recebe;
  cena.add(m); return m;
}
const vidro = new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.3, depthWrite: false });
const estrutura = mat(0xcfc6b8);
const metal = mat(0x2a2a30, { metalness: 0.6, roughness: 0.4 });

// piso geral do evento
caixa(62, 0.3, 60, 0xd8d0c3, 0, 0.15, -3, { sombra: false });

// ---------------------------------------------------------------------------
// palco
// ---------------------------------------------------------------------------
caixa(18, 1.8, 8, 0x1b1b21, 0, 0.9 + 0.3, -26);
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
telao.position.set(0, 5.6, -29.35); cena.add(telao);
function desenhaTelao(t, noite) {
  const w = ledCanvas.width, h = ledCanvas.height;
  const g = led.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, noite > 0.5 ? '#2a0f3a' : '#ff5a4e'); g.addColorStop(0.55, '#ff8a2a'); g.addColorStop(1, '#ffc21a');
  led.fillStyle = g; led.fillRect(0, 0, w, h);
  led.fillStyle = 'rgba(255,241,214,.9)';
  led.beginPath(); led.arc(w / 2, h * 0.62, 120 + Math.sin(t * 1.5) * 6, 0, Math.PI * 2); led.fill();
  for (let k = 0; k < 4; k++) {
    led.fillStyle = ['#ff5a4e', '#ff7038', '#ff8a2a', '#ffb21a'][k];
    led.beginPath(); led.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) led.lineTo(x, h * (0.66 + k * 0.09) + Math.sin(x * 0.012 + t * (1.2 + k * 0.3) + k) * 14);
    led.lineTo(w, h); led.fill();
  }
  led.fillStyle = '#fff1d6'; led.textAlign = 'center';
  led.font = '800 70px "Unbounded", "Arial Black", sans-serif';
  led.fillText('ZEZÉ DI CAMARGO', w / 2, 120);
  led.font = '800 48px "Unbounded", "Arial Black", sans-serif';
  led.fillText('& LUCIANO', w / 2, 188);
  ledTex.needsUpdate = true;
}

// passarela + lounges
caixa(30, 1.0, 1.5, 0x2e4756, 0, 0.8, -21.25);
const lounges = [];
for (let i = 0; i < 6; i++) {
  const x = -12.5 + i * 5;
  const piso = caixa(4.7, 0.5, 4.8, 0, x, 0.55, -18, { material: mat(0x2f6b3d) });
  const sofa = mat(0xefe3cf, { roughness: 0.95 });
  caixa(3.8, 0.5, 0.55, 0, x, 1.05, -19.9, { material: sofa });
  caixa(3.8, 0.7, 0.15, 0, x, 1.35, -20.2, { material: sofa });
  caixa(0.55, 0.5, 2.2, 0, x - 1.65, 1.05, -18.5, { material: sofa });
  const mesa = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 20), mat(0x3b2a20)); mesa.position.set(x + 0.4, 0.98, -18.2); mesa.castShadow = true; cena.add(mesa);
  lounges.push({ mesh: piso, x });
}

// pista VIP
const pista = caixa(30, 0.08, 36.5, 0xeee8de, 0, 0.34, 2.75, { sombra: false });

// backstages (elevados)
const backs = [];
for (const [x, z] of [[-21, -26], [21, -24]]) {
  caixa(12, 3, 8, 0, x, 1.8, z, { material: estrutura });
  backs.push(caixa(12, 0.3, 8, 0x1f6fe5, x, 3.45, z));
  for (const s of [-1, 1]) caixa(12, 1.0, 0.06, 0, x, 4.1, z + s * 4, { material: vidro, sombra: false });
}
caixa(12, 0.3, 3, 0x9a958d, 21, 0.45, -18.5);

// ---------------------------------------------------------------------------
// camarotes (3 andares escalonados, 12 por andar)
// ---------------------------------------------------------------------------
const lugares = []; // {id, tipo, setor, num, mesh|inst, topo:Vector3}
const corAndar = { 1: 0x24272e, 2: 0x9ea2aa, 3: 0x2f6377 };
const CAM = { z0: -20.2, passo: 3.45 };
for (let andar = 1; andar <= 3; andar++) {
  const x = -17 - (andar - 1) * 4, y = andar * 2.4;
  caixa(4, y, 12 * CAM.passo, 0, x, 0.3 + y / 2, CAM.z0 + 6 * CAM.passo, { material: estrutura });
  for (let i = 0; i < 12; i++) {
    const num = (andar - 1) * 12 + i + 1;
    const z = CAM.z0 + i * CAM.passo + CAM.passo / 2;
    const piso = caixa(3.9, 0.28, CAM.passo - 0.12, 0, x, 0.3 + y + 0.14, z, { material: mat(corAndar[andar]) });
    caixa(3.9, 1.0, 0.06, 0, x, 0.3 + y + 0.8, z - CAM.passo / 2 + 0.05, { material: vidro, sombra: false });
    caixa(3.9, 0.08, 0.1, 0, x, 0.3 + y + 1.32, z - CAM.passo / 2 + 0.05, { material: metal });
    caixa(0.06, 1.0, CAM.passo - 0.2, 0, x + 1.95, 0.3 + y + 0.8, z, { material: vidro, sombra: false });
    lugares.push({ id: 'c' + num, tipo: 'cam', setor: 'cam' + andar, num, mesh: piso, topo: new THREE.Vector3(x, 0.3 + y + 1.6, z), andar });
  }
  caixa(0.1, 1.15, 12 * CAM.passo, 0, x - 1.95, 0.3 + y + 0.85, CAM.z0 + 6 * CAM.passo, { material: mat(0xe8e1d6) });
}
// cobertura tensionada sobre os camarotes
{
  const lona = new THREE.Mesh(new THREE.PlaneGeometry(13, 42, 12, 24), new THREE.MeshStandardMaterial({ color: 0xfff6ea, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }));
  const p = lona.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getY(i) / 42 + 0.5) * Math.PI * 6) * 0.35 * Math.cos(p.getX(i) / 13 * Math.PI));
  lona.geometry.computeVertexNormals();
  lona.rotation.x = -Math.PI / 2; lona.rotation.y = -0.12;
  lona.position.set(-21.2, 12.2, 0.5); lona.castShadow = true; cena.add(lona);
  for (const z of [-20, -6, 8, 21]) for (const x of [-27, -15.2]) caixa(0.22, x < -20 ? 13.4 : 11.6, 0.22, 0, x, (x < -20 ? 13.4 : 11.6) / 2 + 0.3, z, { material: metal });
}

// ---------------------------------------------------------------------------
// bistrôs (decks elevados, 88 mesas altas)
// ---------------------------------------------------------------------------
const BIS = { z0: -16.2, passo: 1.66 };
const decks = [{ x: 18, y: 1.6, setor: 'bis2', cols: [16.5, 19.5], base: 0 }, { x: 24, y: 3.2, setor: 'bis3', cols: [22.5, 25.5], base: 44 }];
const nBis = 88;
const gTampo = new THREE.CylinderGeometry(0.42, 0.42, 0.06, 22), gPe = new THREE.CylinderGeometry(0.05, 0.07, 1.0, 8);
const gBanco = new THREE.CylinderGeometry(0.17, 0.17, 0.06, 12), gPeB = new THREE.CylinderGeometry(0.03, 0.04, 0.72, 6);
const tampos = new THREE.InstancedMesh(gTampo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }), nBis);
const pes = new THREE.InstancedMesh(gPe, metal, nBis);
const bancos = new THREE.InstancedMesh(gBanco, mat(0xd8b089), nBis * 4);
const pesB = new THREE.InstancedMesh(gPeB, metal, nBis * 4);
for (const im of [tampos, pes, bancos, pesB]) { im.castShadow = true; im.receiveShadow = true; cena.add(im); }
const COR_TAMPO = new THREE.Color(0xf6f0e6), COR_SOL = new THREE.Color(0xffc21a), COR_HOVER = new THREE.Color(0xffe8a3);
{
  const o = new THREE.Object3D(); let k = 0;
  for (const d of decks) {
    caixa(6, d.y, 37.4, 0, d.x, 0.3 + d.y / 2, BIS.z0 + 11 * BIS.passo + 0.2, { material: estrutura });
    caixa(6, 0.2, 37.4, 0, d.x, 0.3 + d.y + 0.1, BIS.z0 + 11 * BIS.passo + 0.2, { material: mat(0x8f9aa3) });
    caixa(0.06, 1.0, 37.4, 0, d.x - 3, 0.3 + d.y + 0.7, BIS.z0 + 11 * BIS.passo + 0.2, { material: vidro, sombra: false });
    d.cols.forEach((cx, ci) => {
      for (let i = 0; i < 22; i++) {
        const num = d.base + ci * 22 + i + 1;
        const z = BIS.z0 + i * BIS.passo + 0.4, y0 = 0.3 + d.y + 0.2;
        const idx = num - 1;
        o.position.set(cx, y0 + 1.03, z); o.updateMatrix(); tampos.setMatrixAt(idx, o.matrix); tampos.setColorAt(idx, COR_TAMPO);
        o.position.set(cx, y0 + 0.5, z); o.updateMatrix(); pes.setMatrixAt(idx, o.matrix);
        for (const [dx, dz] of [[0.62, 0], [-0.62, 0], [0, 0.6], [0, -0.6]]) {
          o.position.set(cx + dx, y0 + 0.74, z + dz); o.updateMatrix(); bancos.setMatrixAt(k, o.matrix);
          o.position.set(cx + dx, y0 + 0.37, z + dz); o.updateMatrix(); pesB.setMatrixAt(k, o.matrix); k++;
        }
        lugares.push({ id: 'b' + num, tipo: 'bis', setor: d.setor, num, inst: idx, topo: new THREE.Vector3(cx, y0 + 1.5, z) });
      }
    });
  }
  for (const im of [tampos, pes, bancos, pesB]) { im.instanceMatrix.needsUpdate = true; }
  tampos.instanceColor.needsUpdate = true;
}
lounges.forEach((l, i) => lugares.push({ id: 'l' + (i + 1), tipo: 'lounge', setor: 'lounge', num: i + 1, mesh: l.mesh, topo: new THREE.Vector3(l.x, 2.2, -18) }));

// ---------------------------------------------------------------------------
// público, varais de luz, feixes do palco
// ---------------------------------------------------------------------------
{
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
}
const lampadas = []; let lamp;
{
  const fios = [-10, -4, 2, 8, 14, 19.5];
  const porFio = 30; lamp = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), fios.length * porFio);
  const o = new THREE.Object3D(); let k = 0;
  for (const z of fios) {
    const pts = [];
    for (let j = 0; j < porFio; j++) {
      const t = j / (porFio - 1), x = -15.2 + t * 30.4, y = 6.6 - Math.sin(Math.PI * t) * 1.6;
      o.position.set(x, y - 0.12, z); o.updateMatrix(); lamp.setMatrixAt(k++, o.matrix); pts.push(new THREE.Vector3(x, y, z));
    }
    cena.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x2a2018 })));
    for (const x of [-15.4, 15.4]) caixa(0.15, 7, 0.15, 0, x, 3.8, z, { material: metal });
  }
  cena.add(lamp);
}
const feixes = [];
{
  const g = new THREE.ConeGeometry(3.2, 18, 28, 1, true); g.translate(0, -9, 0);
  const cores = [0xffc21a, 0xff5a4e, 0xd24fea, 0xffffff, 0xff8a2a, 0x4b9bff, 0xffc21a, 0xff5a4e];
  cores.forEach((c, i) => {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.set(-8 + i * (16 / 7), 10.1, -22.6); cena.add(m); feixes.push({ m, f: 0.6 + i * 0.13, fase: i * 0.9 });
  });
}
const luzPalco = new THREE.SpotLight(0xffb070, 0, 70, 0.75, 0.6, 1.2);
luzPalco.position.set(0, 10, -20); luzPalco.target.position.set(0, 0, 4); cena.add(luzPalco, luzPalco.target);
const luzPista = new THREE.PointLight(0xffc37a, 0, 40, 1.4); luzPista.position.set(0, 7, 3); cena.add(luzPista);

// ---------------------------------------------------------------------------
// entorno: árvores, píer com quiosque, estrada, pista de pouso
// ---------------------------------------------------------------------------
const pilulaExtra = [{ t: 'REPRESA SENDESKI', p: [-78, 4, -126] }];
{
  const n = 420;
  const copa = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }), n);
  const tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.28, 1, 6), mat(0x5a3d26), n);
  const verdes = [0x3f5f26, 0x4d6e2c, 0x35512a, 0x5c7a33, 0x2f4a24].map(c => new THREE.Color(c));
  const o = new THREE.Object3D(); let i = 0, tent = 0;
  while (i < n && tent < 20000) {
    tent++;
    const x = (Math.random() - 0.5) * 900, z = (Math.random() - 0.5) * 760 - 40;
    const d = distLago(x, z);
    if (d < 3) continue;
    if (x > -60 && x < 90 && z > -50 && z < 130) continue;
    if (Math.abs(x - 110) < 14) continue;
    if (Math.abs(z + 300) < 20 && x > -200 && x < 300) continue;
    if (Math.random() > (d < 28 ? 0.95 : 0.22)) continue;
    const s = 2.4 + Math.random() * 2.8, y = altura(x, z);
    o.position.set(x, y + s * 0.9, z); o.scale.set(s, s * (0.75 + Math.random() * 0.35), s); o.rotation.y = Math.random() * 6; o.updateMatrix();
    copa.setMatrixAt(i, o.matrix); copa.setColorAt(i, verdes[(Math.random() * verdes.length) | 0]);
    o.position.set(x, y + s * 0.3, z); o.scale.set(1, s * 0.6, 1); o.rotation.set(0, 0, 0); o.updateMatrix(); tronco.setMatrixAt(i, o.matrix);
    i++;
  }
  copa.count = tronco.count = i; copa.castShadow = true; copa.instanceColor.needsUpdate = true;
  cena.add(copa, tronco);
}
{
  // píer saindo da margem (atrás e à direita do palco) até o quiosque de sapê
  const PX = 34; let zs = -40; while (distLago(PX, zs) > 0 && zs > -260) zs -= 0.5;
  const madeira = mat(0x8a5f3a, { roughness: 0.9 });
  caixa(3.2, 0.35, 20, 0, PX, 0.45, zs - 8, { material: madeira });
  const gx = PX, gz = zs - 23;
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.5, 6), madeira); deck.position.set(gx, 0.45, gz); deck.receiveShadow = true; deck.castShadow = true; cena.add(deck);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6; caixa(0.3, 4.2, 0.3, 0, gx + Math.cos(a) * 5.2, 2.6, gz + Math.sin(a) * 5.2, { material: madeira }); }
  const teto = new THREE.Mesh(new THREE.ConeGeometry(8.4, 4.4, 6), mat(0x9a7442, { roughness: 1, flatShading: true }));
  teto.position.set(gx, 6.9, gz); teto.rotation.y = Math.PI / 6; teto.castShadow = true; cena.add(teto);
  const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.6, 6), mat(0x6b4f2c)); ponta.position.set(gx, 10.2, gz); cena.add(ponta);
  for (const [dx, dz] of [[-2, -1.5], [2, -1.5], [0, 2]]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 16), mat(0x2a2a2a)); m.position.set(gx + dx, 1.55, gz + dz); cena.add(m);
    caixa(0.06, 0.9, 0.06, 0, gx + dx, 1.1, gz + dz, { material: metal });
  }
  pilulaExtra.push({ t: 'QUIOSQUE', p: [gx, 12.5, gz] });
}
caixa(16, 0.06, 1400, 0x3a3836, 110, 0.05, 0, { sombra: false });
for (let z = -680; z < 680; z += 14) caixa(0.3, 0.07, 6, 0xe8c64a, 110, 0.07, z, { sombra: false });
caixa(520, 0.06, 22, 0x8e8b85, 60, 0.04, -300, { sombra: false });
for (let x = -180; x < 300; x += 22) caixa(10, 0.07, 0.8, 0xf2f2f2, x, 0.06, -300, { sombra: false });

// ---------------------------------------------------------------------------
// rótulos HTML (pílulas de setor + números)
// ---------------------------------------------------------------------------
const camada = document.getElementById('camada');
const pilulas = [
  { t: 'PALCO', p: [0, 12.6, -26], cls: 'branca', st: 'palco', cor: '#fff', txtCor: '#2a2a30' },
  { t: 'BACKSTAGE', p: [-21, 5.6, -27], cls: 'branca', st: 'back', perto: 70 },
  { t: 'BACKSTAGE', p: [21, 5.6, -25], cls: 'branca', st: 'back' },
  { t: 'LOUNGES PATROCINADORES', p: [0, 2.6, -15.6], st: 'lounge', bg: '#ffffff', txtCor: '#2f6b3d', perto: 48, peq: true },
  { t: 'VIP PREMIUM', p: [0, 2.4, 9], st: 'vip', bg: '#2e8b14' },
  { t: 'CAMAROTES', p: [-23, 13.5, 20], st: 'cam1', bg: '#4b4bf0' },
  { t: 'BISTRÔS', p: [22.5, 6.4, 20], st: 'bis2', bg: '#d24fea' },
  { t: 'ACESSOS', p: [21, 2.0, -18.5], st: null, bg: 'rgba(30,20,30,.75)', peq: true, perto: 40 },
  ...pilulaExtra.map(e => ({ ...e, st: null, cls: 'local' })),
].map(d => {
  const el = document.createElement('div');
  el.className = 'pilula ' + (d.cls || ''); el.textContent = d.t;
  if (d.bg) { el.style.background = d.bg; el.style.borderTopColor = d.bg; }
  if (d.txtCor) el.style.color = d.txtCor;
  el.style.borderColor = d.bg || '#fff';
  if (d.peq) { el.style.fontSize = '10px'; el.style.padding = '5px 10px'; }
  if (d.st) el.addEventListener('click', e => { e.stopPropagation(); escolheSetor(d.st); });
  camada.appendChild(el);
  return { ...d, el, v: new THREE.Vector3(...d.p) };
});
for (const l of lugares) {
  const el = document.createElement('div'); el.className = 'num';
  el.textContent = l.tipo === 'lounge' ? 'L' + l.num : String(l.num);
  el.addEventListener('click', e => { e.stopPropagation(); seleciona(l.id, true); });
  camada.appendChild(el); l.tag = el;
}
const porId = new Map(lugares.map(l => [l.id, l]));

// ---------------------------------------------------------------------------
// horário do dia (16h → 22h)
// ---------------------------------------------------------------------------
const CHAVES = [
  { h: 16,   top: '#4f86d0', mid: '#a9c8ec', hor: '#ffe6bd', sun: '#fff3dc', si: 3.2, hs: '#dce8ff', hg: '#9a8a60', hi: 1.5, fog: '#f4dcc0', noite: 0 },
  { h: 17.6, top: '#5f6dbc', mid: '#eaa9a2', hor: '#ffc283', sun: '#ffcf94', si: 3.0, hs: '#ffe0c4', hg: '#8a7050', hi: 1.35, fog: '#f4b88a', noite: 0 },
  { h: 18.7, top: '#463b8c', mid: '#d65a7c', hor: '#ff8442', sun: '#ff9a4a', si: 2.6, hs: '#ffb898', hg: '#7a5040', hi: 1.15, fog: '#e88060', noite: 0.22 },
  { h: 19.6, top: '#25204e', mid: '#7a2f62', hor: '#e2523e', sun: '#e2523e', si: 0.8, hs: '#9a6aa0', hg: '#3a2a32', hi: 0.7, fog: '#6a2a46', noite: 0.75 },
  { h: 22,   top: '#070a24', mid: '#16143a', hor: '#2e1c4c', sun: '#4a4a8a', si: 0.15, hs: '#3a4278', hg: '#1a1222', hi: 0.45, fog: '#140c22', noite: 1 },
];
const cA = new THREE.Color(), cB = new THREE.Color();
const mix = (a, b, t, alvo) => alvo.copy(cA.set(a)).lerp(cB.set(b), t);
let NOITE = 0;
function aplicaHora(h) {
  let i = 0; while (i < CHAVES.length - 2 && h > CHAVES[i + 1].h) i++;
  const A = CHAVES[i], B = CHAVES[i + 1], t = THREE.MathUtils.clamp((h - A.h) / (B.h - A.h), 0, 1);
  mix(A.top, B.top, t, U.top.value); mix(A.mid, B.mid, t, U.mid.value); mix(A.hor, B.hor, t, U.hor.value);
  mix(A.sun, B.sun, t, U.sunCol.value);
  mix(A.hs, B.hs, t, hemi.color); mix(A.hg, B.hg, t, hemi.groundColor);
  hemi.intensity = THREE.MathUtils.lerp(A.hi, B.hi, t);
  mix(A.fog, B.fog, t, cena.fog.color);
  NOITE = THREE.MathUtils.lerp(A.noite, B.noite, t); U.night.value = NOITE;
  // sol: 16h a 34°, some às ~19h10, a oeste sobre a represa
  const elev = THREE.MathUtils.degToRad(h <= 19.15 ? 34 - (h - 16) * (34 / 3.15) : -(h - 19.15) * 9);
  const az = THREE.MathUtils.degToRad(252);
  U.sunDir.value.set(Math.cos(elev) * Math.cos(az), Math.sin(elev), Math.cos(elev) * Math.sin(az)).normalize();
  sol.color.copy(U.sunCol.value);
  sol.intensity = THREE.MathUtils.lerp(A.si, B.si, t) * THREE.MathUtils.clamp(Math.sin(elev) * 6 + 0.25, 0.05, 1);
  sol.position.copy(U.sunDir.value).multiplyScalar(160); sol.position.y = Math.max(sol.position.y, 8);
  luzPalco.intensity = NOITE * 900; luzPista.intensity = NOITE * 260;
  lamp.material.color.setRGB(0.35 + NOITE * 2.2, 0.27 + NOITE * 1.6, 0.18 + NOITE * 0.7);
  renderer.toneMappingExposure = 1.05 + NOITE * 0.15;
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  document.getElementById('horaNum').textContent = `${hh}:${String(mm).padStart(2, '0')}`;
  document.getElementById('horaTxt').textContent = h < 17.8 ? 'Tarde' : h < 19.4 ? 'Pôr do sol' : 'Noite';
}
const horaSel = document.getElementById('horaSel');
const horaDoSlider = () => 16 + horaSel.value / 60;
horaSel.addEventListener('input', () => { animHora = null; aplicaHora(horaDoSlider()); });
let animHora = { de: 16.4, para: horaDoSlider(), t0: performance.now(), ms: 5200 };

// ---------------------------------------------------------------------------
// câmera: voos
// ---------------------------------------------------------------------------
let voo = null;
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function voa(pos, alvo, ms = 1300) { voo = { p0: cam.position.clone(), a0: ctl.target.clone(), p1: new THREE.Vector3(...pos), a1: new THREE.Vector3(...alvo), t0: performance.now(), ms }; }
const vista = (nome, ms) => voa(VISTAS[nome].pos, VISTAS[nome].alvo, ms);

// ---------------------------------------------------------------------------
// seleção
// ---------------------------------------------------------------------------
let selId = null, setorAtivo = null, hoverId = null;
const ficha = document.getElementById('ficha');
function pinta() {
  for (const l of lugares) {
    const sel = l.id === selId, hov = l.id === hoverId, doSetor = setorAtivo && l.setor === setorAtivo;
    if (l.inst != null) tampos.setColorAt(l.inst, sel ? COR_SOL : hov || doSetor ? COR_HOVER : COR_TAMPO);
    else if (l.mesh) { l.mesh.material.emissive.set(sel ? 0xffc21a : hov ? 0x6a4a10 : doSetor ? 0x3a2a08 : 0); l.mesh.material.emissiveIntensity = sel ? 0.9 : 1; }
    l.tag.classList.toggle('sel', sel);
  }
  tampos.instanceColor.needsUpdate = true;
  for (const p of pilulas) p.el.classList.toggle('apagada', !!setorAtivo && p.st !== setorAtivo && !(p.st === 'cam1' && /^cam/.test(setorAtivo)) && !(p.st === 'bis2' && /^bis/.test(setorAtivo)));
  [...document.querySelectorAll('.setor')].forEach(b => b.setAttribute('aria-pressed', b.dataset.st === setorAtivo));
}
function abreFicha(st, titulo, sub, extra = '') {
  const S = SETORES[st];
  ficha.style.setProperty('--c', S.cor);
  document.getElementById('fTag').textContent = S.curto;
  document.getElementById('fTag').style.background = S.cor;
  document.getElementById('fNome').textContent = titulo;
  document.getElementById('fSub').textContent = sub;
  document.getElementById('fPreco').textContent = S.preco;
  document.getElementById('fPrecoObs').textContent = S.obs;
  document.getElementById('fTxt').textContent = S.txt + extra;
  const b = document.getElementById('fComprar');
  b.style.display = S.semVenda ? 'none' : '';
  document.getElementById('fMiniNome').textContent = titulo;
  document.getElementById('fMiniPreco').textContent = S.preco;
  ficha.classList.remove('mini');
  ficha.classList.add('on');
}
// ficha recolhe numa pílula quando a pessoa mexe no mapa; um toque reabre
function recolheFicha() { if (ficha.classList.contains('on') && !noOlho) ficha.classList.add('mini'); }
ficha.addEventListener('click', e => { if (ficha.classList.contains('mini')) { e.preventDefault(); e.stopPropagation(); ficha.classList.remove('mini'); } }, true);
function seleciona(id, voar) {
  const l = porId.get(id); if (!l) return;
  saiDoOlho(); selId = id; setorAtivo = null; gravaHash(id);
  const S = SETORES[l.setor];
  if (l.tipo === 'cam') abreFicha(l.setor, 'Camarote ' + l.num, `${l.andar}º andar · lado esquerdo do palco`);
  else if (l.tipo === 'bis') abreFicha(l.setor, 'Bistrô ' + l.num, S.sub.replace('Bistrôs', 'Fileira dos bistrôs') + ' · lado direito');
  else abreFicha('lounge', 'Lounge ' + l.num, 'Na beira da passarela');
  pinta();
  if (voar) voaParaLugar(l);
}
function voaParaLugar(l) {
  const t = l.topo;
  const off = l.tipo === 'cam' ? [24, 11 + l.andar, 16] : l.tipo === 'bis' ? [-20, 11, 16] : [3, 9, 15];
  voa([t.x + off[0], t.y + off[1], t.z + off[2]], [t.x, t.y - 1, t.z]);
}
function escolheSetor(st) {
  saiDoOlho(); selId = null; setorAtivo = st; gravaHash(st);
  const S = SETORES[st];
  abreFicha(st, S.nome, S.sub);
  vista(S.vista);
  pinta();
}
function fechaFicha() { ficha.classList.remove('on'); selId = null; setorAtivo = null; gravaHash(''); saiDoOlho(); pinta(); }

// "Ver a vista daqui": câmera na altura dos olhos, olhando para o palco
const PALCO_OLHAR = [0, 5.6, -27];
const OLHO_SETOR = {
  vip: { pos: [2, 2.1, 7], alvo: PALCO_OLHAR },
  back: { pos: [-17.5, 5.3, -23], alvo: [0, 3.6, -25] },
  lounge: { pos: [-7.5, 2.5, -16.5], alvo: PALCO_OLHAR },
  palco: { pos: [0, 3.9, -24.5], alvo: [0, 2.5, 12] },
  cam1: { lugar: 'c7' }, cam2: { lugar: 'c19' }, cam3: { lugar: 'c31' }, bis2: { lugar: 'b12' }, bis3: { lugar: 'b56' },
};
let noOlho = false;
const btVista = document.getElementById('fVista');
function olhoDoLugar(l) {
  const t = l.topo;
  if (l.tipo === 'cam') return { pos: [t.x + 1.1, t.y + 0.25, t.z], alvo: PALCO_OLHAR };
  if (l.tipo === 'bis') return { pos: [t.x + 0.62, t.y + 0.15, t.z], alvo: PALCO_OLHAR };
  return { pos: [t.x, t.y + 0.3, t.z + 1.2], alvo: PALCO_OLHAR };
}
// No modo vista a câmera fica parada no lugar e o arrasto só gira o olhar
// (o alvo da órbita fica 0,8 m à frente dos olhos).
const ORBITA_MAPA = { minDistance: 6, maxDistance: 260, minPolarAngle: 0, maxPolarAngle: Math.PI * 0.47, enableZoom: true, enablePan: true, rotateSpeed: 1 };
const ORBITA_OLHO = { minDistance: 0.79, maxDistance: 0.81, minPolarAngle: Math.PI * 0.3, maxPolarAngle: Math.PI * 0.66, enableZoom: false, enablePan: false, rotateSpeed: -0.45 };
function entraNoOlho() {
  let o, nome;
  if (selId) { o = olhoDoLugar(porId.get(selId)); nome = document.getElementById('fNome').textContent; }
  else if (setorAtivo) { const s = OLHO_SETOR[setorAtivo]; o = s.lugar ? olhoDoLugar(porId.get(s.lugar)) : s; nome = SETORES[setorAtivo].nome; }
  if (!o) return;
  const st = selId ? porId.get(selId).setor : setorAtivo;
  noOlho = true;
  document.body.classList.add('olho');
  document.getElementById('olhoNome').textContent = nome;
  const comprar = document.getElementById('olhoComprar');
  comprar.href = Q2; comprar.style.display = SETORES[st].semVenda ? 'none' : '';
  const olho = new THREE.Vector3(...o.pos), dir = new THREE.Vector3(...o.alvo).sub(olho).normalize();
  const alvo = olho.clone().addScaledVector(dir, 0.8);
  Object.assign(ctl, { enableZoom: false, enablePan: false });
  voa(o.pos, alvo.toArray(), 1800);
  voo.aoFim = () => { if (noOlho) Object.assign(ctl, ORBITA_OLHO); };
  ajusta();
}
function saiDoOlho() {
  if (!noOlho) return;
  noOlho = false;
  document.body.classList.remove('olho');
  Object.assign(ctl, ORBITA_MAPA);
  ajusta();
}
function voltaDoOlho() { saiDoOlho(); if (selId) voaParaLugar(porId.get(selId)); else if (setorAtivo) vista(SETORES[setorAtivo].vista); else vista('geral'); }
btVista.onclick = () => entraNoOlho();
document.getElementById('olhoVoltar').onclick = voltaDoOlho;
window.addEventListener('keydown', e => { if (e.key === 'Escape' && noOlho) voltaDoOlho(); });
document.getElementById('fFechar').onclick = () => { fechaFicha(); vista('geral'); };

// hash: #c12, #b45, #l3, #vip, #back, #cam1…
function gravaHash(h) { history.replaceState(null, '', h ? '#' + h : location.pathname + location.search); }
function leHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (porId.has(h)) { seleciona(h, true); return true; }
  if (SETORES[h]) { escolheSetor(h); return true; }
  return false;
}
window.addEventListener('hashchange', leHash);

// ---------------------------------------------------------------------------
// painel: setores, busca, cartões
// ---------------------------------------------------------------------------
const ORDEM = ['vip', 'back', 'cam1', 'cam2', 'cam3', 'bis2', 'bis3', 'lounge'];
const boxSet = document.getElementById('setores'), boxCart = document.getElementById('cartoes');
for (const st of ORDEM) {
  const S = SETORES[st];
  const b = document.createElement('button'); b.className = 'setor'; b.dataset.st = st; b.style.setProperty('--c', S.cor);
  b.innerHTML = `<i></i><span><b>${S.nome}</b><small>${S.sub}</small></span><span class="p">${S.preco}</span>`;
  b.onclick = () => escolheSetor(st);
  boxSet.appendChild(b);
  const c = document.createElement('button'); c.className = 'cartao'; c.style.setProperty('--c', S.cor);
  c.innerHTML = `<b>${S.nome}</b><small>${S.sub}</small><div class="v">${S.preco} <span>${S.obs}</span></div>`;
  c.onclick = () => { escolheSetor(st); document.querySelector('.mapa').scrollIntoView({ behavior: 'smooth' }); };
  boxCart.appendChild(c);
}
const sug = document.getElementById('sugestoes');
function mostraSugestoes(lista) {
  sug.innerHTML = '';
  for (const [id, txt] of lista) { const b = document.createElement('button'); b.textContent = txt; b.onclick = () => { sug.innerHTML = ''; seleciona(id, true); }; sug.appendChild(b); }
}
mostraSugestoes([['c1', 'Camarote 1'], ['b45', 'Bistrô 45'], ['l3', 'Lounge 3']]);
document.getElementById('busca').addEventListener('submit', e => {
  e.preventDefault();
  const q = document.getElementById('q').value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const n = parseInt((q.match(/\d+/) || [])[0], 10);
  if (/vip|pista/.test(q)) return escolheSetor('vip');
  if (/back/.test(q)) return escolheSetor('back');
  if (/palco/.test(q)) return escolheSetor('palco');
  if (!n) { if (/cam/.test(q)) return escolheSetor('cam1'); if (/bis|mesa/.test(q)) return escolheSetor('bis2'); if (/lou/.test(q)) return escolheSetor('lounge'); return avisa('Digite um número, ex.: camarote 12'); }
  let id = null;
  if (/^c|cam/.test(q)) id = 'c' + n; else if (/^b|bis|mesa/.test(q)) id = 'b' + n; else if (/^l|lou/.test(q)) id = 'l' + n;
  if (id && porId.has(id)) { sug.innerHTML = ''; return seleciona(id, true); }
  const ops = [];
  if (n <= 36) ops.push(['c' + n, 'Camarote ' + n]);
  if (n <= 88) ops.push(['b' + n, 'Bistrô ' + n]);
  if (n <= 6) ops.push(['l' + n, 'Lounge ' + n]);
  if (!ops.length) return avisa('Não existe lugar ' + n + ' no mapa');
  if (ops.length === 1) return seleciona(ops[0][0], true);
  mostraSugestoes(ops);
});
const aviso = document.getElementById('aviso');
function avisa(t) { aviso.textContent = t; aviso.classList.add('on'); clearTimeout(avisa.t); avisa.t = setTimeout(() => aviso.classList.remove('on'), 1800); }
async function copiaLink() {
  try { await navigator.clipboard.writeText(location.href); avisa('Link copiado'); } catch (e) { avisa('Copie o endereço da barra'); }
}
document.getElementById('compartilhar').onclick = copiaLink;
document.getElementById('fLink').onclick = copiaLink;
const dolly = k => { const v = cam.position.clone().sub(ctl.target).multiplyScalar(k); voo = { p0: cam.position.clone(), a0: ctl.target.clone(), p1: ctl.target.clone().add(v), a1: ctl.target.clone(), t0: performance.now(), ms: 450 }; };
document.getElementById('zMais').onclick = () => dolly(0.7);
document.getElementById('zMenos').onclick = () => dolly(1.4);
document.getElementById('zReset').onclick = () => { fechaFicha(); vista('geral'); };

// vídeo do lugar
const video = document.getElementById('video'), som = document.getElementById('som');
new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? video.play().catch(() => {}) : video.pause()), { threshold: 0.35 }).observe(video);
som.onclick = () => { video.muted = !video.muted; som.textContent = video.muted ? '🔈 Som' : '🔊 Som'; if (!video.muted) video.play().catch(() => {}); };

// ---------------------------------------------------------------------------
// ponteiro: clique e hover no 3D
// ---------------------------------------------------------------------------
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
const alvosMesh = lugares.filter(l => l.mesh).map(l => l.mesh);
const meshParaLugar = new Map(lugares.filter(l => l.mesh).map(l => [l.mesh, l]));
const instParaLugar = new Map(lugares.filter(l => l.inst != null).map(l => [l.inst, l]));
const setorMesh = new Map([[pista, 'vip'], ...backs.map(b => [b, 'back'])]);
function acerta(e) {
  const r = canvas.getBoundingClientRect();
  ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ptr, cam);
  const hits = ray.intersectObjects([...alvosMesh, tampos, pista, ...backs], false);
  for (const h of hits) {
    if (h.object === tampos) return { lugar: instParaLugar.get(h.instanceId) };
    if (meshParaLugar.has(h.object)) return { lugar: meshParaLugar.get(h.object) };
    if (setorMesh.has(h.object)) return { setor: setorMesh.get(h.object) };
  }
  return null;
}
let baixo = null;
canvas.addEventListener('pointerdown', e => {
  baixo = [e.clientX, e.clientY];
  if (voo?.aoFim) { cam.position.copy(voo.p1); ctl.target.copy(voo.a1); voo.aoFim(); }
  voo = null; esconderDica(); recolheFicha();
});
canvas.addEventListener('pointerup', e => {
  if (noOlho) return;
  if (!baixo || Math.hypot(e.clientX - baixo[0], e.clientY - baixo[1]) > 6) return;
  const a = acerta(e);
  if (a?.lugar) seleciona(a.lugar.id, true);
  else if (a?.setor) escolheSetor(a.setor);
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const a = acerta(e); const id = a?.lugar?.id || null;
  canvas.style.cursor = a ? 'pointer' : '';
  if (id !== hoverId) { hoverId = id; pinta(); }
});
const dica = document.getElementById('dica');
function esconderDica() { dica.style.opacity = 0; }
setTimeout(esconderDica, 9000);

// ---------------------------------------------------------------------------
// laço
// ---------------------------------------------------------------------------
function ajusta() {
  const w = tela.clientWidth, h = tela.clientHeight;
  renderer.setSize(w, h, false); cam.aspect = w / h;
  cam.fov = noOlho ? (w < 700 ? 74 : 58) : (w < 700 ? 52 : 40); cam.updateProjectionMatrix();
}
new ResizeObserver(ajusta).observe(tela); ajusta();

const relogio = new THREE.Clock(), v = new THREE.Vector3();
let quadroN = 0, introFeita = false;
aplicaHora(16.4);
document.fonts?.ready.then(() => desenhaTelao(0, 0));
desenhaTelao(0, 0);
function quadro() {
  const t = relogio.getElapsedTime(); quadroN++;
  U.time.value = t;
  if (animHora) {
    const k = Math.min(1, (performance.now() - animHora.t0) / animHora.ms);
    aplicaHora(THREE.MathUtils.lerp(animHora.de, animHora.para, ease(k)));
    if (k >= 1) animHora = null;
  }
  if (voo) {
    const k = Math.min(1, (performance.now() - voo.t0) / voo.ms), e = ease(k);
    cam.position.lerpVectors(voo.p0, voo.p1, e); ctl.target.lerpVectors(voo.a0, voo.a1, e);
    if (k >= 1) { const fim = voo.aoFim; voo = null; fim?.(); }
  }
  ctl.update();
  // sombra acompanha o evento
  sol.target.position.set(0, 0, -2);
  // feixes de luz do palco
  for (const f of feixes) {
    f.m.rotation.x = 0.55 + Math.sin(t * f.f + f.fase) * 0.35;
    f.m.rotation.z = Math.sin(t * f.f * 0.7 + f.fase * 2) * 0.5;
    f.m.material.opacity = THREE.MathUtils.clamp((NOITE - 0.15) * 0.16, 0, 0.13);
  }
  if (quadroN % 3 === 0) desenhaTelao(t, NOITE);
  // rótulos
  const w = tela.clientWidth, h = tela.clientHeight;
  for (const p of pilulas) {
    const dist = cam.position.distanceTo(p.v);
    v.copy(p.v).project(cam);
    const fora = v.z > 1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2 || (p.perto && dist > p.perto && p.st !== setorAtivo);
    p.el.style.visibility = fora ? 'hidden' : '';
    p.el.style.scale = THREE.MathUtils.clamp(70 / dist, 0.62, 1).toFixed(3);
    p.el.style.left = ((v.x + 1) / 2 * w) + 'px'; p.el.style.top = ((-v.y + 1) / 2 * h) + 'px';
  }
  for (const l of lugares) {
    const d = cam.position.distanceTo(l.topo);
    const lim = l.tipo === 'bis' ? 34 : l.tipo === 'cam' ? 58 : 60;
    const mostra = d < lim || l.id === selId || (setorAtivo && l.setor === setorAtivo && d < lim * 1.8);
    l.tag.classList.toggle('longe', !mostra);
    if (!mostra) continue;
    v.copy(l.topo).project(cam);
    if (v.z > 1) { l.tag.classList.add('longe'); continue; }
    l.tag.style.left = ((v.x + 1) / 2 * w) + 'px'; l.tag.style.top = ((-v.y + 1) / 2 * h) + 'px';
  }
  renderer.render(cena, cam);
  if (!introFeita && quadroN === 3) {
    introFeita = true;
    document.getElementById('carregando').classList.add('fora');
    if (!leHash()) vista('geral', 5200);
  }
  requestAnimationFrame(quadro);
}
quadro();
