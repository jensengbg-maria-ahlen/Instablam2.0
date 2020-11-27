self.addEventListener('install', event => {   
    console.log('Service worker installed: ', new Date().toLocaleDateString());
    event.waitUntil(
        caches.open('v1').then(cache => {
            return cache.addAll([
                '/index.html',
                '/img/512.png',
                '/style/style.css',
                '/manifest.webmanifest'
            ])
        })
    )
});


self.addEventListener('activate', event => {
    console.log('Service worker activated: ', new Date().toLocaleDateString());
});


self.addEventListener('fetch', function(event) {
    console.log('Service worked fetched: ', new Date().toLocaleDateString())
    if(navigator.onLine) {
        event.respondWith(fetch(event.request).then(response => {
            let clone = response.clone();
            caches.open('v1').then(cache => {
                cache.put(event.request, clone);
            })
            return response;
        }) )
    }
    else {
        event.respondWith(caches.match(event.request).then(maybeResponse => {
            if(maybeResponse !== undefined) {
                return maybeResponse;
            }
            else {
                return new Response('<h1>There is no internet!</h1>', {
                    headers: {'Content-Type' : 'text/html'}
                })
            }
        }) )
    }
});