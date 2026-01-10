
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
