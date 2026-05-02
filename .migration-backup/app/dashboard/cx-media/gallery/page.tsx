"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface GalleryItem {
    id: string;
    url: string;
    caption: string | null;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
}

export default function GalleryReviewPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        try {
            const res = await fetch("/api/cx/gallery");
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
            toast.error("Failed to load pending photos");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleReview(id: string, status: "approved" | "rejected") {
        setProcessingId(id);
        try {
            const res = await fetch("/api/cx/gallery", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            if (res.ok) {
                toast.success(`Photo ${status} successfully`);
                setItems((prev) => prev.filter((item) => item.id !== id));
            } else {
                toast.error("Failed to update photo status");
            }
        } catch (error) {
            console.error("Review error:", error);
            toast.error("Failed to update photo status");
        } finally {
            setProcessingId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gallery Review</h1>
                <p className="text-muted-foreground">
                    Review and moderate user-uploaded photos before they appear in the public gallery.
                </p>
            </div>

            {items.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Check className="mb-4 h-12 w-12 text-green-500" />
                        <h3 className="text-xl font-semibold">All caught up!</h3>
                        <p className="text-muted-foreground">No pending photos to review.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                            <div className="relative aspect-[3/4] w-full">
                                <Image
                                    src={item.url}
                                    alt="Review item"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <CardFooter className="grid grid-cols-2 gap-2 p-4">
                                <Button
                                    variant="outline"
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
                                    onClick={() => handleReview(item.id, "rejected")}
                                    disabled={processingId === item.id}
                                >
                                    {processingId === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <X className="mr-2 h-4 w-4" />
                                            Reject
                                        </>
                                    )}
                                </Button>
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => handleReview(item.id, "approved")}
                                    disabled={processingId === item.id}
                                >
                                    {processingId === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Approve
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
