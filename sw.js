self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());
// (Cache opcional — mantemos simples para não interferir nas APIs)
