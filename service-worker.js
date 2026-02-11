/*
 * Hatua Recruitment Service Worker
 * Strategy: Hybrid (Stale-While-Revalidate for assets, Network-First for HTML)
 */

const CACHE_NAME = 'hatua-cache-v1';
const DYNAMIC_CACHE_NAME = 'hatua-dynamic-v1';

// 1. ASSETS TO CACHE IMMEDIATELY (App Shell)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './dashboard.html',
    './signin.html',
    './signup.html',
    './jobs.html',
    './manifest.json',
    './assets/images/logo.png',
    './assets/images/background.png',
    './assets/images/hero.png',
    // External Fonts/Icons (Optional: caching these speeds up load significantly)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap'
];

// 2. INSTALL EVENT
self.addEventListener('install', (event) => {
    // console.log('[Service Worker] Installing Service Worker ...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // console.log('[Service Worker] Caching App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Activate immediately
});

// 3. ACTIVATE EVENT (Clean up old caches)
self.addEventListener('activate', (event) => {
    // console.log('[Service Worker] Activating Service Worker ...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
                        // console.log('[Service Worker] Removing old cache.', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 4. FETCH EVENT
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // A. FIREBASE / API REQUESTS -> NETWORK ONLY
    // We do NOT want to cache Firestore/Auth requests, as they need real-time data.
    if (url.href.includes('firestore.googleapis.com') || 
        url.href.includes('googleapis.com/auth') ||
        url.href.includes('identitytoolkit')) {
        return; 
    }

    // B. HTML PAGES -> NETWORK FIRST, FALLBACK TO CACHE
    // This ensures users see the latest Dashboard/Jobs if online.
    if (event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then((fetchRes) => {
                    return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        // Save the new HTML to cache for offline use
                        cache.put(event.request.url, fetchRes.clone());
                        return fetchRes;
                    });
                })
                .catch(() => {
                    // If offline, return cached version
                    return caches.match(event.request).then((response) => {
                        if (response) return response;
                        // Optional: Return a specific "offline.html" page if cached
                        // return caches.match('./offline.html');
                    });
                })
        );
        return;
    }

    // C. STATIC ASSETS (Images, CSS, JS) -> STALE-WHILE-REVALIDATE
    // Serve from cache immediately, then update cache in background.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // If the network response is valid, update the cache
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Network failed, nothing to do (we hopefully have cachedResponse)
            });

            // Return cached response if found, else wait for network
            return cachedResponse || fetchPromise;
        })
    );
});
