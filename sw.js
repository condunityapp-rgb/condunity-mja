/* CondUnity SW — leve, seguro para Supabase */
const VERSION = "v1.0.0";
const CACHE_NAME = `condunity-static-${VERSION}`;

// Liste aqui apenas estáticos locais
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon.ico",
  // inclua aqui imagens locais do seu site, ex.: "./cec-logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((k) => (k.startsWith("condunity-static-") && k !== CACHE_NAME) ? caches.delete(k) : Promise.resolve())
    );
    await self.clients.claim();
  })());
});

/**
 * Estratégia:
 *  - Pedidos para domínios do Supabase → NÃO intercepta (deixa seguir pela rede)
 *  - GET para o mesmo host do app → cache-first com fallback de rede
 *  - Outros domínios (CDNs) → tenta rede; se offline e o pedido for navegacional, serve index.
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Não intercepta Supabase (auth, realtime, storage, etc.)
  if (url.hostname.includes("supabase.co") || url.hostname.includes("supabase.in")) {
    return;
  }

  // Navegação: se offline, tenta cache de index.html
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          return fresh;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match("./index.html")) || Response.error();
        }
      })()
    );
    return;
  }

  // Apenas GET (outros métodos não cacheamos)
  if (req.method !== "GET") return;

  // Mesma origem → cache first
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          // Cacheia só se OK e não for dev
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          // offline sem cache
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Outros domínios (CDN, ícones externos, etc.) → network first, fallback cache se existir
  event.respondWith(
    (async () => {
      try {
        return await fetch(req);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;
        // como fallback final, tenta index para requests de navegação (já coberto acima), aqui retorna erro
        return Response.error();
      }
    })()
  );
});
