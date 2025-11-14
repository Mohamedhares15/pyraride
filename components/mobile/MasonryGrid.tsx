"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import GalleryLightbox from "./GalleryLightbox";

interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  location?: string;
  date?: string;
  photographer?: string;
  likes?: number;
  width?: number;
  height?: number;
}

interface MasonryGridProps {
  photos: GalleryPhoto[];
  onLike?: (photoId: string) => void;
  onShare?: (photo: GalleryPhoto) => void;
}

export default function MasonryGrid({ photos, onLike, onShare }: MasonryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  return (
    <>
      <div className="masonry-grid">
        {photos.map((photo, index) => {
          const isLoaded = loadedImages.has(photo.id);
          const aspectRatio = photo.width && photo.height ? photo.width / photo.height : 1;
          const height = aspectRatio < 0.8 ? 280 : aspectRatio > 1.2 ? 200 : 240;

          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0.3, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="masonry-item"
              style={{ height: `${height}px` }}
            >
              {!isLoaded && (
                <div className="skeleton absolute inset-0" />
              )}
              <Image
                src={photo.src}
                alt={photo.alt || photo.caption || "Gallery photo"}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                sizes="(max-width: 428px) 100vw, 50vw"
                loading="lazy"
                onLoad={() => handleImageLoad(photo.id)}
                onClick={() => setSelectedIndex(index)}
              />
              {/* Overlay with caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
              {/* Double-tap to like hint */}
              <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <div className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <GalleryLightbox
          photos={photos}
          initialIndex={selectedIndex}
          isOpen={true}
          onClose={() => setSelectedIndex(null)}
          onLike={onLike}
          onShare={onShare}
        />
      )}
    </>
  );
}

