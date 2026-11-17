// v12 (17/11/2026): disponibilidade REAL vinda da Q2 (seats.io) pelo robô diário → disponibilidade.json.
import fs from 'node:fs';
const ler = n => fs.readFileSync(new URL('../' + n, import.meta.url), 'utf8');
const grava = (n, t) => fs.writeFileSync(new URL('../' + n, import.meta.url), t);
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error('não achei: ' + de.slice(0, 80)); return txt.replace(de, para); };

let j = ler('app.js');
j = troca(j, `const VENDAS = { csv: '', aCada: 60000 };`, `const VENDAS = { arquivo: 'disponibilidade.json' };   // gerado 1×/dia pelo robô (scripts/robo) lendo a Q2/seats.io
let atualizadoEm = null;`);
j = troca(j, `    } else if (VENDAS.csv) {
      const txt = await (await fetch(VENDAS.csv + (VENDAS.csv.includes('?') ? '&' : '?') + 't=' + Date.now())).text();
      for (const linha of txt.split(/\\r?\\n/).slice(1)) {
        const [lugar, status] = linha.split(',').map(x => (x || '').replace(/^"|"$/g, ''));
        const id = idDoTexto(lugar); if (id && /vend/i.test(status)) novos.add(id);
      }
    } else return;
  } catch (e) { return; }                       // sem planilha: o mapa segue sem indicação`,
`    } else {
      const d = await (await fetch(VENDAS.arquivo + '?t=' + Math.floor(Date.now() / 600000))).json();
      if (!d?.lugares) return;
      for (const [id, o] of Object.entries(d.lugares)) {
        const l = porId.get(id); if (!l) continue;
        l.estado = o.s; l.pessoas = o.p || null;
        if (o.s !== 'livre') novos.add(id);
      }
      atualizadoEm = d.atualizado ? new Date(d.atualizado) : null;
    }
  } catch (e) { return; }                       // sem arquivo: o mapa segue sem indicação`);
j = troca(j, `  document.body.classList.add('comVendas');
  if (demo) document.body.classList.add('demoVendas');`, `  document.body.classList.add('comVendas');
  if (demo) document.body.classList.add('demoVendas');
  const quando = document.getElementById('vendasQuando');
  if (quando && atualizadoEm) quando.textContent = 'atualizado ' + atualizadoEm.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });`);
j = troca(j, `if (VENDAS.csv) setInterval(carregaVendas, VENDAS.aCada);`, ``);
j = troca(j, `  if (comVendas && l.vendido) {
    document.getElementById('fPreco').textContent = 'Vendido';
    document.getElementById('fMiniPreco').textContent = 'Vendido';`, `  if (l.pessoas && l.tipo !== 'bis') document.getElementById('fSub').textContent += ' · até ' + l.pessoas + ' pessoas';
  if (comVendas && l.vendido) {
    const txtV = l.estado === 'reservado' ? 'Indisponível' : 'Vendido';
    document.getElementById('fPreco').textContent = txtV;
    document.getElementById('fMiniPreco').textContent = txtV;`);
j = troca(j, `txt: 'A fileira mais próxima da pista. Pergunte no WhatsApp quantas pessoas cada camarote leva.'`, `txt: 'A fileira mais próxima da pista.'`);
grava('app.js', j);

let h = ler('index.html');
h = troca(h, `<span><i style="background:rgba(255,255,255,.3)"></i>Vendido</span></div>`, `<span><i style="background:rgba(255,255,255,.3)"></i>Vendido</span><small id="vendasQuando" style="opacity:.7;font-weight:600"></small></div>`);
h = h.replace(/app\.js\?v=\d+/, 'app.js?v=16');
grava('index.html', h);
console.log('ok');
