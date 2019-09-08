const getCache = () => {
    return caches.open('new-cached');
};

self.addEventListener('install', (event) => {
    console.log('I have been installed: NEW VERSION');
    caches.open('new-cached')
        .then(cache => {
            cache.addAll([ '/', '/index.html', '/blog.html', ]);
        });
});

const fetchFromNetwork = (request, cache) => {
    return fetch(request)
        .then(response => {
            if (response.status === 404) {
                return new Response(`<h1>Was unable to find page</h1>`, {
                    status: 4040,
                    headers: new Headers({
                        'Content-Type': 'text/html',
                    })
                })
            } else {
                console.log('Gotten from network');
                // cache.put(request, response);n
                return response;
            }
        })
        .catch(err => {
            return new Response(`<h1>I was unable to connect to ...</h1>`, {
                status: 503,
                headers: new Headers({
                    'Content-Type': 'text/html'
                })
            })
        })
};

self.addEventListener('fetch', (event) => {
    console.log('Making a request to', event.request.url);

    event.respondWith(
        getCache().then(cache =>
            cache.match(event.request)
                .then(response => {
                    if (response) {
                        console.log('Gotten from cache');
                        return response;
                    } else
                        return fetchFromNetwork(event.request, cache);
                })
        )
    );
});
