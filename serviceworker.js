const CACHE_NAME = 'fayra-cache-v1';
// Archivos que se guardarán en caché
const urlsToCache = [
  '/',
  'index.html',
  'styles.css',
  'script.js',
  'icon-192.png', // Asegúrate de agregar tus íconos
  'icon-512.png'
];

// Evento 'install': se dispara cuando el SW se instala
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'fetch': se dispara cada vez que la app pide un recurso (CSS, JS, imagen)
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. Busca en el caché primero
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Si está en caché, lo devuelve
        }
        // 2. Si no está en caché, va a la red
        return fetch(event.request);
      }
    )
  );
});