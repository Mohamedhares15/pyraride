"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBio: string;
    userId: string;
}

export default function EditProfileModal({ isOpen, onClose, currentBio, userId }: EditProfileModalProps) {
    const router = useRouter();
    const [bio, setBio] = useState(currentBio || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/users/${userId}/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bio })
            });

            if (!response.ok) throw new Error("Failed to update profile");

            router.refresh();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell us about yourself..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 focus:ring-primary min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
