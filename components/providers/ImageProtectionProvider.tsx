"use client";

import { useEffect } from "react";

const IMAGE_TAGS = ["img", "video", "canvas"];

export default function ImageProtectionProvider() {
  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        IMAGE_TAGS.includes(target.tagName.toLowerCase()) ||
        target.closest("img, video, canvas, picture")
      ) {
        event.preventDefault();
      }
    };

    const preventDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        IMAGE_TAGS.includes(target.tagName.toLowerCase()) ||
        target.closest("img, video, canvas, picture")
      ) {
        event.preventDefault();
      }
    };

    const preventShortcutCopy = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        (event.ctrlKey || event.metaKey) &&
        (key === "s" || key === "p")
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("dragstart", preventDragStart);
    document.addEventListener("keydown", preventShortcutCopy);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("dragstart", preventDragStart);
      document.removeEventListener("keydown", preventShortcutCopy);
    };
  }, []);

  return null;
}

