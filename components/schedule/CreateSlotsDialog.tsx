"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CreateSlotsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stableId: string;
    selectedDate: Date;
    horses: { id: string; name: string }[];
    onSlotsCreated: () => void;
}

export function CreateSlotsDialog({
    open,
    onOpenChange,
    stableId,
    selectedDate,
    horses,
    onSlotsCreated,
}: CreateSlotsDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [horseId, setHorseId] = useState<string>("all");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [duration, setDuration] = useState("60");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/stables/${stableId}/slots`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: format(selectedDate, "yyyy-MM-dd"),
                    startTime,
                    endTime,
                    horseId: horseId === "all" ? null : horseId,
                    duration: parseInt(duration),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message || "Slots created successfully!");
                onSlotsCreated();
                onOpenChange(false);
                // Reset form
                setStartTime("09:00");
                setEndTime("17:00");
                setDuration("60");
                setHorseId("all");
            } else {
                const error = await response.text();
                toast.error(error || "Failed to create slots");
            }
        } catch (error) {
            console.error("Error creating slots:", error);
            toast.error("Failed to create slots");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Availability Slots</DialogTitle>
                    <DialogDescription>
                        Create time slots for {format(selectedDate, "MMMM d, yyyy")}. Slots can be for your entire stable or specific horses.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="horse-select">Apply to</Label>
                        <Select value={horseId} onValueChange={setHorseId}>
                            <SelectTrigger id="horse-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Entire Stable (All Horses)</SelectItem>
                                {horses.map((horse) => (
                                    <SelectItem key={horse.id} value={horse.id}>
                                        {horse.name} (specific horse)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-time">End Time</Label>
                            <Input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Slot Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger id="duration">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Slots will be created in {duration}-minute intervals between the start and end times.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Slots
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
