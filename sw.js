// SLTimer Service Worker v3
const CACHE = 'sltimer-v3';

// Archivos que se guardan en caché para modo offline
const PRECACHE = [
  '/app.html',
  '/index.html',
  '/slalom.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
];

// Instalar: guardar en caché los archivos principales
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(() => console.warn('No cacheado:', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activar: limpiar cachés antiguas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network first, caché como fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Para peticiones a Supabase (API), siempre ir a la red
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          if (e.request.mode === 'navigate') {
            return caches.match('/app.html');
          }
        });
      })
  );
});
