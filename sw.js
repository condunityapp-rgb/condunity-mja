const CACHE = 'condunity-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png'
];

// Instalação: pré-cache dos assets locais
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

// Busca: 
// - para requisições MESMA ORIGEM: network-first (pega online rápido e cai pro cache se offline)
// - para TERCEIROS (ex.: Supabase): passa direto (não intercepta)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (!sameOrigin) return; // não intercepta Supabase/externos

  // network-first para HTML/locais
  e.respondWith(
    fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
