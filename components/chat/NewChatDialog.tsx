"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus, Search, X } from "lucide-react";

interface User {
    id: string;
    fullName: string | null;
    profileImageUrl: string | null;
    email: string;
}

interface NewChatDialogProps {
    onConversationCreated: (conversation: any) => void;
}

export default function NewChatDialog({ onConversationCreated }: NewChatDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users);
            }
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const toggleUser = (user: User) => {
        if (selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers(prev => [...prev, user]);
        }
    };

    const createConversation = async () => {
        if (selectedUsers.length === 0) return;

        setIsCreating(true);
        try {
            const res = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantIds: selectedUsers.map(u => u.id) }),
            });

            if (res.ok) {
                const data = await res.json();
                onConversationCreated(data.conversation);
                setIsOpen(false);
                setSelectedUsers([]);
                setSearchQuery("");
            }
        } catch (error) {
            console.error("Error creating conversation:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10">
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded-full text-sm">
                                    <span>{user.fullName}</span>
                                    <button onClick={() => toggleUser(user)} className="hover:text-white">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 bg-zinc-800 border-white/10 focus-visible:ring-primary"
                        />
                    </div>

                    {/* Results */}
                    <ScrollArea className="h-[200px]">
                        {isSearching ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-2">
                                {searchResults.map(user => {
                                    const isSelected = selectedUsers.some(u => u.id === user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => toggleUser(user)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-primary/20" : "hover:bg-white/5"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.profileImageUrl || ""} />
                                                    <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.fullName}</span>
                                            </div>
                                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : searchQuery.length > 1 ? (
                            <p className="text-center text-zinc-500 py-4">No users found</p>
                        ) : null}
                    </ScrollArea>

                    <Button
                        onClick={createConversation}
                        disabled={selectedUsers.length === 0 || isCreating}
                        className="w-full bg-primary hover:bg-primary/90"
                    >
                        {isCreating ? "Creating..." : "Start Chat"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
