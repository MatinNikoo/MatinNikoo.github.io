/* The old Skeptic app used to live at this address with an offline cache. This retires that cache once, so anyone who opened the old app gets the waitlist page. */
self.addEventListener('install', function () { self.skipWaiting() });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('skeptic-') === 0 }).map(function (k) { return caches.delete(k) })) })
    .then(function () { return self.registration.unregister() })
    .then(function () { return self.clients.matchAll({ type: 'window' }) })
    .then(function (cs) { cs.forEach(function (c) { try { c.navigate(c.url) } catch (x) { } }) }));
});
