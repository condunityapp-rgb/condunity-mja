PWA PACK — Condunity (para /condunity-mja/)

O QUE É
- Arquivos prontos para tornar o site instalável como app (Android/iOS) hospedado em https://condunityapp-rgb.github.io/condunity-mja/

ONDE COLOCAR
- Coloque **todos** estes arquivos no MESMO lugar onde está o seu `index.html` que aparece no site (normalmente na raiz do repositório).
- Se o seu `index.html` estiver dentro de `docs/`, coloque os arquivos dentro de `docs/` também.

PASSO A PASSO
1) Envie (faça upload) para o repositório:
   - `manifest.json`
   - `sw.js`
   - pasta `icons/` com os 3 arquivos PNG
2) Abra seu `index.html` e adicione estas linhas dentro do <head>:
   <link rel="manifest" href="./manifest.json" />
   <meta name="theme-color" content="#0ea5e9" />
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="default" />
   <link rel="apple-touch-icon" href="./icons/icon-192.png" />
3) No final do <body> do `index.html` (ou no seu JS principal), adicione:
   <script>
   if ('serviceWorker' in navigator) {
     window.addEventListener('load', () => {
       navigator.serviceWorker.register('./sw.js');
     });
   }
   </script>
4) Faça commit/push (ou salve pelo editor do GitHub). Aguarde o Pages atualizar (1-2 min).
5) Teste:
   - Android/Chrome: abra o site > Menu ⋮ > "Instalar app".
   - iPhone/Safari: compartilhar > "Adicionar à Tela de Início".
6) Offline: abra o site uma vez, depois desligue a internet e recarregue a home — deve carregar do cache.

Obs.: Este pacote usa caminhos RELATIVOS (./), funcionando corretamente em subcaminho `/condunity-mja/`.