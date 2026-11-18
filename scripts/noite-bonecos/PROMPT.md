# Tarefa da noite (18/11/2026, 22h, sem ninguém olhando): bonecos do Zezé & Luciano no palco do mapa 3D

Você está rodando sozinho, agendado pelo Rafa. Responda/escreva tudo em PT-BR. Siga o `C:\Users\User\.claude\CLAUDE.md`
(fila de render, memória só por Read+Edit, nada de `sleep`, git push no fim). Teto total: 2h30. Se travar num passo
por mais de 20 min, pare esse caminho e use o plano B.

## Contexto
- Projeto: `C:\Users\User\Documents\projetos\a6-sunset-mapa` (repo orafamartinelli/a6-sunset-mapa, push = publica na
  Vercel → https://orafamartinelli.com.br/sunset/). Leia antes a memória `project_a6_sunset_mapa_3d.md`.
- Hoje o palco tem 2 cantores PROVISÓRIOS feitos de caixas/cápsulas: grupo `cantores` em `app.js` (procure `const cantores`),
  posição x = −1,3 (Zezé, chapéu escuro) e +1,3 (Luciano, sem chapéu), y = PISO_PALCO, z = −25,2, olhando a plateia (+z).
- Higgsfield sem crédito → tudo LOCAL e GRÁTIS. GPU: RTX 4050 (6 GB). ComfyUI portátil em `C:\IA\ComfyUI_windows_portable`
  (Python 64-bit próprio em `python_embeded`; o `python` do sistema é 32-bit — não serve p/ IA).
- Fotos da dupla: `atracao.jpg` e `poster.jpg` no projeto (arte oficial do flyer: os dois juntos, de microfone).
  Pode extrair quadros de `lugar.mp4` se ajudar. ffmpeg: ver `reference_ffmpeg_disponivel.md` na memória.

## O que entregar
Dois bonecos RECONHECÍVEIS (rosto/cabelo/chapéu/roupa como na foto) em pé no palco, com leve balanço de show
(o Zezé de chapéu e camisa escura, o Luciano sem chapéu e camisa clara — confira na foto e siga a foto).
Peso total ≤ 3 MB (o mapa abre no celular). Precisa ficar bem de longe (vista geral) e de perto (voo da abertura passa
por cima deles a ~3 m, e a "Sua vista" do backstage fica a ~7 m).

**Plano A — 3D a partir da foto (tente primeiro, até 60 min):**
1. Recorte cada cantor da foto (fundo removido) no Python do ComfyUI (ex.: rembg/BiRefNet; downloads só de fontes
   oficiais GitHub/HuggingFace).
2. Gere o 3D com um modelo leve que caiba em 6 GB (TripoSR `stabilityai/TripoSR` ~1,7 GB, ou Hunyuan3D-2mini só forma +
   textura por projeção da foto). Rode o pesado pela fila: `python C:\Users\User\.claude\tools\fila-render.py "bonecos-sunset" -- <comando>`.
3. Converta para GLB enxuto (decimate, textura ≤ 1024 px), salve em `bonecos/zeze.glb` e `bonecos/luciano.glb`.
4. Julgue com print (Chrome headless/Playwright de `scripts/robo`, viewport 390×780 e 1400×900): se ficar
   disforme/irreconhecível, descarte e vá ao plano B. Não entregue boneco feio.

**Plano B — "recorte de palco" (garantido):** cada cantor recortado da foto vira um painel em pé no palco que sempre
gira para a câmera (billboard só no eixo Y), em tamanho real (~1,80 m), com sombra no chão, contorno/luz de palco e
leve balanço; pernas/base 3D simples se a foto cortar na cintura (ou enquadre a altura para parecer de corpo inteiro
atrás do retorno de palco: ponha 2 retornos/monitores de chão na frente escondendo a cintura).

## Como publicar (sem estragar a versão no ar)
- Coloque os bonecos atrás de uma chave: só aparecem com `?bonecos=1` na URL (sem a chave, continuam os provisórios).
  Suba o `?v=` do app.js. Teste sem erro no console nos dois tamanhos e com `?bonecos=1`. Commit + push.
- Copie `app.js`, `index.html` e a pasta `bonecos/` para
  `G:\Meu Drive\RaRo Tecnologia\Clientes\A6 Produções\Sunset Zezé - Represa Sendeski 05-12\Mapa 3D\`.
- Salve 3 prints (geral, voo por cima, vista do backstage) em `...\Mapa 3D\bonecos-previa\`.

## Fim
- Atualize a memória `project_a6_sunset_mapa_3d.md` (linha "v14 bonecos": plano usado, link de prévia, o que ficou ruim).
- Escreva um resumo curto em PT-BR, sem jargão, em `scripts\noite-bonecos\RESULTADO.md`: o que ficou pronto, link
  https://orafamartinelli.com.br/sunset/?bonecos=1 , e o que o Rafa precisa decidir (ex.: "aprovar → viram padrão").
- NÃO troque a versão padrão (sem a chave) e NÃO mande mensagem para ninguém. O Rafa aprova amanhã.
