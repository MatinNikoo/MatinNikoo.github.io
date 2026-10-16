/* Skeptic offline support. The app shell is cached so Skeptic opens without a connection; the checks run offline. */
const CACHE = 'skeptic-f5c0f81c';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './config.js', './manifest.webmanifest']).catch(() => { }))) });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())) });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.endsWith('/config.js')) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
    return;
  }
  if (u.pathname.includes('/web-llm')) return;
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)) } return res })));
});
