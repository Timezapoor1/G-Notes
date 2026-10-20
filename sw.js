/* G-NOTES service worker: the app opens with no network once it has been loaded
   once. Pages and scripts are fetched fresh when online and kept for when not;
   everything else (fonts, the PDF reader) is kept the first time it is used. */
const CACHE = 'gnotes-b88';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  const own = url.origin === location.origin;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (own){
      // network first so an update is picked up on the next load, the copy kept for offline
      try {
        const r = await fetch(req);
        if (r && r.ok) cache.put(req, r.clone());
        return r;
      } catch(err){
        return (await cache.match(req, {ignoreSearch:true})) || (req.mode === 'navigate' ? await cache.match('index.html') : Response.error());
      }
    }
    const hit = await cache.match(req);
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone());
      return r;
    } catch(err){ return Response.error(); }
  })());
});
