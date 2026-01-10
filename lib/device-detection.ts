export function detectDevice() {
    if (typeof window === 'undefined') return null;

    const ua = navigator.userAgent;

    const isIOS = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
    const isChrome = /Chrome|CriOS/.test(ua) && !/ Edg\//.test(ua);
    const isFirefox = /Firefox|FxiOS/.test(ua);

    // Check if running as PWA (standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');

    // Check if push notifications are supported
    const pushSupported = 'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;

    // iOS push only works in Safari PWA on iOS 16.4+
    const iosPushSupported = isIOS && isSafari && isPWA;

    return {
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        isPWA,
        pushSupported,
        iosPushSupported,
        isMobile: isIOS || isAndroid,
        platform: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop',
        browser: isSafari ? 'Safari' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : 'Other',

        // Recommendations
        canUsePush: (isAndroid && pushSupported) || (isIOS && isSafari && isPWA && pushSupported),
        needsPWAInstall: isIOS && !isPWA,
        needsSafari: isIOS && !isSafari,
    };
}

export function getNotificationGuidance() {
    const device = detectDevice();
    if (!device) return null;

    if (device.canUsePush) {
        return {
            type: 'ready',
            message: 'Your device supports push notifications!',
            action: 'Enable Notifications',
        };
    }

    if (device.needsSafari) {
        return {
            type: 'wrong-browser',
            message: 'Safari is required for notifications on iPhone',
            action: 'Open in Safari',
            instructions: [
                'Copy this URL',
                'Open Safari on your iPhone',
                'Paste the URL and visit the site',
                'Add to Home Screen from Safari',
            ],
        };
    }

    if (device.needsPWAInstall) {
        return {
            type: 'needs-install',
            message: 'Add PyraRide to your Home Screen for notifications',
            action: 'Install App',
            instructions: [
                'Tap the Share button (square with arrow)',
                'Scroll down and tap "Add to Home Screen"',
                'Tap "Add" in the top right',
                'Open the app from your home screen',
                'Allow notifications when prompted',
            ],
        };
    }

    return {
        type: 'no-push',
        message: 'Push notifications are not supported on this device. You\'ll receive in-app notifications instead.',
        action: null,
    };
}
