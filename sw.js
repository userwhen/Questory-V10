// sw.js
const CACHE_NAME = 'sq-v300-cache-v3'; // 每次更新內容時，手動改一下版本號
const urlsToCache = [
  './',
  './index.html',
  './css/style.css'
];

// 安裝時強制跳過等待，讓新的 SW 立即生效
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 清理舊的快取，確保不會一直讀到舊版本
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
});

// 修改為：先嘗試從網路抓取，失敗（斷網）才讀快取
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});