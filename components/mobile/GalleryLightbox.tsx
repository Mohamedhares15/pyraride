"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { X, Heart, Share2, MapPin, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  location?: string;
  date?: string;
  photographer?: string;
  likes?: number;
}

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (photoId: string) => void;
  onShare?: (photo: GalleryPhoto) => void;
}

export default function GalleryLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  onLike,
  onShare,
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const currentPhoto = photos[currentIndex];

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, distance: 0 });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setTouchStart({ x: 0, distance });
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isSwipeTouchStart(touchStart)) {
      setTouchEnd(e.touches[0].clientX);
    } else if (e.touches.length === 2 && isPinchTouchStart(touchStart)) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scaleChange = distance / touchStart.distance;
      setScale(Math.max(1, Math.min(3, scaleChange)));
    }
  };

  const onTouchEnd = () => {
    if (!touchStart) return;

    if (isSwipeTouchStart(touchStart) && touchEnd !== null) {
      const distance = touchStart.x - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (scale === 1) {
        if (isLeftSwipe) goToNext();
        if (isRightSwipe) goToPrevious();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleDoubleTap = () => {
    if (onLike && currentPhoto) {
      setIsLiked(!isLiked);
      onLike(currentPhoto.id);
    }
  };

  const handleShare = async () => {
    if (onShare && currentPhoto) {
      onShare(currentPhoto);
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: currentPhoto.caption || "PyraRide Photo",
          text: currentPhoto.caption,
          url: currentPhoto.src,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  if (!currentPhoto) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="lightbox"
          onClick={onClose}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Buttons */}
          {photos.length > 1 && scale === 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image Container */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative flex-1 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onDoubleClick={handleDoubleTap}
          >
            <motion.div
              ref={imageRef}
              animate={{
                scale,
                x: position.x,
                y: position.y,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-full max-h-[80vh]"
              drag={scale > 1}
              dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
              onDrag={(_, info) => {
                if (scale > 1) {
                  setPosition({ x: info.offset.x, y: info.offset.y });
                }
              }}
            >
              <Image
                src={currentPhoto.src}
                alt={currentPhoto.alt || currentPhoto.caption || "Gallery photo"}
                width={1200}
                height={1200}
                className="lightbox-image"
                priority
                sizes="100vw"
              />
            </motion.div>
          </motion.div>

          {/* Bottom Info Panel */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pt-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Actions */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/20 text-white hover:bg-white/30"
                onClick={() => {
                  setIsLiked(!isLiked);
                  if (onLike) onLike(currentPhoto.id);
                }}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/20 text-white hover:bg-white/30"
                onClick={handleShare}
                aria-label="Share"
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>

            {/* Caption */}
            {currentPhoto.caption && (
              <p className="text-white text-base font-medium mb-2 line-clamp-2">
                {currentPhoto.caption}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              {currentPhoto.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentPhoto.location}</span>
                </div>
              )}
              {currentPhoto.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentPhoto.date}</span>
                </div>
              )}
              {currentPhoto.photographer && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{currentPhoto.photographer}</span>
                </div>
              )}
            </div>

            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className="mt-3 text-white/60 text-xs">
                {currentIndex + 1} of {photos.length}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

