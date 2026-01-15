"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ImageViewerProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageViewer({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
}: ImageViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowLeft":
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                    break;
                case "ArrowRight":
                    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, images.length, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Dark Glassmorphism Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

                    {/* Close Button */}
                    <motion.button
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ delay: 0.1 }}
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black/60 hover:shadow-white/10"
                    >
                        <X className="h-6 w-6" />
                    </motion.button>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <motion.button
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ delay: 0.2 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrevious();
                                }}
                                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black/60"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </motion.button>

                            <motion.button
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                transition={{ delay: 0.2 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNext();
                                }}
                                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black/60"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </motion.button>
                        </>
                    )}

                    {/* Image Container */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md shadow-2xl"
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                src={images[currentIndex]}
                                alt={`Image ${currentIndex + 1} of ${images.length}`}
                                className="max-h-[90vh] max-w-full object-contain"
                            />
                        </AnimatePresence>

                        {/* Image Counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-4 py-2 text-sm font-medium text-white shadow-xl">
                                {currentIndex + 1} / {images.length}
                            </div>
                        )}
                    </motion.div>

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ delay: 0.3 }}
                            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md p-2 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all duration-300 ${idx === currentIndex
                                            ? "border-white scale-110 shadow-xl"
                                            : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/60"
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
