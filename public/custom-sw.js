// Custom Service Worker for Push Notifications
// This approach doesn't use importScripts to avoid CSP issues

self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push received:', event);

    let notificationData = {
        title: 'PyraRide',
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        data: {}
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            console.log('[Service Worker] Push payload:', payload);

            if (payload.notification) {
                notificationData = {
                    title: payload.notification.title || notificationData.title,
                    body: payload.notification.body || notificationData.body,
                    icon: payload.notification.icon || notificationData.icon,
                    badge: payload.notification.badge || notificationData.badge,
                    data: payload.data || {}
                };
            }
        } catch (e) {
            console.error('[Service Worker] Error parsing push data:', e);
        }
    }

    const promiseChain = self.registration.showNotification(
        notificationData.title,
        {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            data: notificationData.data,
            actions: [
                { action: 'open', title: 'Open App' }
            ]
        }
    );

    event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click received:', event);
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (windowClients) {
                // Check if there is already a window/tab open with the target URL
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(clients.claim());
});
