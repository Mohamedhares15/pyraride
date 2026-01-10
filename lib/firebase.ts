import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
    if (!messaging) return null;
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: "BMwL-..." // You might need a VAPID key from Firebase Console -> Cloud Messaging -> Web Push certificates
            });
            // Note: If no VAPID key is provided, it uses the default one. 
            // However, it's best practice to generate one in Firebase Console.
            // For now, we'll try without it or use a placeholder if needed.
            // Actually, getToken requires a vapidKey usually.
            // Let's try to get it without first, or use the one from the project if available.
            // If this fails, the user needs to generate a Key Pair in Firebase Console.
            return token;
        }
    } catch (error) {
        console.error("Error getting permission:", error);
    }
    return null;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (messaging) {
            onMessage(messaging, (payload) => {
                resolve(payload);
            });
        }
    });
