"use client";

import { AnimatePresence, motion } from "framer-motion";
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

    // COPIED FROM HORSE VIEWER - Lock scroll when viewer is open
    useEffect(() => {
        if (isOpen) {
            // Lock scroll and save current position - Complete lock
            const scrollY = window.scrollY;
            const html = document.documentElement;
            const body = document.body;

            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.width = '100%';
            body.style.left = '0';
            body.style.right = '0';
            body.style.touchAction = 'none';

            html.style.overflow = 'hidden';
            html.style.position = 'fixed';
            html.style.width = '100%';
            html.style.height = '100%';

            return () => {
                // Restore scroll position and unlock scroll
                const savedScrollY = body.style.top;

                body.style.overflow = '';
                body.style.position = '';
                body.style.top = '';
                body.style.width = '';
                body.style.left = '';
                body.style.right = '';
                body.style.touchAction = '';

                html.style.overflow = '';
                html.style.position = '';
                html.style.width = '';
                html.style.height = '';

                window.scrollTo(0, parseInt(savedScrollY || '0') * -1);
            };
        }
    }, [isOpen]);


    if (!isOpen) return null;

    return (
        <>
            {/* EXACT COPY-PASTE FROM HORSE VIEWER - Layer 1: Base Blur - Creates the frosted glass foundation */}
            <div
                style={{
                    position: 'fixed',
                    top: 'calc(-1 * env(safe-area-inset-top, 0px))',
                    left: 0,
                    width: '100vw',
                    height: 'calc(100dvh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
                    zIndex: 9996,
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    overflow: 'hidden',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                }}
            />

            {/* EXACT COPY-PASTE FROM HORSE VIEWER - Layer 2: Color Tint - Warm golden overlay for desert/pyramid soul */}
            <div
                style={{
                    position: 'fixed',
                    top: 'calc(-1 * env(safe-area-inset-top, 0px))',
                    left: 0,
                    width: '100vw',
                    height: 'calc(100dvh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
                    zIndex: 9997,
                    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.08) 0%, rgba(184, 134, 11, 0.06) 50%, rgba(139, 69, 19, 0.04) 100%)',
                    overflow: 'hidden',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                }}
            />

            {/* EXACT COPY-PASTE FROM HORSE VIEWER - Layer 3: Vibrancy & Luminosity - Apple's signature glow */}
            <div
                style={{
                    position: 'fixed',
                    top: 'calc(-1 * env(safe-area-inset-top, 0px))',
                    left: 0,
                    width: '100vw',
                    height: 'calc(100dvh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
                    zIndex: 9998,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'brightness(1.15) contrast(1.05)',
                    WebkitBackdropFilter: 'brightness(1.15) contrast(1.05)',
                    mixBlendMode: 'overlay',
                    overflow: 'hidden',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                }}
            />

            {/* EXACT COPY-PASTE FROM HORSE VIEWER - Content Layer - Mobile viewport fix */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100dvh',
                    maxHeight: '100vh',
                    zIndex: 9999,
                    overflow: 'hidden',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                }}
            >
                {/* Header with Safe Area Support */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
                        paddingLeft: 'max(16px, env(safe-area-inset-left))',
                        paddingRight: 'max(16px, env(safe-area-inset-right))',
                        zIndex: 1000,
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        className="hover:bg-black/40 hover:scale-105 active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white/90 drop-shadow-md">
                            {currentIndex + 1} / {images.length}
                        </span>
                    </div>

                    <div style={{ width: '40px' }} /> {/* Spacer for balance */}
                </div>

                {/* EXACT COPY-PASTE FROM HORSE VIEWER - Main Content Area - Centered & Responsive */}
                <div
                    className="flex h-full w-full items-center justify-center p-4 md:p-8"
                    onClick={(e) => {
                        // Close if clicking outside image
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <AnimatePresence mode="wait" custom={currentIndex}>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{
                                duration: 0.2,
                                ease: "easeInOut"
                            }}
                            className="relative max-h-[85vh] max-w-[95vw] overflow-hidden rounded-2xl shadow-2xl md:max-w-5xl"
                            style={{
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={images[currentIndex]}
                                alt={`Review Image ${currentIndex + 1}`}
                                className="h-auto w-full object-contain"
                                style={{
                                    maxHeight: '80vh',
                                    maxWidth: '100%',
                                    display: 'block'
                                }}
                                draggable={false}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* EXACT COPY-PASTE FROM HORSE VIEWER - Navigation Buttons - Desktop */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(prev => {
                                    const newIndex = prev === 0 ? images.length - 1 : prev - 1;
                                    return newIndex;
                                });
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all hover:bg-black/40 hover:scale-110 active:scale-95 z-50"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(prev => {
                                    const newIndex = prev === images.length - 1 ? 0 : prev + 1;
                                    return newIndex;
                                });
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all hover:bg-black/40 hover:scale-110 active:scale-95 z-50"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}

                {/* Thumbnail Strip with Safe Area Support */}
                {images.length > 1 && (
                    <div
                        className="absolute left-1/2 -translate-x-1/2 px-4 py-3 rounded-2xl flex gap-3 overflow-x-auto max-w-[90vw] scrollbar-hide z-50"
                        style={{
                            bottom: 'max(24px, env(safe-area-inset-bottom))',
                            background: 'rgba(20, 20, 20, 0.4)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${idx === currentIndex
                                    ? "border-white scale-110 shadow-lg shadow-white/25"
                                    : "border-white/40 opacity-70 hover:opacity-100 hover:scale-105"
                                    }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
