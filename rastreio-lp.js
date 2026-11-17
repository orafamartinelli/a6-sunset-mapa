/* rastreio-lp.js — KIT PADRÃO de medição de toda página de cliente (regra do Rafa, 12/11/2026).
 * Fonte única: C:\Users\User\Documents\projetos\_kit-paginas\rastreio-lp\rastreio-lp.js (copiar para o site).
 *
 * Uso (no <head>):
 *   <script src="rastreio-lp.js?v=1" data-site="nome-do-projeto" defer></script>
 *   opcional: data-pagina="/imersiva" (padrão = caminho da URL)
 *   opcional: data-vercel-base="/vivasuperia" (site servido por proxy numa subpasta) ou "off"
 *
 * O que faz sozinho:
 *   - liga o Vercel Web Analytics (visitas por página/origem — ativar também no painel da Vercel)
 *   - grava em Supabase public.lp_eventos (funil pronto na view public.lp_funil):
 *       view · scroll 25/50/75/90/100 · cta (clique em botão/link de ação) · form_aberto · saida (segundos com a aba visível)
 * O que a página chama:
 *   RastreioLP.evento('form_enviado')            → no sucesso do formulário
 *   RastreioLP.evento('imersao', 25|50|75|100)   → progresso de uma abertura animada (se houver)
 *   RastreioLP.sessao / RastreioLP.pagina        → mandar junto no payload do CRM (pagina, sessao_lp)
 * Teste com robô (Playwright): abrir com ?rastreio_teste=1 → grava com site "<site>-teste".
 */
(function () {
  'use strict';
  var URL_BANCO = 'https://ibpxoytlngnxlimxbxzg.supabase.co/rest/v1/lp_eventos';
  var CHAVE_PUBLICA = 'sb_publishable_SL1nAmkZyYIn333_48CO6g_BlFEG1ML'; // publicável: RLS só deixa INSERT

  var tag = document.currentScript || document.querySelector('script[data-site]');
  var params = new URLSearchParams(location.search);
  var teste = params.get('rastreio_teste') === '1';
  if (navigator.webdriver && !teste) { window.RastreioLP = { evento: function () {}, sessao: null, pagina: null }; return; }

  var site = ((tag && tag.getAttribute('data-site')) || location.hostname).slice(0, 50) + (teste ? '-teste' : '');
  var pagina = ((tag && tag.getAttribute('data-pagina')) || location.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/').slice(0, 120);

  var sessao;
  try { sessao = sessionStorage.getItem('rlp_sessao'); } catch (e) {}
  if (!sessao) {
    sessao = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    try { sessionStorage.setItem('rlp_sessao', sessao); } catch (e) {}
  }

  var corte = function (v, n) { return v ? String(v).slice(0, n) : null; };
  var base = {
    site: site, pagina: pagina, sessao: sessao,
    utm_source: corte(params.get('utm_source'), 100),
    utm_medium: corte(params.get('utm_medium'), 100),
    utm_campaign: corte(params.get('utm_campaign'), 150),
    utm_content: corte(params.get('utm_content'), 150),
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'smartphone' : 'desktop',
    referrer: corte(document.referrer && document.referrer.split('?')[0], 200)
  };

  var enviados = {};
  function evento(nome, valor, rotulo) {
    var chave = nome + '|' + (valor == null ? '' : valor) + '|' + (rotulo || '');
    if (nome !== 'saida' && enviados[chave]) return; // cada marco 1x por página aberta
    enviados[chave] = 1;
    var corpo = Object.assign({}, base, { evento: nome, valor: valor == null ? null : Math.round(valor), rotulo: corte(rotulo, 80) });
    try {
      fetch(URL_BANCO, {
        method: 'POST', keepalive: true,
        headers: { 'apikey': CHAVE_PUBLICA, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(corpo)
      }).catch(function () {});
    } catch (e) {}
    try { if (window.va && nome !== 'view' && nome !== 'saida') window.va('event', { name: nome, data: { pagina: pagina, valor: valor == null ? '' : valor, rotulo: rotulo || '' } }); } catch (e) {}
  }

  // Vercel Web Analytics (sem pacote npm)
  try {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    // site atrás de proxy numa subpasta (ex.: orafamartinelli.com.br/vivasuperia) → data-vercel-base="/vivasuperia"
    var vbase = ((tag && tag.getAttribute('data-vercel-base')) || '').replace(/\/+$/, '');
    if (vbase !== 'off' && !document.querySelector('script[src*="/_vercel/insights/script.js"]') && !teste) {
      var s = document.createElement('script'); s.defer = true; s.src = vbase + '/_vercel/insights/script.js';
      if (vbase) s.setAttribute('data-endpoint', vbase + '/_vercel/insights');
      document.head.appendChild(s);
    }
  } catch (e) {}

  evento('view');

  // rolagem da página inteira
  var marcos = [25, 50, 75, 90, 100];
  function medirScroll() {
    var alt = document.documentElement.scrollHeight - innerHeight;
    var pct = alt > 0 ? (scrollY / alt) * 100 : 100;
    marcos.forEach(function (m) { if (pct >= m - 0.5) evento('scroll', m); });
  }
  addEventListener('scroll', medirScroll, { passive: true });

  // cliques de ação: [data-rastreio-cta], botões de orçamento, WhatsApp, .btn
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-rastreio-cta], [data-modal-open="orcamento"], a[href*="wa.me"], a[href*="whatsapp"], .btn, button[type="submit"]');
    if (!el) return;
    var rotulo = el.getAttribute('data-rastreio-cta') || (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) || el.tagName;
    if (el.matches('button[type="submit"]')) return; // envio é medido pelo form_enviado
    evento('cta', null, rotulo);
    if (el.matches('[data-modal-open="orcamento"], [data-rastreio-form]')) evento('form_aberto');
  }, true);

  // tempo com a aba visível (manda o acumulado ao sair/esconder)
  var visivelDesde = document.visibilityState === 'visible' ? Date.now() : null, acumulado = 0;
  function fechar() {
    if (visivelDesde) { acumulado += Date.now() - visivelDesde; visivelDesde = null; }
    if (acumulado > 0) evento('saida', Math.min(acumulado / 1000, 100000));
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') fechar(); else visivelDesde = Date.now();
  });
  addEventListener('pagehide', fechar);

  window.RastreioLP = { evento: evento, sessao: sessao, pagina: pagina, site: site };
})();
