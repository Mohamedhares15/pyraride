"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Camera, ChevronRight, Heart, Share2 } from "lucide-react";
import MasonryGrid from "@/components/mobile/MasonryGrid";
import BottomSheet from "@/components/mobile/BottomSheet";
import AudioPlayer from "@/components/mobile/AudioPlayer";
import SkeletonLoader from "@/components/mobile/SkeletonLoader";
import WeatherWidget from "@/components/shared/WeatherWidget";

interface Collection {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  photoCount: number;
  audioUrl?: string;
  audioDuration?: number;
  curatorNote?: string;
}

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
  collectionId?: string;
  tags?: string[];
  featured?: boolean;
}

const collections: Collection[] = [
  {
    id: "sunset",
    title: "Sunset Rides",
    description: "Golden hour moments at Giza",
    thumbnail: "/gallery1.jpg",
    photoCount: 24,
    audioUrl: "/audio/sunset-guide.mp3",
    audioDuration: 45,
    curatorNote: "Golden hour rides at Giza, curated from guest submissions and our staff photographers. These moments capture the magic of riding near the pyramids as the sun sets over the desert.",
  },
  {
    id: "stables",
    title: "Stables",
    description: "Behind the scenes",
    thumbnail: "/gallery2.jpg",
    photoCount: 18,
    curatorNote: "A glimpse into our partner stables, showcasing the care and dedication that goes into every horse.",
  },
  {
    id: "guides",
    title: "Guides",
    description: "Our experienced team",
    thumbnail: "/gallery3.jpg",
    photoCount: 12,
    curatorNote: "Meet the guides who make every ride safe and memorable.",
  },
  {
    id: "historic",
    title: "Historic Route",
    description: "Ancient paths to the pyramids",
    thumbnail: "/gallery4.jpeg",
    photoCount: 30,
    curatorNote: "Following the same routes used by travelers for centuries.",
  },
];

// Mock gallery photos - in production, fetch from API
const galleryPhotos: GalleryPhoto[] = [
  {
    id: "1",
    src: "/gallery1.jpg",
    alt: "Sunset ride at Giza",
    caption: "Golden hour at the pyramids",
    location: "Giza",
    date: "November 2024",
    photographer: "Ahmed Hassan",
    likes: 124,
    width: 1200,
    height: 1600,
    collectionId: "sunset",
    tags: ["sunset", "family-friendly"],
    featured: true,
  },
  {
    id: "2",
    src: "/gallery2.jpg",
    alt: "Stable scene",
    caption: "Our stables at sunrise",
    location: "Giza",
    date: "October 2024",
    photographer: "Sarah Mohamed",
    likes: 89,
    width: 1600,
    height: 1200,
    collectionId: "stables",
    tags: ["sunrise"],
  },
  {
    id: "3",
    src: "/gallery3.jpg",
    alt: "Horse and rider",
    caption: "Adventure awaits",
    location: "Saqqara",
    date: "November 2024",
    photographer: "Mohamed Ali",
    likes: 156,
    width: 1200,
    height: 1800,
    collectionId: "guides",
    tags: ["adventure"],
    featured: true,
  },
  {
    id: "4",
    src: "/gallery4.jpeg",
    alt: "Historic route",
    caption: "Following ancient paths",
    location: "Giza",
    date: "September 2024",
    photographer: "Fatima El-Mahdy",
    likes: 203,
    width: 1600,
    height: 1400,
    collectionId: "historic",
    tags: ["historic"],
    featured: true,
  },
  {
    id: "5",
    src: "/gallery5.jpeg",
    alt: "Desert landscape",
    caption: "Desert beauty",
    location: "Saqqara",
    date: "October 2024",
    photographer: "Ali Ahmed",
    likes: 67,
    width: 1400,
    height: 1200,
    collectionId: "sunset",
    tags: ["sunset"],
  },
];

