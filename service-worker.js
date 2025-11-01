// YOUMELUX PWA Service Worker
const CACHE_NAME = 'youmelux-v1.0.0';
const OFFLINE_PAGE = '/index.html';

// Files to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/time.html',
  '/newexpense.html',
  '/expenses.html',
  '/quotation.html',
  '/finance.html',
  '/appointement.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Event - Cache essential files
self.addEventListener('install', (event) => {
  console.log('🚀 YOUMELUX PWA Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app files...');
        // Cache files one by one to avoid failure on missing files
        return Promise.allSettled(
          PRECACHE_ASSETS.map(url => 
            cache.add(url).catch(err => console.log(`⚠️ Failed to cache: ${url}`))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('✅ YOUMELUX PWA Activated!');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched file
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Offline fallback
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_PAGE);
            }
          });
      })
  );
});

// Background Sync (for future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('🔄 Syncing data...');
  // Add your sync logic here
}

// Push Notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from YOUMELUX',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('YOUMELUX Dashboard', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('🎉 YOUMELUX Service Worker Loaded!');