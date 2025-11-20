"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Image as ImageIcon,
  ArrowLeft,
  Trash2,
  Edit2,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { X } from "lucide-react";

interface Horse {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  isActive: boolean;
}

export default function ManageHorsesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerHour: "",
    age: "",
    skills: [] as string[],
    imageUrls: [] as string[],
    googleDriveUrls: "", // Temporary field for pasting multiple URLs
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "stable_owner") {
      router.push("/dashboard");
      return;
    }
    fetchHorses();
  }, [session, status, router]);

  async function fetchHorses() {
    try {
      // First get stable ID
      const stableRes = await fetch("/api/stables");
      const stableData = await stableRes.json();
      
      if (stableData.stables && stableData.stables.length > 0) {
        const stableId = stableData.stables[0].id;
        const horsesRes = await fetch(`/api/horses?stableId=${stableId}`);
        const horsesData = await horsesRes.json();
        setHorses(horsesData.horses || []);
      }
    } catch (err) {
      console.error("Error fetching horses:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageUpload(file: File): Promise<string> {
    // For now, use a placeholder URL
    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In production, this would be the URL from your storage service
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get stable ID
      const stableRes = await fetch("/api/stables");
      const stableData = await stableRes.json();
      
      if (!stableData.stables || stableData.stables.length === 0) {
        alert("Please create a stable first");
        return;
      }

      const stableId = stableData.stables[0].id;
      let imageUrls = [...formData.imageUrls];

      // Process Google Drive URLs if provided
      if (formData.googleDriveUrls.trim()) {
        const urls = formData.googleDriveUrls
          .split("\n")
          .map(url => url.trim())
          .filter(url => url.length > 0)
          .map(url => {
            // Convert Google Drive share links to direct image URLs
            const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (driveMatch) {
              return `https://drive.google.com/uc?id=${driveMatch[1]}`;
            }
            // If already in correct format, use as-is
            if (url.startsWith("http") || url.startsWith("/")) {
              return url;
            }
            return null;
          })
          .filter((url): url is string => url !== null);
        
        imageUrls = [...imageUrls, ...urls];
      }

      // Upload image file if provided
      if (imageFile) {
        const imageUrl = await handleImageUpload(imageFile);
        imageUrls = [imageUrl, ...imageUrls];
      }

      // Validate at least one image
      if (imageUrls.length === 0) {
        alert("Please add at least one image (upload file or paste Google Drive URLs)");
        return;
      }

      const response = await fetch("/api/horses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stableId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
          age: formData.age ? parseInt(formData.age) : null,
          skills: formData.skills,
          imageUrls,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create horse");
      }

      // Reset form
      setFormData({ 
        name: "", 
        description: "", 
        pricePerHour: "",
        age: "",
        skills: [],
        imageUrls: [],
        googleDriveUrls: "",
      });
      setImageFile(null);
      setImagePreview("");
      setIsDialogOpen(false);
      
      // Refresh horses list
      await fetchHorses();
      
      alert("✅ Horse added successfully!");
    } catch (err) {
      console.error("Error creating horse:", err);
      alert(err instanceof Error ? err.message : "Failed to create horse");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Link href="/dashboard/stable">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
                Manage Horses
              </h1>
              <p className="text-muted-foreground">
                Add and manage horses for your stable
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Horse
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {horses.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mb-4 text-6xl">🐴</div>
            <h2 className="mb-2 font-display text-2xl font-bold">
              No Horses Yet
            </h2>
            <p className="mb-6 max-w-md mx-auto text-muted-foreground">
              Add your first horse to start receiving bookings!
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Horse
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {horses.map((horse, index) => (
              <motion.div
                key={horse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative h-48 w-full bg-gradient-to-br from-primary/20 to-secondary/20">
                    {horse.imageUrls && horse.imageUrls.length > 0 ? (
                      <Image
                        src={horse.imageUrls[0]}
                        alt={horse.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 font-semibold text-xl">{horse.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {horse.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Horse Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Horse</DialogTitle>
            <DialogDescription>
              Fill in all the details below. At least one image is required (use Google Drive URLs for easiest upload).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            {/* Horse Name */}
            <div>
              <Label htmlFor="name">Horse Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Desert Wind"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
                placeholder="Describe the horse's temperament, experience, and special features..."
              />
            </div>

            {/* Price & Age Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerHour">Price Per Hour (EGP)</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  min="0"
                  step="50"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <Label htmlFor="age">Age (Years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g., 8"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills.join(", ")}
                onChange={(e) => {
                  const skills = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
                  setFormData({ ...formData, skills });
                }}
                placeholder="e.g., Beginner-friendly, Calm, Well-trained"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Separate multiple skills with commas
              </p>
            </div>

            {/* Google Drive URLs */}
            <div>
              <Label htmlFor="googleDriveUrls">
                Google Drive Image URLs * (Easiest Method)
              </Label>
              <Textarea
                id="googleDriveUrls"
                value={formData.googleDriveUrls}
                onChange={(e) =>
                  setFormData({ ...formData, googleDriveUrls: e.target.value })
                }
                rows={4}
                placeholder="Paste Google Drive links here (one per line):&#10;https://drive.google.com/file/d/FILE_ID/view&#10;https://drive.google.com/file/d/FILE_ID/view"
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                💡 Right-click image in Google Drive → "Get link" → Paste here (one link per line)
              </p>
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="image">Upload Photo File</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 p-6 hover:border-primary/50"
                >
                  {imagePreview ? (
                    <div className="relative h-32 w-full">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload photo
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Max 5MB, JPG/PNG
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Horse"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

