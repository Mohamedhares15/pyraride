"use client";

import { useEffect } from "react";

export default function OrientationLock() {
  useEffect(() => {
    // Lock orientation to portrait on mobile devices
    const lockOrientation = async () => {
      // Check if running on mobile (screen width <= 768px)
      if (window.innerWidth <= 768) {
        try {
          // Try Screen Orientation API
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock("portrait").catch((err) => {
              // Some browsers don't support this or require user gesture
              console.log("Orientation lock not supported or requires user interaction");
            });
          }
          // Try legacy API
          else if ((screen as any).lockOrientation) {
            (screen as any).lockOrientation("portrait");
          }
          // Try webkit prefix
          else if ((screen as any).webkitLockOrientation) {
            (screen as any).webkitLockOrientation("portrait");
          }
          // Try moz prefix
          else if ((screen as any).mozLockOrientation) {
            (screen as any).mozLockOrientation("portrait");
          }
          // Try ms prefix
          else if ((screen as any).msLockOrientation) {
            (screen as any).msLockOrientation("portrait");
          }
        } catch (error) {
          console.log("Orientation lock not available:", error);
        }
      }
    };

    // Lock on mount
    lockOrientation();

    // Lock on resize (when orientation might change)
    window.addEventListener("resize", lockOrientation);
    window.addEventListener("orientationchange", lockOrientation);

    return () => {
      window.removeEventListener("resize", lockOrientation);
      window.removeEventListener("orientationchange", lockOrientation);
    };
  }, []);

  return null;
}

