import admin from "firebase-admin";

if (!admin.apps.length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
        console.warn("⚠️ Firebase Admin credentials missing! Push notifications will fail.");
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pyrarides",
                clientEmail,
                privateKey,
            }),
        });
    } catch (error) {
        console.error("Firebase admin initialization error", error);
    }
}

export const sendPushNotification = async (token: string, title: string, body: string, data?: any) => {
    try {
        if (!token) return;

        await admin.messaging().send({
            token,
            notification: {
                title,
                body,
                imageUrl: "https://www.pyrarides.com/icons/icon-192x192.png", // World-class logo
            },
            data: {
                ...data,
                url: data?.url || "/", // Default to home if no URL provided
            },
            webpush: {
                fcmOptions: {
                    link: data?.url || "/"
                },
                notification: {
                    icon: "https://www.pyrarides.com/icons/icon-192x192.png",
                    badge: "https://www.pyrarides.com/icons/icon-96x96.png"
                }
            }
        });
        console.log("Notification sent successfully to:", token);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};
