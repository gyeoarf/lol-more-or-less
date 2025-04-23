// sw.js - Fixed Service Worker
const CACHE_NAME = 'lol-champs-v2';
const API_URL = 'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/champion.json';
const IMG_PREFIX = 'https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/js/data-loader.js'
            ]))
    );
});

self.addEventListener('fetch', (event) => {
    // Cache API-first strategy for champion data
    if (event.request.url === API_URL) {
        event.respondWith(
            caches.match(event.request)
                .then(cached => {
                    // Always fetch fresh data but return cached immediately
                    const fetchPromise = fetch(event.request)
                        .then(response => {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, clone));
                            return response;
                        })
                        .catch(err => {
                            console.error('Fetch failed, using cache', err);
                            return cached || new Response(JSON.stringify({error: 'Offline mode'}), {
                                headers: {'Content-Type': 'application/json'}
                            });
                        });

                    return cached || fetchPromise;
                })
        );
    }
    // Cache-first strategy for images
    else if (event.request.url.startsWith(IMG_PREFIX)) {
        event.respondWith(
            caches.match(event.request)
                .then(cached => cached || fetch(event.request))
        );
    }
    // Network-first for other assets
    else {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
    }
});