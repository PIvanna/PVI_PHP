const CACHE_NAME = "pwa-cache-v1";


const ASSETS = [
  "/",                      
  "/index.php", 
  "/tasks.php",
  "/dashboard.php",
  "/components/header.php",
  "/components/sidebar.php",
  "/message.php",
  "/css/main.css",            
  "/css/header.css",            
  "/css/sidebar.css",            
  "/css/table.css",  
  "/fonts/Monomakh-Regular.ttf", 
  "/fonts/OFL.txt",                  
  "/js/components.js",            
  "/js/main.js",            

  "/img/1214428.png",   // Іконка 128px
  "/img/2202989.webp",   // Іконка 512px
  "/img/appointment-reminders.png",   // Іконка 512px
  "/img/avatar-default-icon-2048x2048-h6w375ur.png",   // Іконка 512px
  "/img/gender-neutral-user.png",   // Іконка 512px
  "/img/notification-icon-2048x2048-vvg9zrmk.png",   // Іконка 512px
  "/img/android-chrome-128x128.png",   // Іконка 512px
  "/img/pngtree-vector-notification-icon-png-image_927192.jpg",   // Іконка 512px
  "/Project/public/img/android-chrome-192x192.png",   // Іконка 512px
  "/img/android-chrome-256x256.png",   // Іконка 512px
  "/img/android-chrome-512x512.png",   // Іконка 512px
];

// Подія встановлення Service Worker
// Відбувається при першому запуску або коли SW оновлюється
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Кешування ресурсів...");// логування не обовязкове
      // Додаємо файли до кешу, якщо якийсь файл не вдасться завантажити, обробляємо помилку
      return cache.addAll(ASSETS).catch(console.error);
    })
  );
});

// Подія обробки запитів від клієнта (браузера)
// Якщо файл є в кеші – повертаємо його, інакше робимо запит до мережі
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Запит до мережі, якщо ресурсу немає в кеші
        const networkFetch = fetch(event.request).then((networkResponse) => {
          // Зберігаємо отриманий файл у кеш для майбутніх запитів
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Повертаємо кешовану версію, якщо вона є, інакше робимо запит до мережі
        return cachedResponse || networkFetch;
      });
    })
  );
});

// Подія активації Service Worker
// Видаляє старі кеші, які більше не використовуються
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // Знаходимо старі кеші
          .map((key) => caches.delete(key))   // Видаляємо їх
      );
    }).then(() => {
      console.log("Новий Service Worker активовано.");
      return self.clients.claim(); // Переключаємо новий SW для всіх вкладок
    })
  );
});