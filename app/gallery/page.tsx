"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Home, Upload, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  caption: string | null;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Upload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadETA, setUploadETA] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadStartRef = useRef<number>(0);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchItems = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/gallery?page=${pageNum}&limit=20`);
      const data = await res.json();
      if (data.items) {
        setItems((prev) => append ? [...prev, ...data.items] : data.items);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(1, false);
  }, [fetchItems]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchItems(next, true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadETA(null);
    uploadStartRef.current = Date.now();

    const formData = new FormData();
    formData.append("file", file);
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(pct);
        const elapsed = (Date.now() - uploadStartRef.current) / 1000;
        const rate = event.loaded / elapsed;
        const remaining = (event.total - event.loaded) / rate;
        setUploadETA(remaining < 60 ? `~${Math.ceil(remaining)}s left` : `~${Math.ceil(remaining / 60)}m left`);
      }
    });

    xhr.onload = () => {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadETA(null);
      e.target.value = "";
      if (xhr.status === 200) {
        toast.success("Photo uploaded! It will appear after review.");
      } else {
        try { toast.error(JSON.parse(xhr.responseText).error || "Upload failed."); }
        catch { toast.error("Upload failed. Please try again."); }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("Upload failed. Check your connection.");
    };

    xhr.open("POST", "/api/gallery/upload");
    xhr.send(formData);
  }

  // Keyboard nav for lightbox
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex(i => i !== null ? Math.min(i + 1, items.length - 1) : null);
      if (e.key === "ArrowLeft") setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, items.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#1a1a1a,_#000)]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <div className="text-base font-bold tracking-widest text-white">PYRARIDES GALLERY</div>
            <div className="w-16" />
          </div>
        </header>

        {/* Hero */}
        <section className="flex min-h-[38vh] items-end justify-center pt-16 pb-12">
          <div className="text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-3 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              The Museum of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                Moments
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/50 text-base md:text-lg max-w-xl mx-auto"
            >
              Timeless memories from the Giza Plateau, curated by our riders.
            </motion.p>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="mx-auto max-w-7xl px-3 py-8 md:px-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-white/30" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Camera className="mb-4 h-14 w-14 text-white/10" />
              <h3 className="text-xl font-medium text-white">No photos yet</h3>
              <p className="mt-2 text-white/40">Be the first to contribute.</p>
            </div>
          ) : (
            <>
              {/* 2 cols mobile → 3 cols tablet → 4 cols desktop, square cells */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.15) }}
                    className="group relative aspect-square w-full overflow-hidden rounded-xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
                    onClick={() => setLightboxIndex(index)}
                  >
                    {/* 
                      Use a regular <img> pointing to our API route.
                      The browser fetches each image independently and caches it.
                      loading="eager" for first 8, lazy for the rest.
                    */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/gallery/image/${item.id}`}
                      alt={item.caption || "Gallery photo"}
                      loading={index < 8 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-10 py-5 rounded-full"
                  >
                    {isLoadingMore
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
                      : "Load More Photos"
                    }
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Upload Section */}
        <section className="border-t border-white/10 bg-gradient-to-b from-white/5 to-black py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="mb-3 text-2xl font-bold text-white md:text-4xl">Contribute to the Legacy</h2>
            <p className="mb-10 text-white/50">Share your perspective. Photos are reviewed before publication.</p>

            {isUploading ? (
              <div className="max-w-xs mx-auto space-y-3">
                <div className="flex justify-between text-sm text-white/60 mb-1">
                  <span>Uploading photo...</span>
                  <span>{uploadETA || "Calculating..."}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: "easeOut", duration: 0.3 }}
                  />
                </div>
                <p className="text-3xl font-bold text-white">{uploadProgress}%</p>
              </div>
            ) : (
              <>
                <input type="file" id="gallery-upload" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <label
                  htmlFor="gallery-upload"
                  className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-white px-10 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                >
                  <Upload className="h-5 w-5" />
                  Upload Photo
                </label>
                <p className="mt-4 text-xs text-white/30">Max 5MB · JPEG, PNG, WebP</p>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && items[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                className="absolute left-3 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i !== null ? i - 1 : i); }}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}

            {/* Next */}
            {lightboxIndex < items.length - 1 && (
              <button
                className="absolute right-3 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i !== null ? i + 1 : i); }}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[88vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/gallery/image/${items[lightboxIndex].id}`}
                alt={items[lightboxIndex].caption || "Gallery photo"}
                className="max-h-[88vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />
              {items[lightboxIndex].caption && (
                <p className="mt-3 text-center text-sm text-white/50">{items[lightboxIndex].caption}</p>
              )}
              <p className="mt-1 text-center text-xs text-white/25">{lightboxIndex + 1} / {items.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
