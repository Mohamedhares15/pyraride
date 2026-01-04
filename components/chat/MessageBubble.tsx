"use client";

import { motion, PanInfo, useAnimation } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: any;
    isMe: boolean;
    onSwipeReply?: (message: any) => void;
}

export default function MessageBubble({ message, isMe, onSwipeReply }: MessageBubbleProps) {
    const controls = useAnimation();

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 50 && onSwipeReply) {
            onSwipeReply(message);
        }
        controls.start({ x: 0 });
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 50 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            className={cn(
                "flex w-full mb-4 relative group",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            {/* Reply Icon Indicator (Hidden by default, shown on drag) */}
            <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Could add an icon here if we want visual feedback during drag */}
            </div>

            <div
                className={cn(
                    "max-w-[75%] px-4 py-2 rounded-2xl text-sm relative shadow-sm",
                    isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-zinc-800 text-zinc-100 rounded-bl-none"
                )}
            >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>

                <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                    <span className={cn("text-[10px]", isMe ? "text-primary-foreground/70" : "text-zinc-400")}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {isMe && (
                        <span className="text-primary-foreground/70">
                            {message.status === "READ" ? (
                                <CheckCheck className="w-3 h-3 text-blue-200" />
                            ) : message.status === "DELIVERED" ? (
                                <CheckCheck className="w-3 h-3" />
                            ) : (
                                <Check className="w-3 h-3" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
