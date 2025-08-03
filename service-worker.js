self.addEventListener("install", (e) => {
    console.log("Service Worker: Installed");
    e.waitUntil(
        caches.open("property-cache").then((cache) => {
            return cache.addAll(["/", "/index.html", "/icon-192.png", "/icon-512.png"]);
        })
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
