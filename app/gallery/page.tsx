"use client";

import { useState } from "react";
import WeatherWidget from "@/components/shared/WeatherWidget";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GalleryPage() {
  const [isUploading, setIsUploading] = useState(false);

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
        alert("Photo uploaded successfully! It will be reviewed before being published.");
        e.target.value = ""; // Reset input
      } else {
        alert(result.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero with Coming Soon */}
      <div 
        className="relative h-[400px] overflow-hidden"
        style={{
          backgroundImage: "url(/hero-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-display text-2xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
              Gallery Coming Soon
            </h1>
            <p className="mt-4 text-sm md:text-xl text-white/90 drop-shadow-md">
              Beautiful moments from our stables will be available soon
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-16 md:px-8">
        {/* Weather Widget */}
        <div className="mb-6 md:mb-8">
          <WeatherWidget />
        </div>

        {/* Coming Soon Message */}
        <Card className="p-6 md:p-12 text-center">
          <h2 className="mb-4 text-2xl md:text-3xl font-bold">Photo Gallery</h2>
          <p className="text-sm md:text-lg text-muted-foreground mb-6 md:mb-8">
            Our gallery is being curated with beautiful photos from our horse riding experiences at the pyramids.
            Check back soon!
          </p>
          
          {/* Photo Upload Option */}
          <div className="mt-6 md:mt-8 rounded-lg border-2 border-dashed border-primary/30 p-4 md:p-8">
            <h3 className="mb-3 md:mb-4 text-lg md:text-xl font-semibold">Have a great photo to share?</h3>
            <p className="mb-3 md:mb-4 text-sm md:text-base text-muted-foreground">
              Upload your horse riding photos for review and they may appear in our gallery!
            </p>
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
              className={`inline-flex items-center gap-2 cursor-pointer rounded-full bg-primary px-6 md:px-8 py-2 md:py-3 text-sm md:text-base text-white hover:bg-primary/90 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Photo"
              )}
            </label>
            <p className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground">
              Photos will be reviewed by our team before publication
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