export default function GalleryPage() {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<"date" | "likes" | "featured">("featured");
  const [isLoading, setIsLoading] = useState(false);
  const [photos] = useState<GalleryPhoto[]>(galleryPhotos);

  // Filter photos based on selected filter
  const filteredPhotos = [...photos].sort((a, b) => {
    if (filter === "likes") return (b.likes || 0) - (a.likes || 0);
    if (filter === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    return 0; // date sorting would require date parsing
  });

  const handleLike = (photoId: string) => {
    // In production, update via API
    console.log("Liked photo:", photoId);
  };

  const handleShare = async (photo: GalleryPhoto) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.caption || "PyraRide Photo",
          text: photo.caption,
          url: photo.src,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background hide-fab safe-area-wrapper">
      {/* Hero Section */}
      <div 
        className="relative h-[240px] overflow-hidden"
        style={{
          backgroundImage: "url(/gallery1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
        <div className="relative z-10 flex h-full items-center justify-center px-4 safe-area-wrapper">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              Gallery — Curated Moments
            </h1>
            <p className="text-sm text-white/90 drop-shadow-md">
              Immerse yourself in our collection of unforgettable rides
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 mobile-container safe-padding">
        {/* Weather Widget */}
        <div className="mb-4">
          <WeatherWidget />
        </div>

        {/* Filter Button & Collections Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Curated Collections</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="gap-2 h-10 min-h-[48px]"
            aria-label="Filter and sort photos"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Collections Carousel */}
        <div className="collection-carousel mb-6">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="collection-card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCollection(selectedCollection?.id === collection.id ? null : collection)}
            >
              <div className="relative h-32 mb-2 overflow-hidden rounded-t-2xl">
                <Image
                  src={collection.thumbnail}
                  alt={collection.title}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1">{collection.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {collection.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{collection.photoCount} photos</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Collection Detail - Curator Note */}
        {selectedCollection && selectedCollection.curatorNote && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-sand/30 to-sunset/10 border-sunset/20">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm">Curator's Note</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCollection(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedCollection.curatorNote}
            </p>
            {selectedCollection.audioUrl && (
              <div className="mt-3">
                <AudioPlayer
                  src={selectedCollection.audioUrl}
                  title="Audio Guide"
                  duration={selectedCollection.audioDuration}
                />
              </div>
            )}
          </Card>
        )}

        {/* Section Divider */}
        <div className="section-divider my-4" />

        {/* Photo Grid */}
        {isLoading ? (
          <div className="masonry-grid">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} variant="image" height={`${200 + i * 40}px`} />
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No photos found</p>
          </Card>
        ) : (
          <MasonryGrid
            photos={filteredPhotos}
            onLike={handleLike}
            onShare={handleShare}
          />
        )}

        {/* Upload CTA */}
        <Card className="mt-6 p-4 text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <h3 className="font-semibold mb-2">Share your photo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Have a great photo from your ride? Share it with our community!
          </p>
          <Button
            onClick={() => setShowUpload(true)}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Upload Photo
          </Button>
        </Card>
      </div>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter & Sort"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Sort by</label>
            <div className="space-y-2">
              {[
                { value: "featured", label: "Featured" },
                { value: "likes", label: "Most Liked" },
                { value: "date", label: "Newest First" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value as typeof filter);
                    setShowFilters(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition-all ${
                    filter === option.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Upload Bottom Sheet */}
      <BottomSheet
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Share Your Photo"
      >
        <UploadForm onClose={() => setShowUpload(false)} />
      </BottomSheet>
    </div>
  );
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side compression
    const maxDimension = 1920;
    const quality = 0.85;

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: "image/jpeg" });
              setSelectedFile(compressedFile);
              setPreview(URL.createObjectURL(compressedFile));
            }
          },
          "image/jpeg",
          quality
        );
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("caption", caption);
    formData.append("tags", JSON.stringify(tags));

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error("Upload failed"));
          }
        });
        xhr.addEventListener("error", reject);
        xhr.open("POST", "/api/gallery/upload");
        xhr.send(formData);
      });

      alert("Photo uploaded! It's under review and will appear in the gallery once approved.");
      onClose();
      setSelectedFile(null);
      setPreview(null);
      setCaption("");
      setTags([]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const availableTags = ["sunset", "sunrise", "family-friendly", "adventure", "historic"];

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-primary transition-colors"
        >
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={200}
              className="h-full w-full object-cover rounded-2xl"
            />
          ) : (
            <div className="text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Tap to select</p>
            </div>
          )}
        </label>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium mb-2">Caption (optional)</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption..."
          className="w-full p-3 border border-gray-300 rounded-2xl min-h-[100px] resize-none"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1">{caption.length}/200</p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">Tags (optional)</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                );
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                tags.includes(tag)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? "Uploading..." : "Upload Photo"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Photos will be reviewed before publication
      </p>
    </div>
  );
}
