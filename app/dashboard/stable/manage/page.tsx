"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, X, Loader2, Check } from "lucide-react";
import { convertGoogleDriveUrl } from "@/lib/google-drive-utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Stable {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  imageUrl: string | null;
  status: string;
}

export default function ManageStablePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stable, setStable] = useState<Stable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "stable_owner") {
      router.push("/dashboard");
      return;
    }
    fetchStable();
  }, [session, status, router]);

  async function fetchStable() {
    try {
      const res = await fetch("/api/stables?ownerOnly=true");
      const data = await res.json();
      
      if (data.stables && data.stables.length > 0) {
        const stableData = data.stables[0];
        setStable(stableData);
        setFormData({
          name: stableData.name,
          description: stableData.description,
          location: stableData.location,
          address: stableData.address,
        });
        if (stableData.imageUrl) {
          setImagePreview(stableData.imageUrl);
        }
      }
    } catch (err) {
      console.error("Error fetching stable:", err);
    } finally {
      setIsLoading(false);
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
    setGoogleDriveUrl("");
  }

  function handleGoogleDriveUrl() {
    if (!googleDriveUrl.trim()) {
      alert("Please paste a Google Drive URL first");
      return;
    }

    // Convert Google Drive share link to direct URL
    const directUrl = convertGoogleDriveUrl(googleDriveUrl);
    console.log("Google Drive URL:", googleDriveUrl);
    console.log("Converted URL:", directUrl);
    
    if (directUrl) {
      setImagePreview(directUrl);
      setImageFile(null);
      // Show success feedback
      const urlInput = document.getElementById("googleDriveUrl") as HTMLInputElement;
      if (urlInput) {
        urlInput.style.borderColor = "green";
        setTimeout(() => {
          urlInput.style.borderColor = "";
        }, 2000);
      }
    } else {
      alert("❌ Invalid Google Drive URL.\n\nPlease make sure you:\n1. Right-click the image in Google Drive\n2. Click 'Get link'\n3. Set to 'Anyone with the link'\n4. Copy and paste the full URL here");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!stable) return;

      // Prepare image URL
      let imageUrl = stable.imageUrl;
      
      if (googleDriveUrl.trim()) {
        const converted = convertGoogleDriveUrl(googleDriveUrl);
        if (converted) {
          imageUrl = converted;
        }
      } else if (imageFile) {
        // In production, you'd upload to cloud storage here
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => {
            imageUrl = reader.result as string;
            resolve(null);
          };
          reader.readAsDataURL(imageFile);
        });
      }

      const response = await fetch(`/api/stables/${stable.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update stable");
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchStable();
    } catch (err) {
      console.error("Error updating stable:", err);
      alert("❌ Failed to update stable information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!stable) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="mx-auto max-w-lg p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">No Stable Found</h2>
          <p className="mb-6 text-muted-foreground">
            Please create a stable first to access this page.
          </p>
          <Button onClick={() => router.push("/dashboard/stable")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <Link href="/dashboard/stable">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
                Manage Stable
              </h1>
              <p className="text-muted-foreground">
                Update your stable details and card image
              </p>
            </div>
            <Link href="/dashboard/stable/horses">
              <Button variant="outline">
                Manage Horses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mx-auto max-w-4xl px-4 pt-8 md:px-8">
          <div className="flex items-center gap-3 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950/30 p-4">
            <Check className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">
                Success!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your stable information has been updated successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Stable Card Image */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Stable Card Image</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This image will be displayed on your stable card in the browse page
            </p>

            {/* Current Image Preview */}
            {imagePreview && (
              <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg">
                <Image
                  src={imagePreview}
                  alt="Stable preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => {
                    setImagePreview("");
                    setImageFile(null);
                    setGoogleDriveUrl("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Google Drive URL */}
            <div className="mb-4">
              <Label htmlFor="googleDriveUrl">Google Drive Image URL (Recommended)</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="googleDriveUrl"
                  value={googleDriveUrl}
                  onChange={(e) => setGoogleDriveUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleGoogleDriveUrl();
                    }
                  }}
                  placeholder="https://drive.google.com/file/d/FILE_ID/view"
                  className="font-mono text-sm"
                />
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoogleDriveUrl();
                  }} 
                  variant="outline"
                  disabled={!googleDriveUrl.trim()}
                >
                  Apply
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                💡 Right-click image in Google Drive → "Get link" → Set to "Anyone with the link" → Paste and click Apply
              </p>
            </div>

            {/* OR Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label>Upload Photo File</Label>
              <input
                type="file"
                id="stableImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="stableImage"
                className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 p-8 hover:border-primary/50"
              >
                <Upload className="mb-2 h-8 w-8 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Click to upload photo
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Max 5MB, JPG/PNG
                </span>
              </label>
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Stable Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g., Giza, Saqqara"
                />
              </div>

              <div>
                <Label htmlFor="address">Address / Google Maps Link *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Full address or Google Maps link"
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/stable")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
