"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, MapPin, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Location {
    id: string;
    name: string;
    isActive: boolean;
    _count?: {
        stables: number;
    };
}

export default function AdminLocationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newLocationName, setNewLocationName] = useState("");

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        fetchLocations();
    }, [session, status, router]);

    const fetchLocations = async () => {
        try {
            const response = await fetch("/api/admin/locations");
            if (response.ok) {
                const data = await response.json();
                setLocations(data);
            }
        } catch (error) {
            console.error("Failed to fetch locations:", error);
            toast.error("Failed to load locations");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLocation = async () => {
        if (!newLocationName.trim()) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/admin/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newLocationName }),
            });

            if (!response.ok) {
                throw new Error("Failed to add location");
            }

            await fetchLocations();
            setNewLocationName("");
            toast.success("Location added successfully");
        } catch (error) {
            console.error("Error adding location:", error);
            toast.error("Failed to add location");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (id: string, currentState: boolean) => {
        try {
            const response = await fetch(`/api/admin/locations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentState }),
            });

            if (!response.ok) throw new Error("Failed to update location");

            setLocations(locations.map(loc =>
                loc.id === id ? { ...loc, isActive: !currentState } : loc
            ));
            toast.success("Location updated");
        } catch (error) {
            console.error("Error updating location:", error);
            toast.error("Failed to update location");
        }
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        try {
            const response = await fetch(`/api/admin/locations/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete location");

            setLocations(locations.filter(loc => loc.id !== id));
            toast.success("Location deleted");
        } catch (error) {
            console.error("Error deleting location:", error);
            toast.error("Failed to delete location");
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-bold">Location Management</h1>
                    <p className="text-muted-foreground">
                        Manage available locations for stables. Adding a location here makes it available for new stables.
                    </p>
                </div>

                <Card className="p-6">
                    <h2 className="mb-4 text-xl font-semibold">Add New Location</h2>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="locationName" className="sr-only">Location Name</Label>
                            <Input
                                id="locationName"
                                placeholder="e.g., Luxor, Aswan"
                                value={newLocationName}
                                onChange={(e) => setNewLocationName(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddLocation} disabled={isSaving || !newLocationName.trim()}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add Location
                        </Button>
                    </div>
                </Card>

                <div className="grid gap-4">
                    {locations.map((location) => (
                        <Card key={location.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{location.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {location.isActive ? "Active" : "Inactive"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`active-${location.id}`} className="text-sm text-muted-foreground">
                                        Active
                                    </Label>
                                    <Switch
                                        id={`active-${location.id}`}
                                        checked={location.isActive}
                                        onCheckedChange={() => handleToggleActive(location.id, location.isActive)}
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => handleDeleteLocation(location.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {locations.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No locations found. Add one above.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
