const fs = require("node:fs");
const https = require("node:https");

const tomlPath = "C:/Users/User/.wrangler/config/default.toml";
const tomlText = fs.readFileSync(tomlPath, "utf8");
const TOKEN = tomlText.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if (!TOKEN) { console.error("oauth_token não encontrado em " + tomlPath); process.exit(1); }

const ACCOUNT_ID = "57200dd7ed7c5dfbbd795fdf1956bd36";
const ZONE_ID = "385ffa647519dacdc73755269ea2e5bb";
const WORKER_NAME = "sunset-proxy";
const VERCEL_HOST = "a6-sunset-mapa.vercel.app";

const script = `
addEventListener('fetch', event => { event.respondWith(handle(event.request)); });
async function handle(request) {
  const url = new URL(request.url);

  // Forçar trailing slash em /sunset para que paths relativos (style.css, src/..., assets/...)
  // resolvam contra /sunset/ e não contra a raiz do domínio
  if (url.pathname === '/sunset') {
    return Response.redirect(url.origin + '/sunset/' + url.search, 301);
  }

  let path = url.pathname.replace(/^\\/sunset\\/?/, '/');
  if (path === '') path = '/';
  const target = 'https://${VERCEL_HOST}' + path + url.search;
  const upstream = await fetch(target, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual'
  });
  const headers = new Headers(upstream.headers);
  headers.delete('content-security-policy');
  return new Response(upstream.body, { status: upstream.status, headers });
}
`;

function cfRequest(method, urlPath, body, contentType) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.cloudflare.com",
      path: "/client/v4/" + urlPath,
      method,
      headers: { "Authorization": "Bearer " + TOKEN }
    };
    if (body) {
      options.headers["Content-Type"] = contentType || "application/json";
      options.headers["Content-Length"] = Buffer.byteLength(body);
    }
    const req = https.request(options, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve(JSON.parse(d)); } catch (e) { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  console.log("1. Deploying worker script...");
  const deploy = await cfRequest("PUT", `accounts/${ACCOUNT_ID}/workers/scripts/${WORKER_NAME}`, script, "application/javascript");
  console.log("worker deploy:", deploy.success ? "ok" : JSON.stringify(deploy.errors || deploy));
  if (!deploy.success) process.exit(1);

  console.log("2. Listing existing routes...");
  const existingRoutes = await cfRequest("GET", `zones/${ZONE_ID}/workers/routes`, null);
  // Padrão wildcard único cobre /sunset, /sunset/, /sunset/qualquer-coisa.
  // Usar 2 rotas separadas (`/sunset` exato + `/sunset/*`) tem comportamento
  // estranho na Cloudflare: a rota exata pode não disparar o Worker.
  const targetPatterns = ["orafamartinelli.com.br/sunset*"];

  for (const pattern of targetPatterns) {
    const existing = (existingRoutes.result || []).find(r => r.pattern === pattern);
    if (existing) {
      console.log(`route ${pattern}: already exists (id ${existing.id}, script ${existing.script}) — skipping`);
      continue;
    }
    const route = await cfRequest("POST", `zones/${ZONE_ID}/workers/routes`, JSON.stringify({ pattern, script: WORKER_NAME }));
    console.log(`route ${pattern}:`, route.success ? "ok" : JSON.stringify(route.errors || route));
  }

  console.log("3. Done. Test with: curl -sI https://orafamartinelli.com.br/sunset");
})();
