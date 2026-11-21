/*
  ====================================================================================
  Nama Aplikasi : Sistem e - SPPD Terpadu - Dinas Pendidikan, Kepemudaan dan Olahraga
  File          : sw.js (Service Worker untuk Offline-First PWA)
  ====================================================================================
*/
const CACHE_NAME = 'sppd-pko-cache-v2';
const ASSETS_TO_CACHE = [
    './index.html',
    './sppdpko.html',
    './rekap_dpko.html',
    './cetak_dpko.html',
    './js/db.js',
    './js/sppdpko.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Jangan cache request ke Supabase API agar data selalu real-time
    if (event.request.url.includes('supabase.co/rest/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).catch(() => {
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
