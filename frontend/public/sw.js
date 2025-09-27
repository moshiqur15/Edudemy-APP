const CACHE_NAME = 'edudemy-v1.0.0';
const OFFLINE_CACHE = 'edudemy-offline-v1.0.0';
const RUNTIME_CACHE = 'edudemy-runtime-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add your main JS and CSS files here
  '/static/js/main.js',
  '/static/css/main.css',
  // Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Routes to cache for offline access
const CACHED_ROUTES = [
  '/',
  '/dashboard',
  '/classes-students',
  '/user-management',
  '/settings',
  '/profile'
];

// API endpoints to cache (for offline data access)
const API_CACHE_PATTERNS = [
  '/api/auth/me',
  '/api/users',
  '/api/classes',
  '/api/students',
  '/api/attendance',
  '/api/permissions'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('[SW] Caching offline pages');
        return cache.addAll(CACHED_ROUTES);
      })
    ])
  );
  
  // Skip waiting and activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== OFFLINE_CACHE && 
                cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different request types
  if (url.origin === self.location.origin) {
    // Same-origin requests
    if (url.pathname.startsWith('/api/')) {
      // API requests - cache with network first strategy
      event.respondWith(handleApiRequest(request));
    } else if (url.pathname.startsWith('/static/') || STATIC_ASSETS.includes(url.pathname)) {
      // Static assets - cache first strategy
      event.respondWith(handleStaticAsset(request));
    } else {
      // Navigation requests - network first with offline fallback
      event.respondWith(handleNavigation(request));
    }
  } else {
    // External requests - network first
    event.respondWith(handleExternalRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const clonedResponse = networkResponse.clone();
      await cache.put(request, clonedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Add a header to indicate this is cached data
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Served-From', 'cache');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    // Return offline API response
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      message: 'This data is not available offline',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static asset failed to load:', request.url);
    throw error;
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigation(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful navigation responses
      const cache = await caches.open(OFFLINE_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, trying cache:', request.url);
    
    // Network failed, try cache
    const cache = await caches.open(OFFLINE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await cache.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EduDemy - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f3f4f6;
              color: #374151;
            }
            .offline-container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              max-width: 400px;
            }
            .offline-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 1rem;
              background: #ef4444;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
            }
            h1 { color: #1f2937; margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; line-height: 1.5; }
            button {
              background: #2563eb;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📡</div>
            <h1>You're Offline</h1>
            <p>EduDemy requires an internet connection to load new content. Please check your connection and try again.</p>
            <button onclick="location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle external requests
async function handleExternalRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[SW] External request failed:', request.url);
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-attendance') {
    event.waitUntil(syncOfflineAttendance());
  } else if (event.tag === 'background-sync-grades') {
    event.waitUntil(syncOfflineGrades());
  }
});

// Sync offline attendance data when connection is restored
async function syncOfflineAttendance() {
  try {
    const attendanceData = await getStoredData('offline-attendance');
    if (attendanceData && attendanceData.length > 0) {
      console.log('[SW] Syncing offline attendance data');
      
      for (const record of attendanceData) {
        try {
          await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
          });
        } catch (error) {
          console.error('[SW] Failed to sync attendance record:', error);
        }
      }
      
      // Clear synced data
      await clearStoredData('offline-attendance');
      console.log('[SW] Offline attendance data synced successfully');
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync offline grades data when connection is restored
async function syncOfflineGrades() {
  try {
    const gradesData = await getStoredData('offline-grades');
    if (gradesData && gradesData.length > 0) {
      console.log('[SW] Syncing offline grades data');
      
      for (const record of gradesData) {
        try {
          await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
          });
        } catch (error) {
          console.error('[SW] Failed to sync grade record:', error);
        }
      }
      
      // Clear synced data
      await clearStoredData('offline-grades');
      console.log('[SW] Offline grades data synced successfully');
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Utility functions for IndexedDB storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EduDemyOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    };
  });
}

async function getStoredData(key) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readonly');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data);
    });
  } catch (error) {
    console.error('[SW] Failed to get stored data:', error);
    return null;
  }
}

async function clearStoredData(key) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('[SW] Failed to clear stored data:', error);
  }
}

// Push notifications handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have new updates in EduDemy',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open EduDemy',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      options.title = pushData.title || 'EduDemy Notification';
      options.body = pushData.body || options.body;
      options.icon = pushData.icon || options.icon;
      options.data = { ...options.data, ...pushData.data };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
      options.title = 'EduDemy Notification';
    }
  } else {
    options.title = 'EduDemy Notification';
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Notification closed, no action needed
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Message handler for communication with the main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker loaded successfully');