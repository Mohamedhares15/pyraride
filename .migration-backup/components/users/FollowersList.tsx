"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

interface Follower {
    id: string;
    fullName: string | null;
    profileImageUrl: string | null;
}

interface FollowersListProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function FollowersList({ userId, isOpen, onClose }: FollowersListProps) {
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetchFollowers();
        }
    }, [isOpen, userId]);

    const fetchFollowers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}/followers`);
            if (res.ok) {
                const data = await res.json();
                setFollowers(data.followers.map((f: any) => f.follower));
            }
        } catch (error) {
            console.error("Error fetching followers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserClick = (id: string) => {
        onClose();
        router.push(`/users/${id}`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Followers</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : followers.length > 0 ? (
                        <div className="space-y-4">
                            {followers.map((follower) => (
                                <div
                                    key={follower.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                    onClick={() => handleUserClick(follower.id)}
                                >
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarImage src={follower.profileImageUrl || ""} />
                                        <AvatarFallback>{follower.fullName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{follower.fullName}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No followers yet.
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
