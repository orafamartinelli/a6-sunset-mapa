// v13 (18/11/2026, feedback do Rafa no celular): mapa em tela cheia no celular, ficha clara e contrastada
// (não se confunde com a cena) e fontes mais legíveis (Montserrat no lugar da Unbounded larga).
import fs from 'node:fs';
const arq = new URL('../index.html', import.meta.url);
let h = fs.readFileSync(arq, 'utf8');
const troca = (de, para) => { if (!h.includes(de)) throw new Error('não achei: ' + de.slice(0, 80)); h = h.replace(de, para); };

// fontes: títulos em Montserrat (legível); Italiana só no logo
troca(`--f-gordo:'Unbounded', 'Montserrat', sans-serif;`, `--f-gordo:'Montserrat', system-ui, sans-serif;`);
troca(`--f-tit:'Unbounded', 'Montserrat', sans-serif;`, `--f-tit:'Montserrat', system-ui, sans-serif;`);
troca(`family=Italiana&family=Unbounded:wght@500;700;800&family=Montserrat:wght@500;600;700;800`, `family=Italiana&family=Montserrat:wght@500;600;700;800;900`);

const css = `
/* ---- v13: legibilidade + ficha clara + tela cheia no celular ---- */
.painel h1{font:800 clamp(24px,2.2vw,30px)/1.12 var(--f-gordo);letter-spacing:-.02em}
.titulo{font:800 clamp(30px,4.6vw,56px)/1.06 var(--f-gordo);letter-spacing:-.025em}
.fato b{font:800 clamp(24px,3vw,36px)/1.05 var(--f-gordo);letter-spacing:-.02em}
.setor b{font:700 14px var(--f-tit);letter-spacing:0}
.rot{font:700 11px var(--f-tit);letter-spacing:.14em}
.pilula{font-weight:800;letter-spacing:.03em}
.btn{font:700 14px var(--f-tit);letter-spacing:.01em}
/* ficha: cartão claro, separado da cena 3D */
.ficha{background:#fffaf3;color:#26101f;border:0;box-shadow:0 18px 48px rgba(0,0,0,.45),0 0 0 1px rgba(0,0,0,.06);backdrop-filter:none}
.ficha .tag{font:800 11px var(--f-tit);letter-spacing:.08em}
.ficha h2{font:800 28px/1.08 var(--f-gordo);color:#1d0b18;letter-spacing:-.02em}
.ficha .sub{color:#6b4a5c;font:600 14px var(--f-txt)}
.ficha .preco b{font:800 28px var(--f-tit);color:#c2410c}
.ficha .preco small{color:#7a6070;font-size:12.5px}
.ficha p{color:#4a3341;font-size:14.5px;line-height:1.5}
.ficha .vista{background:#26101f;color:#ffd36b;border:0}
.ficha .vista[aria-pressed=true]{background:#ffc21a;color:#26101f}
.ficha .btn.vidro{background:#fff;color:#26101f;border:1.5px solid #e2d4c8;backdrop-filter:none}
.ficha .btn.sol{box-shadow:0 6px 18px rgba(255,138,42,.4)}
.ficha .fechar{color:#7a6070}
.ficha.mini{background:#fffaf3}
.ficha.mini .miniTxt{color:#1d0b18;font:700 15px var(--f-tit)}
.ficha.mini .miniTxt b{color:#c2410c}
.ficha.mini .miniTxt span:last-child{color:#7a6070}
@media (max-width:900px){
  /* o 3D ocupa a tela inteira; o painel de setores fica logo abaixo (rolando) */
  .mapa{margin-top:0}
  .mapa .tela{height:100vh;height:100svh;min-height:0}
  .topo{position:absolute;left:0;right:0;top:0}
  .ctrl{top:max(64px, calc(env(safe-area-inset-top,0px) + 58px))}
}
@media (max-width:600px){
  .ficha{padding:14px 16px 12px}
  .ficha .sub{display:block;grid-column:1 / -1;font-size:13px;margin-top:2px}
  .ficha h2{font-size:22px}
  .ficha .preco b{font-size:21px}
  .ficha .btn{font-size:14px;padding:12px}
  .fechar{background:#fffaf3;border:1px solid #e2d4c8;color:#26101f}
  .hora{width:140px}
  .pilula{font-size:12px;padding:7px 12px}
}
`;
troca(`@media (prefers-reduced-motion:reduce)`, css + `@media (prefers-reduced-motion:reduce)`);
h = h.replace(/app\.js\?v=\d+/, 'app.js?v=18');
fs.writeFileSync(arq, h);
console.log('ok');
