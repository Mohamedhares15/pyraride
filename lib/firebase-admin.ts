import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pyrarides",
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

export const sendPushNotification = async (token: string, title: string, body: string, data?: any) => {
    try {
        if (!token) return;

        await admin.messaging().send({
            token,
            notification: {
                title,
                body,
            },
            data: data || {},
        });
        console.log("Notification sent successfully to:", token);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};
