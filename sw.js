// Offline support: cache the app shell (cache-first) and the last reading
// (network-first, falling back to cache) so today's reading stays available.
const SHELL = 'dreading-shell-v2';
const DATA = 'dreading-data-v1';
const SHELL_FILES = [
  './', './index.html', './app.css', './app.js', './config.js',
  './src/api.js', './src/format.js', './manifest.webmanifest', './icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL && k !== DATA).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const isReading = request.url.includes('/readings');

  if (isReading) {
    event.respondWith(
      fetch(request)
        .then((res) => { const copy = res.clone(); caches.open(DATA).then((c) => c.put(request, copy)); return res; })
        .catch(() => caches.match(request))
    );
  } else {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
  }
});
