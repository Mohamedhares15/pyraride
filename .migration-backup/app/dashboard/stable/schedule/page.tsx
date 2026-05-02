"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { CreateSlotsDialog } from "@/components/schedule/CreateSlotsDialog";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";

export default function SchedulePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(startOfToday());
    const [horses, setHorses] = useState<{ id: string; name: string }[]>([]);
    const [stableId, setStableId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            const stableRes = await fetch("/api/stables?ownerOnly=true");
            const data = await stableRes.json();
            if (data.stables && data.stables.length > 0) {
                setStableId(data.stables[0].id);
                setHorses(data.stables[0].horses || []);
            }
        } catch (err) {
            console.error("Error fetching horses:", err);
        }
    }

    if (status === "loading") return <Loader2 className="h-8 w-8 animate-spin" />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 gap-2"
                        onClick={() => router.push("/dashboard")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <h1 className="font-display text-2xl md:text-3xl font-bold">Schedule Management</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage availability and block slots for your stable or specific horses.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">
                            Click on a slot to toggle availability. Green slots are available for booking.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Bulk Create
                        </Button>
                    </div>

                    <ScheduleGrid stableId={stableId || ""} horses={horses} />
                </div>

                <CreateSlotsDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    stableId={stableId || ""}
                    selectedDate={date || new Date()}
                    horses={horses}
                    onSlotsCreated={() => {
                        // The grid will need to refresh, but for now we can rely on its own internal fetch
                        // Ideally we'd pass a refresh trigger, but the grid fetches on mount/date change
                        // We can force a refresh by toggling a key or context, but let's keep it simple first
                        window.location.reload(); // Simple brute force for now to ensure grid updates after bulk create
                    }}
                />
            </div>
        </div>
    );
}
