"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Home, Upload, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  url: string;
  caption: string | null;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch((err) => console.error("Failed to fetch gallery:", err))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Photo uploaded successfully! It will be reviewed by our team.");
        e.target.value = ""; // Reset input
      } else {
        toast.error(result.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="text-lg font-bold tracking-widest text-white">PYRARIDE GALLERY</div>
            <div className="w-24" /> {/* Spacer for balance */}
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            {/* Use a high-quality hero image if available, otherwise a gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
          </div>

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

        {/* Gallery Grid */}
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
            <div className="columns-1 gap-6 space-y-6 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
                  className="group relative break-inside-avoid overflow-hidden rounded-2xl bg-white/[0.02] shadow-2xl shadow-black/50 transition-all duration-500 hover:bg-white/[0.04] hover:shadow-white/10"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.caption || "Gallery photo"}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                      priority={index < 6}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="w-full transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                        <p className="text-base font-medium text-white drop-shadow-lg">
                          {item.caption || "PyraRide Experience"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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

              <div className="flex justify-center">
                <input
                  type="file"
                  id="gallery-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label
                  htmlFor="gallery-upload"
                  className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-white px-10 py-5 text-lg text-black font-semibold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20 ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                  <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                </label>
              </div>
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
