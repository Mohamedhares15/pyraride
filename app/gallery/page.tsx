"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Home, Upload, Camera } from "lucide-react";
import { motion } from "framer-motion";
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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
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
        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden pt-16">
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6 font-display text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
            >
              The Museum of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                Moments
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg text-white/60 md:text-xl"
            >
              A curated collection of timeless memories from the Giza Plateau.
              Witness the majesty of the pyramids through the eyes of our riders.
            </motion.p>
          </div>
        </section>

        {/* Gallery — single column, full width cards */}
        <section className="mx-auto max-w-[1920px] px-4 py-16 md:px-8 md:py-24">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
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
              {/* 1 image per row, full width */}
              <div className="flex flex-col gap-8 max-w-3xl mx-auto">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
                    className="group relative overflow-hidden rounded-2xl bg-white/[0.02] shadow-2xl shadow-black/50"
                  >
                    <div className="relative w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/gallery/image/${item.id}`}
                        alt={item.caption || "Gallery photo"}
                        loading={index < 4 ? "eager" : "lazy"}
                        decoding="async"
                        className="w-full object-cover transition-all duration-700 group-hover:scale-[1.02]"
                        style={{ aspectRatio: "4/3" }}
                      />
                      {/* Caption overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="w-full transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                          <p className="text-base font-medium text-white drop-shadow-lg">
                            {item.caption || "PyraRides Experience"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Always-visible caption below image */}
                    <div className="px-6 py-4">
                      <p className="text-sm font-medium text-white/60">
                        {item.caption || "PyraRides Experience"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-12 flex justify-center">
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
        <section className="relative border-t border-white/10 bg-gradient-to-b from-white/5 to-black py-32 backdrop-blur-lg">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">Contribute to the Legacy</h2>
              <p className="mb-12 text-lg text-white/60 md:text-xl">
                Share your own perspective. Upload your photos for a chance to be featured in our curated gallery.
              </p>

              {isUploading ? (
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="flex justify-between text-sm text-white/60 mb-1">
                    <span>Uploading photo...</span>
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
                  <p className="text-3xl font-bold text-white">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <input type="file" id="gallery-upload" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <label
                    htmlFor="gallery-upload"
                    className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-white px-10 py-5 text-lg text-black font-semibold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
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
    </div>
  );
}
