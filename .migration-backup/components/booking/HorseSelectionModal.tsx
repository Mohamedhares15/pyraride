"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface Horse {
    id: string;
    name: string;
    description: string;
    imageUrls: string[];
    pricePerHour: number;
    media?: Array<{ type: string; url: string }>;
}

interface HorseSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (horse: Horse) => void;
    stableId: string;
    selectedDate: string;
    selectedStartTime: string;
    selectedEndTime: string;
    excludedHorseIds: string[];
}

export default function HorseSelectionModal({
    isOpen,
    onClose,
    onSelect,
    stableId,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    excludedHorseIds,
}: HorseSelectionModalProps) {
    const [horses, setHorses] = useState<Horse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && stableId) {
            fetchHorses();
        }
    }, [isOpen, stableId]);

    const fetchHorses = async () => {
        setIsLoading(true);
        setError("");
        try {
            // Fetch horses for the stable
            // Note: Ideally we should have an endpoint that filters by availability for the specific time slot
            // For now, we'll fetch all horses and filter client-side based on the excluded list
            // In a real production app, the API should handle availability checking
            const res = await fetch(`/api/stables/${stableId}`);
            if (!res.ok) throw new Error("Failed to fetch horses");
            const data = await res.json();

            if (data.horses) {
                setHorses(data.horses);
            }
        } catch (err) {
            setError("Failed to load horses");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const availableHorses = horses.filter(h => !excludedHorseIds.includes(h.id));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-black/95 border-white/10 text-white max-h-[80vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <DialogTitle>Select a Horse</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-400">{error}</div>
                ) : availableHorses.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                        No other horses available for this time slot.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
                        {availableHorses.map((horse) => {
                            const heroImage = horse.media?.find(m => m.type === "image")?.url || horse.imageUrls?.[0] || "/hero-bg.webp";

                            return (
                                <Card
                                    key={horse.id}
                                    className="overflow-hidden bg-white/5 border-white/10 hover:border-primary/50 transition-colors cursor-pointer group"
                                    onClick={() => onSelect(horse)}
                                >
                                    <div className="relative h-40 w-full">
                                        <Image
                                            src={heroImage}
                                            alt={horse.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-bold text-lg text-white mb-1">{horse.name}</h3>
                                        <p className="text-sm text-white/60 line-clamp-2 mb-3">{horse.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-primary font-semibold">EGP {horse.pricePerHour}</span>
                                            <Button size="sm" variant="secondary" className="h-8">Select</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
