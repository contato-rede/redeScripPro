// Build: 2026-03-04T17:32:42.772Z
const CACHE_NAME = 'rspro-v-1772645562772';
const ASSETS_TO_CACHE = [
  '/redeScripPro/',
  '/redeScripPro/index.html',
  '/redeScripPro/manifest.json',
  '/redeScripPro/RedeScriptPro_Icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  console.log('Service Worker: Installed version', CACHE_NAME);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
