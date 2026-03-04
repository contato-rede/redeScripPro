// Build: 2026-03-04T11:51:15.475Z
const CACHE_NAME = 'rspro-v-1772625075475';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

// Default manifest data
const DEFAULT_ICON = 'https://picsum.photos/seed/rspro/192/192';

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

// Store custom icon in memory (will be lost on SW restart, but clients will provide it)
let cachedCustomIcon = null;

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_MANIFEST') {
    cachedCustomIcon = event.data.icon;
    console.log('Service Worker: Custom icon updated');
    
    // Clear manifest from cache to force refresh
    caches.open(CACHE_NAME).then(cache => {
      cache.delete('/manifest.json').then(() => {
        console.log('Service Worker: Manifest cache cleared');
      });
    });
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept manifest.json requests
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      (async () => {
        try {
          // Try to get custom icon from client (localStorage)
          const clients = await self.clients.matchAll({ type: 'window' });
          let customIcon = null;
          
          // First check cached icon
          if (cachedCustomIcon) {
            customIcon = cachedCustomIcon;
          } else {
            // Try to get custom icon from the first available client
            for (const client of clients) {
              try {
                const response = await new Promise((resolve) => {
                  const channel = new MessageChannel();
                  channel.port1.onmessage = (e) => resolve(e.data);
                  client.postMessage({ type: 'GET_CUSTOM_ICON' }, [channel.port2]);
                  // Timeout after 500ms
                  setTimeout(() => resolve({ icon: null }), 500);
                });
                if (response && response.icon) {
                  customIcon = response.icon;
                  cachedCustomIcon = customIcon; // Cache for future requests
                  break;
                }
              } catch (e) {
                console.log('Error getting icon from client:', e);
              }
            }
          }
          
          const iconUrl = customIcon || DEFAULT_ICON;
          
          const manifestContent = {
            name: "Rede Script Pro",
            short_name: "RSPro",
            description: "Sistema de Gestão de Vendas e Scripts",
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#4f46e5",
            icons: [
              {
                src: iconUrl,
                sizes: "192x192",
                type: "image/png"
              },
              {
                src: iconUrl,
                sizes: "512x512",
                type: "image/png"
              }
            ]
          };
          
          return new Response(JSON.stringify(manifestContent), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        } catch (error) {
          console.error('Error generating manifest:', error);
          // Fallback to default manifest
          return fetch(event.request);
        }
      })()
    );
    return;
  }
  
  // Default cache behavior for other requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
