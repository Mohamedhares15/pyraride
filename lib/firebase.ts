import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyADYxt0y1uF4SVcyrYK22Qp09nMxTmGr_4",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pyrarides.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pyrarides",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pyrarides.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "994220026642",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:994220026642:web:594df28bea4b04e94121cb",
    measurementId: "G-SBZW627YEX"
};

// Initialize Firebase only if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
    if (!messaging) {
        console.log('[Firebase] Messaging not available (SSR)');
        return null;
    }

    try {
        // Check if permission is already granted
        if (Notification.permission === "granted") {
            console.log('[Firebase] Notification permission already granted');
        } else if (Notification.permission === "default") {
            console.log('[Firebase] Requesting notification permission...');
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                console.log('[Firebase] Notification permission denied');
                return null;
            }
        } else {
            console.log('[Firebase] Notification permission denied (blocked)');
            return null;
        }

        // Register custom service worker
        console.log('[Firebase] Registering custom service worker...');
        const registration = await navigator.serviceWorker.register('/custom-sw.js', {
            scope: '/'
        });

        await navigator.serviceWorker.ready;
        console.log('[Firebase] Service worker registered and ready');

        // Get FCM token
        console.log('[Firebase] Getting FCM token...');
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

        const tokenConfig: any = {
            serviceWorkerRegistration: registration
        };

        if (vapidKey) {
            tokenConfig.vapidKey = vapidKey;
        }

        const token = await getToken(messaging, tokenConfig);

        if (token) {
            console.log('[Firebase] FCM Token obtained:', token.substring(0, 20) + '...');
            return token;
        } else {
            console.log('[Firebase] No FCM token available');
            return null;
        }
    } catch (error) {
        console.error("[Firebase] Error getting permission:", error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (messaging) {
            onMessage(messaging, (payload) => {
                console.log('[Firebase] Foreground message received:', payload);
                resolve(payload);
            });
        }
    });
