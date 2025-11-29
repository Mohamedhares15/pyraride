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
        <section className="mx-auto max-w-[1920px] px-4 py-12 md:px-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/20" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Camera className="mb-4 h-12 w-12 text-white/20" />
              <h3 className="text-xl font-medium text-white">No photos yet</h3>
              <p className="text-white/40">Be the first to contribute to our collection.</p>
            </div>
          ) : (
            <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4 xl:gap-8 xl:space-y-8">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative break-inside-avoid overflow-hidden rounded-xl bg-white/5"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.caption || "Gallery photo"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="text-sm font-medium text-white">{item.caption || "PyraRide Experience"}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Upload Section */}
        <section className="relative border-t border-white/10 bg-white/5 py-24 backdrop-blur-lg">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Contribute to the Legacy</h2>
            <p className="mb-8 text-white/60">
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
                className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-black transition-transform hover:scale-105 ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
                <span className="font-bold">{isUploading ? "Uploading..." : "Upload Photo"}</span>
              </label>
            </div>
            <p className="mt-4 text-xs text-white/40">
              Max 5MB. Photos are reviewed before publication.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black py-8 text-center text-sm text-white/40">
          <p>© {new Date().getFullYear()} PyraRide. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
