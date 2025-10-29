"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Users, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface Stable {
  id: string;
  name: string;
  description: string | null;
  location: string;
  address: string | null;
  status: string;
}

interface Horse {
  id: string;
  name: string;
  description: string | null;
  imageUrls: string[];
  age: number | null;
  skills: string[];
  pricePerHour: number | null;
  isActive: boolean;
}

export default function ManageStable() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stable, setStable] = useState<Stable | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [editStableOpen, setEditStableOpen] = useState(false);
  const [addHorseOpen, setAddHorseOpen] = useState(false);
  const [editHorseOpen, setEditHorseOpen] = useState(false);
  const [deleteHorseOpen, setDeleteHorseOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);

  // Form states
  const [stableForm, setStableForm] = useState({
    name: "",
    description: "",
    address: "",
  });
  const [horseForm, setHorseForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    age: "",
    skills: "",
    pricePerHour: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "stable_owner") {
      router.push("/dashboard");
      return;
    }

    fetchData();
  }, [session, status, router]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch stable
      const stableRes = await fetch("/api/stables?ownerOnly=true");
      if (!stableRes.ok) throw new Error("Failed to fetch stable");
      const stableData = await stableRes.json();
      const ownerStable = stableData.stables?.[0];

      if (!ownerStable) {
        setError("Stable not found. Please create a stable first.");
        setIsLoading(false);
        return;
      }

      setStable({
        id: ownerStable.id,
        name: ownerStable.name,
        description: ownerStable.description,
        location: ownerStable.location,
        address: ownerStable.address,
        status: ownerStable.status || "pending",
      });

      // Fetch horses
      const horsesRes = await fetch(`/api/horses?stableId=${ownerStable.id}`);
      if (horsesRes.ok) {
        const horsesData = await horsesRes.json();
        setHorses(horsesData.horses || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateStable(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/stables/${stable?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stableForm.name,
          description: stableForm.description,
          address: stableForm.address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update stable");
      }

      setEditStableOpen(false);
      fetchData();
      alert("Stable updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update stable");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddHorse(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!horseForm.imageUrl) {
        throw new Error("Please provide at least one image URL");
      }

      const response = await fetch("/api/horses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stableId: stable?.id,
          name: horseForm.name,
          description: horseForm.description,
          imageUrls: [horseForm.imageUrl],
          age: horseForm.age ? parseInt(horseForm.age) : null,
          skills: horseForm.skills
            ? horseForm.skills.split(",").map((s) => s.trim())
            : [],
          pricePerHour: horseForm.pricePerHour
            ? parseFloat(horseForm.pricePerHour)
            : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add horse");
      }

      setAddHorseOpen(false);
      setHorseForm({
        name: "",
        description: "",
        imageUrl: "",
        age: "",
        skills: "",
        pricePerHour: "",
      });
      fetchData();
      alert("Horse added successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add horse");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateHorse(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHorse) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/horses/${selectedHorse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: horseForm.name,
          description: horseForm.description,
          imageUrls: horseForm.imageUrl ? [horseForm.imageUrl] : selectedHorse.imageUrls,
          age: horseForm.age ? parseInt(horseForm.age) : null,
          skills: horseForm.skills
            ? horseForm.skills.split(",").map((s) => s.trim())
            : [],
          pricePerHour: horseForm.pricePerHour
            ? parseFloat(horseForm.pricePerHour)
            : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update horse");
      }

      setEditHorseOpen(false);
      setSelectedHorse(null);
      setHorseForm({
        name: "",
        description: "",
        imageUrl: "",
        age: "",
        skills: "",
        pricePerHour: "",
      });
      fetchData();
      alert("Horse updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update horse");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteHorse() {
    if (!selectedHorse) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/horses/${selectedHorse.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete horse");
      }

      setDeleteHorseOpen(false);
      setSelectedHorse(null);
      fetchData();
      alert("Horse removed successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete horse");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditStable() {
    if (stable) {
      setStableForm({
        name: stable.name,
        description: stable.description || "",
        address: stable.address || "",
      });
      setEditStableOpen(true);
    }
  }

  function openEditHorse(horse: Horse) {
    setSelectedHorse(horse);
    setHorseForm({
      name: horse.name,
      description: horse.description || "",
      imageUrl: horse.imageUrls?.[0] || "",
      age: horse.age?.toString() || "",
      skills: horse.skills.join(", "),
      pricePerHour: horse.pricePerHour?.toString() || "",
    });
    setEditHorseOpen(true);
  }

  function openDeleteHorse(horse: Horse) {
    setSelectedHorse(horse);
    setDeleteHorseOpen(true);
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
                Manage Stable
              </h1>
              <p className="text-muted-foreground">
                Manage your stable details and horses
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/stable">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {error ? (
          <Card className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchData}>Try Again</Button>
          </Card>
        ) : (
          <>
            {/* Stable Info */}
            <Card className="mb-8 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">
                  Stable Information
                </h2>
                <Button variant="outline" onClick={openEditStable}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Stable Name</p>
                  <p className="font-medium">{stable?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium capitalize">
                    {stable?.location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={
                      stable?.status === "approved"
                        ? "bg-green-500/20 text-green-400 border-green-500/50"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                    }
                  >
                    {stable?.status === "approved"
                      ? "Approved"
                      : stable?.status === "pending"
                      ? "Pending"
                      : "Rejected"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {stable?.address || "No address provided"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Horses */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">Horses</h2>
                <Button onClick={() => setAddHorseOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Horse
                </Button>
              </div>

              {horses.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="mb-4 text-6xl">🐴</div>
                  <h3 className="mb-2 font-display text-xl font-bold">
                    No Horses Yet
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    Add your first horse to start accepting bookings!
                  </p>
                  <Button onClick={() => setAddHorseOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Horse
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {horses.map((horse, index) => (
                    <motion.div
                      key={horse.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{horse.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {horse.age ? `${horse.age} years old` : "Age not set"}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              horse.isActive
                                ? "bg-green-500/20 text-green-400 border-green-500/50"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/50"
                            }
                          >
                            {horse.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {horse.description || "No description"}
                        </p>
                        {horse.skills.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {horse.skills.map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {horse.pricePerHour && (
                          <p className="mb-4 text-sm font-semibold">
                            ${horse.pricePerHour}/hour
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditHorse(horse)}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={() => openDeleteHorse(horse)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Stable Modal */}
      <Dialog open={editStableOpen} onOpenChange={setEditStableOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Stable</DialogTitle>
            <DialogDescription>
              Update your stable information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStable} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stable-name">Stable Name *</Label>
              <Input
                id="stable-name"
                value={stableForm.name}
                onChange={(e) =>
                  setStableForm({ ...stableForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stable-description">Description</Label>
              <Textarea
                id="stable-description"
                value={stableForm.description}
                onChange={(e) =>
                  setStableForm({ ...stableForm, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stable-address">Address</Label>
              <Input
                id="stable-address"
                value={stableForm.address}
                onChange={(e) =>
                  setStableForm({ ...stableForm, address: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditStableOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Stable"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Horse Modal */}
      <Dialog open={editHorseOpen} onOpenChange={setEditHorseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Horse</DialogTitle>
            <DialogDescription>
              Update horse information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateHorse} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-horse-name">Horse Name *</Label>
              <Input
                id="edit-horse-name"
                value={horseForm.name}
                onChange={(e) =>
                  setHorseForm({ ...horseForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-horse-description">Description *</Label>
              <Textarea
                id="edit-horse-description"
                value={horseForm.description}
                onChange={(e) =>
                  setHorseForm({ ...horseForm, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-horse-image">Image URL *</Label>
              <Input
                id="edit-horse-image"
                type="url"
                value={horseForm.imageUrl}
                onChange={(e) =>
                  setHorseForm({ ...horseForm, imageUrl: e.target.value })
                }
                placeholder="https://example.com/horse.jpg"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-horse-age">Age (years)</Label>
                <Input
                  id="edit-horse-age"
                  type="number"
                  value={horseForm.age}
                  onChange={(e) =>
                    setHorseForm({ ...horseForm, age: e.target.value })
                  }
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-horse-price">Price per Hour ($)</Label>
                <Input
                  id="edit-horse-price"
                  type="number"
                  step="0.01"
                  value={horseForm.pricePerHour}
                  onChange={(e) =>
                    setHorseForm({ ...horseForm, pricePerHour: e.target.value })
                  }
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-horse-skills">Skills (comma-separated)</Label>
              <Input
                id="edit-horse-skills"
                value={horseForm.skills}
                onChange={(e) =>
                  setHorseForm({ ...horseForm, skills: e.target.value })
                }
                placeholder="beginner-friendly, experienced-rider"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditHorseOpen(false);
                  setSelectedHorse(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Horse"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Horse Modal */}
      <Dialog open={addHorseOpen} onOpenChange={setAddHorseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Horse</DialogTitle>
            <DialogDescription>
              Add a new horse to your stable
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHorse} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="horse-name">Horse Name *</Label>
              <Input
                id="horse-name"
                value={horseForm.name}
                onChange={(e) =>
                  setHorseForm({ ...horseForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horse-description">Description *</Label>
              <Textarea
                id="horse-description"
                value={horseForm.description}
                onChange={(e) =>
                  setHorseForm({ ...horseForm, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horse-image">Image URL *</Label>
              <Input
                id="horse-image"
                type="url"
                value={horseForm.imageUrl}
                onChange={(e) =>
                  setHorseForm({ ...horseForm, imageUrl: e.target.value })
                }
                placeholder="https://example.com/horse.jpg"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horse-age">Age (years)</Label>
                <Input
                  id="horse-age"
                  type="number"
                  value={horseForm.age}
                  onChange={(e) =>
                    setHorseForm({ ...horseForm, age: e.target.value })
                  }
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horse-price">Price per Hour ($)</Label>
                <Input
                  id="horse-price"
                  type="number"
                  step="0.01"
                  value={horseForm.pricePerHour}
                  onChange={(e) =>
                    setHorseForm({ ...horseForm, pricePerHour: e.target.value })
                  }
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="horse-skills">Skills (comma-separated)</Label>
              <Input
                id="horse-skills"
                value={horseForm.skills}
                onChange={(e) =>
                  setHorseForm({ ...horseForm, skills: e.target.value })
                }
                placeholder="beginner-friendly, experienced-rider"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setAddHorseOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
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

      {/* Delete Horse Modal */}
      <Dialog open={deleteHorseOpen} onOpenChange={setDeleteHorseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Horse</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{selectedHorse?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteHorseOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteHorse}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
