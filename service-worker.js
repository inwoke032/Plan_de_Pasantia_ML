const CACHE_NAME = 'pasantia-ia-v1';
const urlsToCache = [
  'index.html',
  'auth.html',
  '404.html',
  'CSS/style.css',
  'CSS/auth.css',
  'JS/script.js',
  'JS/auth.js',
  'JS/ai-module.js',
  'JS/ai-chat.js',
  'JS/app-init.js',
  'JS/supabase-client.js',
  'assets/images/logo.png', // <-- ¡Asegúrate de que esta ruta existe!
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        
        // **********************************************
        // * APLICAMOS EL FILTRO PARA EVITAR EL FALLO *
        // **********************************************
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url).then(response => {
              // Verifica si el fetch fue exitoso (status 200)
              if (!response.ok) {
                console.warn(`⚠️ Omitiendo: ${url} (Error ${response.status})`);
                return Promise.resolve(); // Resuelve el error sin fallar el Promise.all
              }
              return cache.put(url, response);
            }).catch(error => {
              // Captura errores de red (p. ej., problemas de conexión)
              console.error(`❌ Falló al intentar cachear: ${url}`, error);
              return Promise.resolve(); // Resuelve el error sin fallar el Promise.all
            });
          })
        );
      })
      .then(() => {
        // Log para saber que el proceso de caché (con fallos ignorados) terminó
        console.log('✅ Instalación de caché completada (posibles omisiones).');
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Solo procesar peticiones http y https. Ignorar chrome-extension, etc.
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
