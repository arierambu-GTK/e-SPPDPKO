/*
  ====================================================================================
  Nama Aplikasi : Sistem e - SPPD Terpadu - Dinas Pendidikan, Kepemudaan dan Olahraga
  File          : sw.js (Service Worker untuk Offline-First PWA)
  ====================================================================================
*/

const CACHE_NAME = 'sppd-pko-cache-v1';
const ASSETS_TO_CACHE = [
    './sppdpko.html',
    './sppdpko.js',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/dexie@3.2.4/dist/dexie.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).catch(() => {
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./sppdpko.html');
                }
            });
        })
    );
});
