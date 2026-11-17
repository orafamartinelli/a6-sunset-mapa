// Robô diário (OK da A6, 17/11/2026): abre a página pública da Q2 como visitante, abre o mapa de assentos
// (seats.io) e pergunta ao próprio componente do seats.io o status de cada camarote, bistrô e lounge.
// Grava disponibilidade.json na raiz (o mapa 3D lê esse arquivo). Não segura nem seleciona lugar nenhum.
//   cd scripts/robo && npm ci && node disponibilidade-q2.mjs          (local: usa o Chrome instalado)
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const URL_EVENTO = 'https://q2ingressos.com.br/events/sunset-experience-na-represa-com-zeze-di-camargo-luciano';
const SAIDA = new URL('../../disponibilidade.json', import.meta.url);
const ESPERADOS = 36 + 110 + 6;

// rótulo do seats.io → id do mapa 3D (c = camarote, b = bistrô, l = lounge)
function idDoRotulo(r) {
  const n = parseInt((r.match(/-(\d+)$/) || [])[1], 10);
  if (!n) return null;
  if (/camarote/i.test(r)) return 'c' + n;
  if (/bistr/i.test(r)) return 'b' + n;
  if (/lounge/i.test(r)) return 'l' + n;
  return null;
}
const comTeto = (p, ms, oque) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('teto estourado: ' + oque)), ms))]);

async function rodada() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, locale: 'pt-BR' });
    let rotulos = null;
    page.on('response', async r => {
      if (!/\/rendering-info/.test(r.url())) return;
      try { rotulos = Object.keys((await r.json()).computedTableBookingModes || {}); } catch (e) { }
    });
    await comTeto(page.goto(URL_EVENTO, { waitUntil: 'domcontentloaded', timeout: 60000 }), 70000, 'abrir a página');
    await page.waitForTimeout(6000);
    // abre um ingresso com assento marcado e o mapa de assentos
    const bt = page.getByText(/selecionar assento/i).first();
    for (let k = 0; k < 5 && !(await bt.isVisible().catch(() => false)); k++) {
      await page.getByText(/p\/ 6 pessoas|Individual \| Lote/i).first().click().catch(() => { });
      await page.waitForTimeout(1500);
    }
    await bt.click({ timeout: 20000 });
    await page.waitForFunction(() => window.seatsio?.charts?.[0]?.state === 'RENDERED', null, { timeout: 45000 });
    for (let k = 0; k < 20 && !rotulos; k++) await page.waitForTimeout(500);
    if (!rotulos?.length) throw new Error('não veio a lista de lugares do seats.io');
    const status = await comTeto(page.evaluate(async lista => {
      const c = window.seatsio.charts[0], out = {};
      for (const r of lista) {
        try {
          const o = await c.findObject(r);
          out[r] = { status: o.status, venda: o.forSale !== false, cat: o.category?.label || '', pessoas: o.numSeats ?? o.seats?.length ?? null };
        } catch (e) { out[r] = { erro: true }; }
      }
      return out;
    }, rotulos), 60000, 'ler os lugares');
    const lugares = {};
    for (const [r, o] of Object.entries(status)) {
      const id = idDoRotulo(r); if (!id || o.erro) continue;
      const reservado = !o.venda || /reservad/i.test(o.cat);
      lugares[id] = { s: o.status === 'free' && !reservado ? 'livre' : reservado && o.status === 'free' ? 'reservado' : 'vendido', p: o.pessoas };
    }
    return lugares;
  } finally { await browser.close(); }
}

// até 2 tentativas, cada uma com teto
let lugares = null, erro = null;
for (let t = 1; t <= 2 && !lugares; t++) {
  try { lugares = await comTeto(rodada(), 180000, 'rodada inteira'); } catch (e) { erro = e; console.error(`tentativa ${t} falhou:`, e.message); }
}
if (!lugares) { console.error('FALHOU — mantendo o disponibilidade.json anterior'); process.exit(1); }
const n = Object.keys(lugares).length;
if (n < ESPERADOS * 0.9) { console.error(`só ${n} de ${ESPERADOS} lugares — não gravo (mapa da Q2 mudou?)`); process.exit(1); }
const conta = s => Object.values(lugares).filter(l => l.s === s).length;
fs.writeFileSync(SAIDA, JSON.stringify({ fonte: 'Q2 Ingressos (seats.io)', atualizado: new Date().toISOString(), lugares }, null, 1) + '\n');
console.log(`ok: ${n} lugares · livres ${conta('livre')} · vendidos ${conta('vendido')} · reservados ${conta('reservado')}`);
