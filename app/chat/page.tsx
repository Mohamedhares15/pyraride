"use client";

import { useState, useEffect, useRef, Suspense, useOptimistic, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, ArrowLeft, X } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import NewChatDialog from "@/components/chat/NewChatDialog";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useVirtualizer } from "@tanstack/react-virtual";

interface User {
    id: string;
    fullName: string | null;
    profileImageUrl: string | null;
}

interface Message {
    id: string;
    content: string;
    createdAt: string;
    sender: User;
    status?: "SENT" | "DELIVERED" | "READ";
    pending?: boolean;
}

interface Conversation {
    id: string;
    participants: User[];
    messages: Message[];
    updatedAt: string;
}

function ChatContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get("userId");

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false); // Simulated typing state
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    // Optimistic UI for messages
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        messages,
        (state, newMessage: Message) => [...state, newMessage]
    );
    const [isPending, startTransition] = useTransition();

    const scrollRef = useRef<HTMLDivElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);

    // Virtualizer for performance with large lists
    const rowVirtualizer = useVirtualizer({
        count: optimisticMessages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60, // Estimate row height
        overscan: 5,
    });

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            // Poll for new messages every 3 seconds (Real-time simulation)
            const interval = setInterval(() => {
                fetchMessages(selectedConversation.id, true);
                // Simulate typing indicator randomly for demo purposes
                // setIsTyping(Math.random() > 0.9); 
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (targetUserId && conversations.length > 0 && !selectedConversation) {
            const existing = conversations.find(c =>
                c.participants.length === 2 &&
                c.participants.some(p => p.id === targetUserId)
            );

            if (existing) {
                setSelectedConversation(existing);
            } else {
                createConversation([targetUserId]);
            }
        }
    }, [targetUserId, conversations]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (rowVirtualizer.getTotalSize() > 0) {
            rowVirtualizer.scrollToIndex(optimisticMessages.length - 1);
        }
    }, [optimisticMessages.length]);

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/chat/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string, isPolling = false) => {
        try {
            const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);

                if (!isPolling && data.messages.length > 0) {
                    markAsRead(conversationId);
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const markAsRead = async (conversationId: string) => {
        try {
            await fetch(`/api/chat/conversations/${conversationId}/read`, { method: "POST" });
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const createConversation = async (participantIds: string[]) => {
        try {
            const res = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantIds }),
            });

            if (res.ok) {
                const data = await res.json();
                setConversations(prev => [data.conversation, ...prev.filter(c => c.id !== data.conversation.id)]);
                setSelectedConversation(data.conversation);
            }
        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !session?.user) return;

        const tempId = Math.random().toString(36).substring(7);
        const user = session.user as any; // Cast to any to avoid type errors if image is missing from type

        const optimisticMsg: Message = {
            id: tempId,
            content: newMessage,
            createdAt: new Date().toISOString(),
            sender: {
                id: user.id,
                fullName: user.name || "Me",
                profileImageUrl: user.image || user.profileImageUrl || null
            },
            status: "SENT",
            pending: true
        };

        // Optimistic update
        startTransition(() => {
            addOptimisticMessage(optimisticMsg);
            setNewMessage("");
            setReplyingTo(null); // Clear reply state
        });

        try {
            const res = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: optimisticMsg.content }),
            });

            if (res.ok) {
                fetchMessages(selectedConversation.id);
                fetchConversations();
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const getOtherParticipant = (conversation: Conversation) => {
        if (!conversation.participants || conversation.participants.length === 0) return { id: "unknown", fullName: "Unknown", profileImageUrl: null };
        return conversation.participants.find(p => p.id !== session?.user?.id) || conversation.participants[0];
    };

    const handleConversationCreated = (conversation: Conversation) => {
        setConversations(prev => [conversation, ...prev]);
        setSelectedConversation(conversation);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-4 flex gap-6 h-[100dvh]">
                {/* Sidebar - Conversations List */}
                <div className={`w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold font-display">Messages</h2>
                        <NewChatDialog onConversationCreated={handleConversationCreated} />
                    </div>

                    <ScrollArea className="flex-1 -mx-4 px-4">
                        <div className="space-y-2">
                            {conversations.length > 0 ? (
                                conversations.map(conversation => {
                                    const otherUser = getOtherParticipant(conversation);
                                    const lastMessage = conversation.messages?.[0];
                                    const isSelected = selectedConversation?.id === conversation.id;

                                    if (!otherUser) return null;

                                    return (
                                        <div
                                            key={conversation.id}
                                            onClick={() => setSelectedConversation(conversation)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${isSelected ? "bg-primary/20 border border-primary/30" : "bg-zinc-900/50 hover:bg-zinc-900 border border-transparent"
                                                }`}
                                        >
                                            <Avatar className="h-12 w-12 border border-white/10">
                                                <AvatarImage src={otherUser.profileImageUrl || ""} />
                                                <AvatarFallback>{otherUser.fullName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="font-semibold truncate">{otherUser.fullName}</h3>
                                                    {lastMessage && (
                                                        <span className="text-xs text-zinc-500">
                                                            {new Date(lastMessage.createdAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-400 truncate">
                                                    {lastMessage ? lastMessage.content : "Start a conversation"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-zinc-500">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No conversations yet</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className={`flex-1 flex flex-col bg-zinc-900/30 rounded-2xl border border-white/5 overflow-hidden ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-zinc-900/50 backdrop-blur-sm z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden -ml-2"
                                    onClick={() => setSelectedConversation(null)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>

                                <Avatar className="h-10 w-10 border border-white/10">
                                    <AvatarImage src={getOtherParticipant(selectedConversation).profileImageUrl || ""} />
                                    <AvatarFallback>{getOtherParticipant(selectedConversation).fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold">{getOtherParticipant(selectedConversation).fullName}</h3>
                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Online
                                    </span>
                                </div>
                            </div>

                            {/* Messages with Virtualization */}
                            <div className="flex-1 p-4 overflow-y-auto" ref={parentRef}>
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize()}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const msg = optimisticMessages[virtualRow.index];
                                        const isMe = msg.sender.id === session?.user?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                <MessageBubble
                                                    message={msg}
                                                    isMe={isMe}
                                                    onSwipeReply={setReplyingTo}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                {isTyping && <TypingIndicator />}
                            </div>

                            {/* Reply Banner */}
                            {replyingTo && (
                                <div className="px-4 py-2 bg-zinc-800/80 border-t border-white/5 flex justify-between items-center backdrop-blur-sm z-10">
                                    <div className="flex flex-col text-sm border-l-2 border-primary pl-2">
                                        <span className="text-primary font-semibold">{replyingTo.sender.fullName}</span>
                                        <span className="text-zinc-400 truncate max-w-[200px]">{replyingTo.content}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-white/5 bg-zinc-900/50 backdrop-blur-sm z-10">
                                <form onSubmit={sendMessage} className="flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="bg-zinc-800 border-white/10 focus-visible:ring-primary"
                                    />
                                    <Button type="submit" disabled={!newMessage.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                            <div className="h-20 w-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
