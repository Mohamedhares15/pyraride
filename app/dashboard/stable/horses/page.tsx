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
  Check,
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
import { convertGoogleDriveUrls } from "@/lib/google-drive-utils";

interface Horse {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  isActive: boolean;
  pricePerHour?: number | null;
  age?: number | null;
  skills?: string[];
  availabilityStatus?: "available" | "injured" | "unavailable";
}

export default function ManageHorsesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [successHorseName, setSuccessHorseName] = useState("");
  const [deletedHorseName, setDeletedHorseName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerHour: "",
    age: "",
    skills: [] as string[],
    imageUrls: [] as string[],
    googleDriveUrls: "", // Temporary field for pasting multiple URLs
    availabilityStatus: "available" as "available" | "injured" | "unavailable",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
      // Get owner's stable
      const stableRes = await fetch("/api/stables?ownerOnly=true");
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
      // Get owner's stable
      const stableRes = await fetch("/api/stables?ownerOnly=true");
      const stableData = await stableRes.json();
      
      if (!stableData.stables || stableData.stables.length === 0) {
        alert("Please create a stable first");
        setIsSubmitting(false);
        return;
      }

      const stableId = stableData.stables[0].id;
      let imageUrls = [...formData.imageUrls];

      // Process Google Drive URLs if provided
      if (formData.googleDriveUrls.trim()) {
        const urls = convertGoogleDriveUrls(formData.googleDriveUrls);
        imageUrls = [...imageUrls, ...urls];
      }

      // Upload image file if provided
      if (imageFile) {
        const imageUrl = await handleImageUpload(imageFile);
        imageUrls = [imageUrl, ...imageUrls];
      }

      // Validate at least one image
      if (imageUrls.length === 0) {
        alert("⚠️ At least one image is required. Please either:\n• Upload a photo file, OR\n• Paste Google Drive image links");
        setIsSubmitting(false);
        return;
      }

      // Validate name length
      if (formData.name.trim().length < 2) {
        alert("⚠️ Horse name must be at least 2 characters long");
        setIsSubmitting(false);
        return;
      }

      // Validate description length
      if (formData.description.trim().length < 10) {
        alert("⚠️ Description must be at least 10 characters long");
        setIsSubmitting(false);
        return;
      }

      // Validate price if provided
      if (formData.pricePerHour && parseFloat(formData.pricePerHour) < 0) {
        alert("⚠️ Price cannot be negative");
        setIsSubmitting(false);
        return;
      }

      // Validate age if provided
      if (formData.age && (parseInt(formData.age) < 1 || parseInt(formData.age) > 30)) {
        alert("⚠️ Age must be between 1 and 30 years");
        setIsSubmitting(false);
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
          availabilityStatus: formData.availabilityStatus,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create horse");
      }

      // Store horse name for success message
      const horseName = formData.name.trim();
      
      // Reset form
      setFormData({ 
        name: "", 
        description: "", 
        pricePerHour: "",
        age: "",
        skills: [],
        imageUrls: [],
        googleDriveUrls: "",
        availabilityStatus: "available",
      });
      setImageFile(null);
      setImagePreview("");
      setIsDialogOpen(false);
      
      // Refresh horses list
      await fetchHorses();
      
      // Show success notification
      setSuccessHorseName(horseName);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error("Error creating horse:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      alert(`❌ Failed to add horse\n\n${errorMessage}\n\nPlease check your information and try again.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteHorse(horse: Horse) {
    if (!confirm(`Are you sure you want to delete ${horse.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/horses/${horse.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        await fetchHorses();
        setDeletedHorseName(horse.name);
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 5000);
      } else {
        const error = await res.json();
        alert(`❌ Failed to delete horse\n\n${error.error || "Please try again."}`);
      }
    } catch (err) {
      console.error("Error deleting horse:", err);
      alert("❌ An error occurred while deleting the horse. Please try again.");
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingHorse) return;
    
    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];

      // Convert Google Drive URLs
      if (formData.googleDriveUrls) {
        const convertedUrls = convertGoogleDriveUrls(formData.googleDriveUrls);
        imageUrls = [...convertedUrls];
      }

      // Upload image file if provided
      if (imageFile) {
        const imageUrl = await handleImageUpload(imageFile);
        imageUrls = [imageUrl, ...imageUrls];
      }

      // If no new images, keep existing ones
      if (imageUrls.length === 0) {
        imageUrls = editingHorse.imageUrls;
      }

      // Validate at least one image
      if (imageUrls.length === 0) {
        alert("⚠️ At least one image is required.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/horses/${editingHorse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
          age: formData.age ? parseInt(formData.age) : null,
          skills: formData.skills,
          imageUrls,
          availabilityStatus: formData.availabilityStatus,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to update horse");
      }

      // Store horse name for success message
      const horseName = formData.name.trim();
      
      // Reset form
      setFormData({ 
        name: "", 
        description: "", 
        pricePerHour: "",
        age: "",
        skills: [],
        imageUrls: [],
        googleDriveUrls: "",
        availabilityStatus: "available",
      });
      setImageFile(null);
      setImagePreview("");
      setIsEditDialogOpen(false);
      setEditingHorse(null);
      
      // Refresh horses list
      await fetchHorses();
      
      // Show success notification
      setSuccessHorseName(horseName);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error("Error updating horse:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      alert(`❌ Failed to update horse\n\n${errorMessage}\n\nPlease check your information and try again.`);
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

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[9999] max-w-md w-full shadow-2xl rounded-lg border-2 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-5">
          <div className="flex-shrink-0">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">
              {isEditDialogOpen ? "Horse Updated Successfully! 🐴" : "Horse Added Successfully! 🐴"}
            </h4>
            <p className="text-sm text-muted-foreground">
              &quot;{successHorseName}&quot; has been {isEditDialogOpen ? "updated" : "added to your stable and is now available for booking"}.
            </p>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Delete Success Notification */}
      {showDeleteSuccess && (
        <div className="fixed top-4 right-4 z-[9999] max-w-md w-full shadow-2xl rounded-lg border-2 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-5">
          <div className="flex-shrink-0">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">Horse Deleted Successfully</h4>
            <p className="text-sm text-muted-foreground">
              &quot;{deletedHorseName}&quot; has been permanently removed from your stable.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteSuccess(false)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={horse.imageUrls[0]}
                        alt={horse.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          console.error("❌ Failed to load image:", horse.imageUrls[0]);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        onLoad={() => console.log("✅ Image loaded successfully:", horse.imageUrls[0])}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {/* Availability Badge */}
                    {horse.availabilityStatus && horse.availabilityStatus !== "available" && (
                      <div className="absolute top-2 left-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm border border-red-400/50 shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                          <span className="text-xs font-semibold text-white uppercase tracking-wide">
                            {horse.availabilityStatus === "injured" ? "Injured" : "Unavailable"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl">{horse.name}</h3>
                        {horse.availabilityStatus && horse.availabilityStatus !== "available" && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
                            Not available for booking
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingHorse(horse);
                            setFormData({
                              name: horse.name,
                              description: horse.description,
                              pricePerHour: horse.pricePerHour?.toString() || "",
                              age: horse.age?.toString() || "",
                              skills: horse.skills || [],
                              imageUrls: [],
                              googleDriveUrls: horse.imageUrls.join("\n"),
                              availabilityStatus: horse.availabilityStatus || "available",
                            });
                            setImagePreviews(horse.imageUrls);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteHorse(horse)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
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
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          // Confirm if user has entered data
          const hasData = formData.name || formData.description || formData.googleDriveUrls || imagePreview;
          if (hasData) {
            const confirmed = window.confirm("Are you sure you want to close? All entered data will be lost.");
            if (!confirmed) return;
          }
          setFormData({ 
            name: "", 
            description: "", 
            pricePerHour: "",
            age: "",
            skills: [],
            imageUrls: [],
            googleDriveUrls: "",
            availabilityStatus: "available",
          });
          setImageFile(null);
          setImagePreview("");
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl">Add New Horse</DialogTitle>
            <DialogDescription>
              Fill in the details below. At least one image is required (Google Drive URLs recommended for easiest upload).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="space-y-6 overflow-y-auto px-6 py-4">
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
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional - hourly rate for booking
                </p>
              </div>
              <div>
                <Label htmlFor="age">Age (Years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g., 8"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional - age in years
                </p>
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

            {/* Availability Status */}
            <div>
              <Label htmlFor="availabilityStatus">Availability Status *</Label>
              <select
                id="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as "available" | "injured" | "unavailable" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="available">Available for Riding</option>
                <option value="injured">Injured - Not Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Set to "Injured" or "Unavailable" if the horse cannot be booked
              </p>
            </div>

            {/* Google Drive URLs */}
            <div>
              <Label htmlFor="googleDriveUrls">
                Google Drive Image URLs * (Recommended - Easiest Method)
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
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>How to get links:</strong> Right-click image in Google Drive → "Get link" → Set to "Anyone with the link" → Copy and paste here
                </p>
                {formData.googleDriveUrls.trim() && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ {formData.googleDriveUrls.split('\n').filter(line => line.trim()).length} image(s) will be uploaded
                  </p>
                )}
              </div>
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
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Confirm if user has entered data
                  const hasData = formData.name || formData.description || formData.googleDriveUrls || imagePreview;
                  if (hasData) {
                    const confirmed = window.confirm("Are you sure you want to cancel? All entered data will be lost.");
                    if (!confirmed) return;
                  }
                  setFormData({ 
                    name: "", 
                    description: "", 
                    pricePerHour: "",
                    age: "",
                    skills: [],
                    imageUrls: [],
                    googleDriveUrls: "",
                    availabilityStatus: "available",
                  });
                  setImageFile(null);
                  setImagePreview("");
                  setIsDialogOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Horse...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Horse
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Horse Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          setFormData({ 
            name: "", 
            description: "", 
            pricePerHour: "",
            age: "",
            skills: [],
            imageUrls: [],
            googleDriveUrls: "",
            availabilityStatus: "available",
          });
          setImageFile(null);
          setImagePreview("");
          setEditingHorse(null);
        }
        setIsEditDialogOpen(open);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl">Edit Horse</DialogTitle>
            <DialogDescription>
              Update the details below. At least one image is required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="space-y-6 overflow-y-auto px-6 py-4">
            {/* Horse Name */}
            <div>
              <Label htmlFor="edit-name">Horse Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Desert Wind"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
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
                <Label htmlFor="edit-pricePerHour">Price Per Hour (EGP)</Label>
                <Input
                  id="edit-pricePerHour"
                  type="number"
                  min="0"
                  step="50"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <Label htmlFor="edit-age">Age (Years)</Label>
                <Input
                  id="edit-age"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g., 8"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <Label htmlFor="edit-skills">Skills (comma-separated)</Label>
              <Input
                id="edit-skills"
                value={Array.isArray(formData.skills) ? formData.skills.join(", ") : ""}
                onChange={(e) => {
                  const skills = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
                  setFormData({ ...formData, skills });
                }}
                placeholder="e.g., Beginner-friendly, Calm, Well-trained"
              />
            </div>

            {/* Availability Status */}
            <div>
              <Label htmlFor="edit-availabilityStatus">Availability Status *</Label>
              <select
                id="edit-availabilityStatus"
                value={formData.availabilityStatus}
                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as "available" | "injured" | "unavailable" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="available">Available for Riding</option>
                <option value="injured">Injured - Not Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Set to "Injured" or "Unavailable" if the horse cannot be booked
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div>
                <Label>Current Images</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imagePreviews.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Drive URLs */}
            <div>
              <Label htmlFor="edit-googleDriveUrls">
                Update Images (Google Drive URLs)
              </Label>
              <Textarea
                id="edit-googleDriveUrls"
                value={formData.googleDriveUrls}
                onChange={(e) =>
                  setFormData({ ...formData, googleDriveUrls: e.target.value })
                }
                rows={4}
                placeholder="Paste new Google Drive links here (one per line)"
                className="font-mono text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                💡 Leave empty to keep existing images, or paste new links to replace them
              </p>
            </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({ 
                    name: "", 
                    description: "", 
                    pricePerHour: "",
                    age: "",
                    skills: [],
                    imageUrls: [],
                    googleDriveUrls: "",
                    availabilityStatus: "available",
                  });
                  setImageFile(null);
                  setImagePreview("");
                  setEditingHorse(null);
                  setIsEditDialogOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update Horse
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

