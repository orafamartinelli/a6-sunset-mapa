// v2 (16/11/2026, feedback do Rafa no celular): fonte legível, ficha compacta/recolhível, modo "vista" imersivo.
import fs from 'node:fs';
const f = new URL('../index.html', import.meta.url);
let h = fs.readFileSync(f, 'utf8');
const troca = (de, para) => { if (!h.includes(de)) throw new Error('não achei: ' + de.slice(0, 60)); h = h.replace(de, para); };

// 1) fonte: sai a Bagel (gorda, ilegível no celular), entra Unbounded 800
troca(`--f-gordo:'Bagel Fat One', 'Arial Black', sans-serif;`, `--f-gordo:'Unbounded', 'Montserrat', sans-serif;`);
troca(`family=Italiana&family=Bagel+Fat+One&family=Unbounded:wght@500;700;800`, `family=Italiana&family=Unbounded:wght@500;700;800`);
troca(`.painel h1{font:400 clamp(26px,2.4vw,32px)/1.02 var(--f-gordo);margin:0;letter-spacing:.01em;`, `.painel h1{font:800 clamp(22px,2.1vw,28px)/1.1 var(--f-gordo);margin:0;letter-spacing:-.01em;`);
troca(`.ficha h2{font:400 34px/1 var(--f-gordo);margin:10px 0 4px}`, `.ficha h2{font:800 28px/1.05 var(--f-gordo);margin:10px 0 4px;letter-spacing:-.015em}`);
troca(`.titulo{font:400 clamp(34px,5vw,64px)/.98 var(--f-gordo);`, `.titulo{font:800 clamp(30px,4.4vw,56px)/1.04 var(--f-gordo);letter-spacing:-.02em;`);
troca(`.fato b{display:block;font:400 clamp(26px,3.2vw,40px)/1 var(--f-gordo);`, `.fato b{display:block;font:800 clamp(22px,2.8vw,34px)/1.05 var(--f-gordo);`);
troca(`.ficha .sub{color:var(--sub);font-size:13px;font-weight:600}`, `.ficha .sub{color:#f6dcc6;font-size:14px;font-weight:600}`);
troca(`.ficha p{font-size:12.5px;color:#e8c6b0;`, `.ficha p{font-size:13.5px;color:#f1d3bf;`);

// 2) ficha recolhida (pílula) + modo vista + mobile compacto
troca(`.fechar{position:absolute;`, `.ficha .miniTxt{display:none}
.ficha.mini{width:auto;max-width:calc(100% - 32px);padding:10px 16px;border-radius:999px;cursor:pointer}
.ficha.mini > *:not(.miniTxt){display:none}
.ficha.mini .miniTxt{display:flex;align-items:center;gap:10px;font:700 14px var(--f-tit);white-space:nowrap}
.ficha.mini .miniTxt i{width:10px;height:10px;border-radius:50%;background:var(--c)}
.ficha.mini .miniTxt b{color:var(--sol)}
.ficha.mini .miniTxt span:last-child{color:var(--sub);font-size:16px}
body.olho .ficha, body.olho .camada, body.olho .zoom, body.olho .dica{opacity:0!important;pointer-events:none!important}
.cinema{position:absolute;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity .6s}
.cinema::before,.cinema::after{content:"";position:absolute;left:0;right:0;height:9%;background:#000;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
.cinema::before{top:0;transform:translateY(-100%)}
.cinema::after{bottom:0;transform:translateY(100%)}
.cinema .vinheta{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%)}
body.olho .cinema{opacity:1}
body.olho .cinema::before,body.olho .cinema::after{transform:none}
.olhoBarra{position:absolute;left:50%;bottom:calc(9% + 14px);transform:translate(-50%,20px);z-index:6;display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;pointer-events:none;transition:.5s;width:max-content;max-width:calc(100% - 32px)}
body.olho .olhoBarra{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.olhoSelo{font:800 12px var(--f-tit);letter-spacing:.22em;text-transform:uppercase;color:var(--creme);text-shadow:0 2px 10px rgba(0,0,0,.7);text-align:center}
.olhoSelo b{display:block;font-size:clamp(22px,4vw,34px);letter-spacing:-.01em;text-transform:none;color:#fff;margin-top:4px}
.olhoAcoes{display:flex;gap:8px}
.olhoDica{font:600 12px var(--f-txt);color:#f6dcc6;text-shadow:0 1px 6px rgba(0,0,0,.8)}
.fechar{position:absolute;`);
troca(`@media (max-width:600px){
  .ficha{padding:14px;border-radius:16px}
  .ficha p{display:none}
  .ficha h2{font-size:26px;margin:8px 0 2px}
  .ficha .preco{margin:8px 0 10px}
  .ficha .preco b{font-size:22px}
  .ficha .btn{padding:10px 12px;font-size:12px}
}`, `@media (max-width:600px){
  .ficha{left:12px;right:12px;bottom:10px;width:auto;padding:12px 14px;border-radius:16px;display:grid;grid-template-columns:1fr auto;column-gap:10px;align-items:center}
  .ficha.mini{left:50%;right:auto;transform:translateX(-50%);display:block}
  .ficha .tag{display:none}
  .ficha p,.ficha .sub{display:none}
  .ficha h2{font-size:20px;margin:0;grid-column:1}
  .ficha .preco{margin:0;grid-column:2;grid-row:1;justify-content:flex-end}
  .ficha .preco b{font-size:20px}
  .ficha .preco small{display:none}
  .ficha .vista{grid-column:1 / -1;margin:10px 0 8px;padding:10px}
  .ficha .acoes{grid-column:1 / -1}
  .ficha .btn{padding:10px 12px;font-size:12.5px}
  .fechar{top:-12px;right:-6px;background:rgba(36,14,30,.95);border:1px solid var(--linha);border-radius:50%;width:30px;height:30px;font-size:16px;line-height:1}
  .hora{width:150px;padding:8px 10px;border-radius:12px}
  .hora b{font-size:17px}
  .hora small{font-size:9.5px}
  .hora .marcas{display:none}
  .hora input{margin:6px 0 0}
  .zoom button{width:38px;height:36px;font-size:16px}
  .pilula{font-size:10.5px;padding:7px 11px}
}`);

// HTML: pílula recolhida dentro da ficha + camada de cinema + barra do modo vista
troca(`      <button class="fechar" id="fFechar" aria-label="Fechar">×</button>`, `      <div class="miniTxt" id="fMini"><i></i><span id="fMiniNome">Camarote 14</span><b id="fMiniPreco">R$ 7.800</b><span>▴</span></div>
      <button class="fechar" id="fFechar" aria-label="Fechar">×</button>`);
troca(`    <div class="dica" id="dica">`, `    <div class="cinema" aria-hidden="true"><div class="vinheta"></div></div>
    <div class="olhoBarra" id="olhoBarra">
      <div class="olhoSelo">Sua vista<b id="olhoNome">Camarote 14</b></div>
      <div class="olhoAcoes">
        <button class="btn vidro" id="olhoVoltar">↩ Voltar ao mapa</button>
        <a class="btn sol" id="olhoComprar" data-rastreio-cta="comprar-vista" href="#" target="_blank" rel="noopener">Comprar</a>
      </div>
      <div class="olhoDica">Arraste para olhar em volta · mude o horário no alto</div>
    </div>
    <div class="dica" id="dica">`);
fs.writeFileSync(f, h);
console.log('ok');
