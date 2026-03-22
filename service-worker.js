const CACHE_NAME = 'rufforth-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    // Never cache API or dynamic requests
    if (e.request.url.includes('/api/') || e.request.url.includes('adsb.lol') || e.request.url.includes('open-meteo') || e.request.url.includes('aviationweather')) {
        return;
    }
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});

// Push notification handler
self.addEventListener('push', e => {
    const data = e.data ? e.data.json() : { title: 'Rufforth Radar', body: 'Update available' };
    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/manifest.json',
            badge: '/manifest.json',
            tag: data.tag || 'rufforth',
            renotify: true
        })
    );
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.openWindow('/'));
});
