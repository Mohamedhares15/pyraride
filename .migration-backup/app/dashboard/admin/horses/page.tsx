"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Save, Award } from "lucide-react";
import { toast } from "sonner";

interface Horse {
    id: string;
    name: string;
    adminTier: string | null;
    firstTimeFriendly: boolean | null;
    stable: {
        id: string;
        name: string;
    };
}

export default function AdminHorsesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [horses, setHorses] = useState<Horse[]>([]);
    const [filteredHorses, setFilteredHorses] = useState<Horse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
    const [selectedFirstTimeFriendly, setSelectedFirstTimeFriendly] = useState<Record<string, boolean | null>>({});

    useEffect(() => {
        if (status === "loading") return;

        if (!session || session.user.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        fetchHorses();
    }, [session, status, router]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredHorses(horses);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredHorses(
                horses.filter(
                    (horse) =>
                        horse.name.toLowerCase().includes(query) ||
                        horse.stable.name.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, horses]);

    async function fetchHorses() {
        try {
            setIsLoading(true);
            const res = await fetch("/api/admin/horses");
            if (res.ok) {
                const data = await res.json();
                setHorses(data.horses || []);
                setFilteredHorses(data.horses || []);
                // Initialize selected tiers and firstTimeFriendly
                const tiers: Record<string, string> = {};
                const firstTime: Record<string, boolean | null> = {};
                (data.horses || []).forEach((horse: Horse) => {
                    tiers[horse.id] = horse.adminTier || "";
                    firstTime[horse.id] = horse.firstTimeFriendly;
                });
                setSelectedTiers(tiers);
                setSelectedFirstTimeFriendly(firstTime);
            } else {
                toast.error("Failed to load horses");
            }
        } catch (error) {
            console.error("Error fetching horses:", error);
            toast.error("Failed to load horses");
        } finally {
            setIsLoading(false);
        }
    }

    async function saveAdminTier(horseId: string, tier: string) {
        try {
            setIsSaving(true);
            const firstTimeFriendly = selectedFirstTimeFriendly[horseId];
            const res = await fetch(`/api/admin/horses/${horseId}/admin-tier`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminTier: tier || null,
                    firstTimeFriendly: tier === "Beginner" ? firstTimeFriendly : null
                }),
            });

            if (res.ok) {
                toast.success(`Admin tier updated for horse`);
                // Update local state
                setHorses((prev) =>
                    prev.map((h) => (h.id === horseId ? {
                        ...h,
                        adminTier: tier || null,
                        firstTimeFriendly: tier === "Beginner" ? firstTimeFriendly : null
                    } : h))
                );
                setSelectedTiers((prev) => ({ ...prev, [horseId]: tier || "" }));
                if (tier !== "Beginner") {
                    setSelectedFirstTimeFriendly((prev) => ({ ...prev, [horseId]: null }));
                }
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update admin tier");
            }
        } catch (error) {
            console.error("Error saving admin tier:", error);
            toast.error("Failed to update admin tier");
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

    return (
        <div className="min-h-screen bg-background safe-area-white">
            {/* Header */}
            <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
                <div className="mx-auto max-w-7xl px-4 md:px-8">
                    <Link href="/dashboard/analytics">
                        <Button variant="ghost" size="sm" className="mb-4 gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Analytics
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Manage Horse Admin Tiers</h1>
                            <p className="text-muted-foreground">
                                Set difficulty tiers for horses. These tiers are used in the leaderboard scoring system.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by horse name or stable name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Info Card */}
                <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardContent className="pt-6">
                        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                            About Admin Tiers
                        </h3>
                        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                            <li>• <strong>Beginner:</strong> Easy horses suitable for new riders</li>
                            <li>• <strong>Intermediate:</strong> Moderate difficulty horses for experienced riders</li>
                            <li>• <strong>Advanced:</strong> Challenging horses for expert riders</li>
                            <li>• Admin tiers are locked and cannot be changed by stable owners</li>
                            <li>• Tiers affect how points are calculated in the leaderboard system</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Horses List */}
                {filteredHorses.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                {searchQuery ? "No horses found matching your search." : "No horses found."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredHorses.map((horse) => (
                            <Card key={horse.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{horse.name}</CardTitle>
                                    <CardDescription>{horse.stable.name}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor={`tier-${horse.id}`}>Admin Tier</Label>
                                        <Select
                                            value={selectedTiers[horse.id] || "unassigned"}
                                            onValueChange={(value) => {
                                                const newValue = value === "unassigned" ? "" : value;
                                                setSelectedTiers((prev) => ({
                                                    ...prev,
                                                    [horse.id]: newValue,
                                                }));
                                                // Reset firstTimeFriendly if not Beginner
                                                if (newValue !== "Beginner") {
                                                    setSelectedFirstTimeFriendly((prev) => ({
                                                        ...prev,
                                                        [horse.id]: null,
                                                    }));
                                                }
                                            }}
                                        >
                                            <SelectTrigger id={`tier-${horse.id}`}>
                                                <SelectValue placeholder="Select tier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Not Set</SelectItem>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {selectedTiers[horse.id] === "Beginner" && (
                                        <div>
                                            <Label htmlFor={`firstTime-${horse.id}`}>First Time Friendly</Label>
                                            <Select
                                                value={
                                                    selectedFirstTimeFriendly[horse.id] === true
                                                        ? "true"
                                                        : selectedFirstTimeFriendly[horse.id] === false
                                                            ? "false"
                                                            : "unassigned"
                                                }
                                                onValueChange={(value) => {
                                                    setSelectedFirstTimeFriendly((prev) => ({
                                                        ...prev,
                                                        [horse.id]: value === "true" ? true : value === "false" ? false : null,
                                                    }));
                                                }}
                                            >
                                                <SelectTrigger id={`firstTime-${horse.id}`}>
                                                    <SelectValue placeholder="Select option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Not Set</SelectItem>
                                                    <SelectItem value="true">First Time Friendly</SelectItem>
                                                    <SelectItem value="false">Not First Time Friendly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <Button
                                        onClick={() => saveAdminTier(horse.id, selectedTiers[horse.id] || "")}
                                        disabled={
                                            isSaving ||
                                            ((selectedTiers[horse.id] || "") === (horse.adminTier || "") &&
                                                (selectedTiers[horse.id] !== "Beginner" ||
                                                    selectedFirstTimeFriendly[horse.id] === horse.firstTimeFriendly))
                                        }
                                        className="w-full"
                                        size="sm"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Tier
                                            </>
                                        )}
                                    </Button>
                                    {horse.adminTier && (
                                        <p className="text-xs text-muted-foreground">
                                            Current: <strong>{horse.adminTier}</strong>
                                            {horse.adminTier === "Beginner" && horse.firstTimeFriendly !== null && (
                                                <span className="ml-2">
                                                    ({horse.firstTimeFriendly ? "First Time Friendly" : "Not First Time Friendly"})
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

