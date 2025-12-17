"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
    const router = useRouter();
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!image) return;

        try {
            setIsLoading(true);
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageUrl: image,
                    caption
                })
            });

            if (!response.ok) throw new Error("Failed to create post");

            router.refresh();
            onClose();
            setCaption("");
            setImage(null);
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
                    <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Image Upload Area */}
                    <div
                        className={`relative aspect-square rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 transition-colors ${image ? 'border-none' : ''}`}
                        onClick={() => !image && fileInputRef.current?.click()}
                    >
                        {image ? (
                            <>
                                <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImage(null);
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="h-10 w-10 text-zinc-500 mb-2" />
                                <span className="text-sm text-zinc-400">Click to upload photo</span>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                    </div>

                    {/* Caption */}
                    <div className="space-y-2">
                        <Label htmlFor="caption">Caption</Label>
                        <Textarea
                            id="caption"
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 focus:ring-primary min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!image || isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
