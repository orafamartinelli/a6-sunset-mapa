// v10 (17/11/2026): VIP Premium e Backstage compram no site (Q2); camarote, bistrô e lounge pelo WhatsApp.
// Lounges (no chão, colados na passarela em frente ao palco) passam a estar à venda.
import fs from 'node:fs';
const ler = n => fs.readFileSync(new URL('../' + n, import.meta.url), 'utf8');
const grava = (n, t) => fs.writeFileSync(new URL('../' + n, import.meta.url), t);
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error('não achei: ' + de.slice(0, 80)); return txt.replace(de, para); };

let j = ler('app.js');
j = troca(j, `for (const id of ['topoComprar', 'rodComprar', 'fComprar']) document.getElementById(id).href = linkZap('');`,
`// VIP Premium e Backstage = site (Q2); camarote, bistrô e lounge = WhatsApp (Rafa, 17/11)
const vaiProSite = st => st === 'vip' || st === 'back';
const linkCompra = (st, lugar) => vaiProSite(st) ? Q2 : linkZap(lugar);
for (const id of ['topoComprar', 'rodComprar', 'fComprar']) document.getElementById(id).href = Q2;`);
j = troca(j, `  b.href = linkZap(titulo); b.textContent = 'Compre agora'; b.onclick = null;`,
`  b.href = linkCompra(st, titulo); b.textContent = vaiProSite(st) ? 'Compre agora no site' : 'Compre agora'; b.onclick = null;`);
j = troca(j, `  comprar.href = linkZap(nome);`, `  comprar.href = linkCompra(st, nome);`);
j = troca(j, `  lounge: { nome: 'Lounge patrocinador', curto: 'Lounge', cor: '#2f6b3d', preco: 'Exclusivo', obs: 'para patrocinadores', sub: 'Lounges 1 a 6, na beira da passarela',
            txt: 'Espaços dos patrocinadores, colados na passarela. Não estão à venda.', vista: 'lounge', semVenda: true },`,
`  lounge: { nome: 'Lounge', curto: 'Lounge', cor: '#2f6b3d', preco: 'Consulte', obs: 'valor no WhatsApp', sub: 'Lounges 1 a 6, colados na passarela',
            txt: 'Lounge no chão, colado na passarela, bem em frente ao palco.', vista: 'lounge' },`);
j = troca(j, `{ t: 'LOUNGES PATROCINADORES',`, `{ t: 'LOUNGES',`);
// disponibilidade também para lounges
j = troca(j, `  return /^c|cam/.test(s) ? 'c' + n : /^b|bis/.test(s) ? 'b' + n : null;`, `  return /^c|cam/.test(s) ? 'c' + n : /^b|bis/.test(s) ? 'b' + n : /^l|lou/.test(s) ? 'l' + n : null;`);
j = troca(j, `    const livre = comVendas && !l.vendido && l.tipo !== 'lounge', vend = comVendas && l.vendido;`, `    const livre = comVendas && !l.vendido, vend = comVendas && l.vendido;`);
j = troca(j, `for (const l of lugares) if (l.tipo !== 'lounge' && ((l.num`, `for (const l of lugares) if (((l.num`);
grava('app.js', j);

let h = ler('index.html');
h = troca(h, `>Garantir meu ingresso<`, `>Garantir meu ingresso na Q2<`);
h = h.replace(/app\.js\?v=\d+/, 'app.js?v=13');
grava('index.html', h);
console.log('ok');
