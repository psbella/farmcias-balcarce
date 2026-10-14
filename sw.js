const CACHE_NAME = 'farmaturnos-v17';
const urls = [
  '/',
  '/index.html',
  '/manifest.json',
  '/config.json',
  '/privacidad.html',
  '/terminos.html',
  '/css/base.css',
  '/css/header.css',
  '/css/layout.css',
  '/css/cards.css',
  '/css/maps.css',
  '/css/controls.css',
  '/css/footer.css',
  '/css/responsive.css',
  '/css/components.css',
  '/css/banner.css',
  '/css/privacidad.css',
  '/css/terminos.css',
  '/js/main.js',
  '/js/config.js',
  '/js/data.js',
  '/js/maps.js',
  '/js/ui.js',
  '/js/theme.js',
  '/js/install.js',
  '/js/scroll-top.js',
  '/js/sw-update.js',
  '/js/analytics.js',
  '/js/legal-theme.js',
  '/images/icon-512.png',
  '/images/icon-192.png',
  '/images/icon-128.png',
  '/images/icon-96.png',
  '/images/icon-48.png',
  '/images/icon-32.png',
  '/images/icon-16.png'
];

// Instalación: cachear archivos estáticos
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cacheando archivos estáticos');
      return cache.addAll(urls);
    })
  );
  self.skipWaiting();
});

// Fetch: estrategia según tipo de recurso
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Para archivos JSON y datos dinámicos: network-first (siempre buscar fresco)
  if (url.pathname.endsWith('.json') || url.pathname.includes('db.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Para archivos estáticos: cache-first (rápido, usa caché)
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Activación: limpiar cachés viejas
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché vieja:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});
