"use client";

import { useEffect } from "react";

// Extend Screen interface to include orientation lock methods
interface ScreenWithOrientation extends Screen {
  orientation?: {
    lock?: (orientation: "portrait" | "landscape" | "portrait-primary" | "portrait-secondary" | "landscape-primary" | "landscape-secondary" | "natural" | "any") => Promise<void>;
  };
  lockOrientation?: (orientation: string) => boolean;
  webkitLockOrientation?: (orientation: string) => boolean;
  mozLockOrientation?: (orientation: string) => boolean;
  msLockOrientation?: (orientation: string) => boolean;
}

export default function OrientationLock() {
  useEffect(() => {
    // Lock orientation to portrait on mobile devices
    const lockOrientation = async () => {
      // Check if running on mobile (screen width <= 768px)
      if (typeof window !== "undefined" && window.innerWidth <= 768) {
        try {
          const screenWithOrientation = screen as ScreenWithOrientation;
          
          // Try Screen Orientation API
          if (screenWithOrientation.orientation?.lock) {
            await screenWithOrientation.orientation.lock("portrait").catch((err) => {
              // Some browsers don't support this or require user gesture
              console.log("Orientation lock not supported or requires user interaction");
            });
          }
          // Try legacy API
          else if (screenWithOrientation.lockOrientation) {
            screenWithOrientation.lockOrientation("portrait");
          }
          // Try webkit prefix
          else if (screenWithOrientation.webkitLockOrientation) {
            screenWithOrientation.webkitLockOrientation("portrait");
          }
          // Try moz prefix
          else if (screenWithOrientation.mozLockOrientation) {
            screenWithOrientation.mozLockOrientation("portrait");
          }
          // Try ms prefix
          else if (screenWithOrientation.msLockOrientation) {
            screenWithOrientation.msLockOrientation("portrait");
          }
        } catch (error) {
          console.log("Orientation lock not available:", error);
        }
      }
    };

    // Lock on mount
    lockOrientation();

    // Lock on resize (when orientation might change)
    if (typeof window !== "undefined") {
      window.addEventListener("resize", lockOrientation);
      window.addEventListener("orientationchange", lockOrientation);

      return () => {
        window.removeEventListener("resize", lockOrientation);
        window.removeEventListener("orientationchange", lockOrientation);
      };
    }
  }, []);

  return null;
}

