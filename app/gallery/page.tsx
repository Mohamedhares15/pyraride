"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Home, Upload, Camera, Download, X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  url: string;
  caption: string | null;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadETA, setUploadETA] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadStartRef = useRef<number>(0);

  // Lightbox state
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const fetchItems = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const res = await fetch(`/api/gallery?page=${pageNum}&limit=12`);
      const data = await res.json();
      if (data.items) {
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
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
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage, true);
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
        const rate = event.loaded / elapsed; // bytes/sec
        const remaining = (event.total - event.loaded) / rate;
        setUploadETA(remaining < 60
          ? `~${Math.ceil(remaining)}s left`
          : `~${Math.ceil(remaining / 60)}m left`
        );
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
        try {
          const result = JSON.parse(xhr.responseText);
          toast.error(result.error || "Upload failed. Please try again.");
        } catch {
          toast.error("Upload failed. Please try again.");
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("Upload failed. Please check your connection.");
    };

    xhr.open("POST", "/api/gallery/upload");
    xhr.send(formData);
  }

  function downloadPhoto(item: GalleryItem) {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.caption || `pyrarides-photo-${item.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="text-lg font-bold tracking-widest text-white">PYRARIDES GALLERY</div>
            <div className="w-24" />
          </div>
        </header>

        {/* Hero */}
        <section className="relative flex min-h-[40vh] items-center justify-center pt-16">
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6 font-display text-5xl font-bold tracking-tight text-white md:text-7xl"
            >
              The Museum of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                Moments
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg text-white/60"
            >
              A curated collection of timeless memories from the Giza Plateau.
            </motion.p>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-white/20" />
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <Camera className="mb-6 h-16 w-16 text-white/10" />
              <h3 className="mb-2 text-2xl font-medium text-white">No photos yet</h3>
              <p className="text-lg text-white/40">Be the first to contribute to our collection.</p>
            </motion.div>
          ) : (
            <>
              {/* 2-column grid on mobile, 3 on md, 4 on lg */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2) }}
                    className="group relative overflow-hidden rounded-2xl bg-white/[0.03] cursor-pointer"
                    onClick={() => setLightboxItem(item)}
                  >
                    <div className="relative aspect-square w-full overflow-hidden">
                      {/* Use regular img for base64 data URLs (next/image doesn't support them well) */}
                      {item.url.startsWith("data:") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.caption || "Gallery photo"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 loading-lazy"
                          loading={index < 4 ? "eager" : "lazy"}
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.caption || "Gallery photo"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          priority={index < 4}
                        />
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                          <ZoomIn className="h-5 w-5 text-white" />
                        </div>
                        <div
                          className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); downloadPhoto(item); }}
                        >
                          <Download className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                    {item.caption && (
                      <div className="p-2 text-xs text-white/50 truncate">{item.caption}</div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-10 py-5 rounded-full"
                  >
                    {isLoadingMore ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
                    ) : (
                      "Load More Photos"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Upload Section */}
        <section className="relative border-t border-white/10 bg-gradient-to-b from-white/5 to-black py-24 backdrop-blur-lg">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">Contribute to the Legacy</h2>
              <p className="mb-10 text-lg text-white/60">
                Share your perspective. Upload your photos for a chance to be featured.
              </p>

              {isUploading ? (
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="flex justify-between text-sm text-white/70 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadETA || "Calculating..."}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: "easeOut", duration: 0.3 }}
                    />
                  </div>
                  <p className="text-2xl font-bold text-white">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <input
                    type="file"
                    id="gallery-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="group flex cursor-pointer items-center gap-3 rounded-full bg-white px-10 py-5 text-lg text-black font-semibold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                  >
                    <Upload className="h-6 w-6" />
                    <span>Upload Photo</span>
                  </label>
                </div>
              )}

              <p className="mt-6 text-sm text-white/40">
                Max 5MB. Photos are reviewed before publication.
              </p>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxItem(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              onClick={() => setLightboxItem(null)}
            >
              <X className="h-6 w-6" />
            </button>

            <button
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium z-10"
              onClick={(e) => { e.stopPropagation(); downloadPhoto(lightboxItem); }}
            >
              <Download className="h-4 w-4" />
              Download
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[85vh] max-w-[85vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxItem.url.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.caption || "Gallery photo"}
                  className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <Image
                  src={lightboxItem.url}
                  alt={lightboxItem.caption || "Gallery photo"}
                  width={1200}
                  height={900}
                  className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
                />
              )}
              {lightboxItem.caption && (
                <p className="mt-3 text-center text-sm text-white/60">{lightboxItem.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
