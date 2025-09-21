const CACHE = 'condunity-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png'
];

// ---- Install / Activate (cache básico, sem interceptar Supabase) ----
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

// ---- Fetch: same-origin network-first; externos passam direto ----
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // não cacheia Supabase/externos
  e.respondWith(
    fetch(e.request).then(resp => {
      caches.open(CACHE).then(c => c.put(e.request, resp.clone())).catch(()=>{});
      return resp;
    }).catch(() => caches.match(e.request))
  );
});

// ---- PUSH notifications ----
self.addEventListener('push', (event) => {
  // payload esperado: { title, body, url }
  let data = {};
  try { data = event.data?.json() || {}; } catch { data = { body: event.data?.text() }; }
  const title = data.title || 'Nova mensagem no CondUnity';
  const body  = data.body  || 'Você recebeu uma nova mensagem.';
  const url   = data.url   || './';

  const options = {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: { url }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(winList => {
      for (const client of winList) {
        if ('focus' in client) { client.focus(); client.navigate(url); return; }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
