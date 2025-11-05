// Pack&Play Service Worker
const CACHE_NAME = 'packandplay-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/discover.html',
  '/inventory.html',
  '/css/style.css',
  '/js/main.js',
  '/js/mock-data.js',
  '/auth/login.html',
  '/creator/tanaka.html',
  '/creator/packs/pack-detail.html',
  '/creator/packs/pack-open.html',
  '/dashboard/index.html',
  '/dashboard/cards.html',
  '/dashboard/packs.html',
  '/dashboard/redemptions.html',
  '/overlay/index.html'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache install error:', error);
      })
  );
  self.skipWaiting();
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ネットワーク優先、フォールバックでキャッシュ戦略
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // レスポンスが有効な場合、キャッシュに保存
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }

            // オフラインページを返す（オプション）
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Pack&Play', options)
  );
});

// 通知クリック時の動作
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
