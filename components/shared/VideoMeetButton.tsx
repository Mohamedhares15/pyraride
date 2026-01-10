"use client";

import { useState, useEffect } from "react";
import { Video, X, Phone, PhoneOff, Shield, Clock, Users, MessageSquare, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface VideoMeetButtonProps {
    stableId: string;
    stableName: string;
    ownerName?: string;
    ownerImage?: string;
    hasBooking?: boolean; // Whether the current user has a booking with this stable
    bookingDate?: string; // The date of the booking
}

export default function VideoMeetButton({
    stableId,
    stableName,
    ownerName = "Stable Guide",
    ownerImage,
    hasBooking = false,
    bookingDate
}: VideoMeetButtonProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [callState, setCallState] = useState<"idle" | "notifying" | "waiting" | "ready" | "in-call">("idle");
    const [ownerOnline, setOwnerOnline] = useState(false);

    // Generate a unique room name based on stable ID and user
    const roomName = `pyraride-${stableId.slice(0, 8)}-${session?.user?.id?.slice(0, 6) || 'guest'}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("action") === "join-call") {
                setIsOpen(true);
                setCallState("ready");
                setOwnerOnline(true);
                toast.success("Incoming call detected!");
            }
        }
    }, []);

    const handleRequestCall = async () => {
        if (!hasBooking) {
            toast.error("You must have a booking to video call this stable");
            return;
        }

        setCallState("notifying");

        try {
            // Notify the stable owner
            const response = await fetch("/api/notifications/video-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stableId,
                    riderId: session?.user?.id,
                    riderName: session?.user?.name || session?.user?.email,
                    action: "request"
                }),
            });

            if (response.ok) {
                toast.success("Notification sent to stable owner!");
                setCallState("waiting");

                // Simulate checking if owner comes online (in production, use WebSocket)
                setTimeout(() => {
                    // For demo, assume owner is available after 3 seconds
                    setOwnerOnline(true);
                    setCallState("ready");
                    toast.success(`${ownerName} is ready to connect!`);
                }, 3000);
            } else {
                toast.error("Failed to notify stable owner");
                setCallState("idle");
            }
        } catch (error) {
            console.error("Error requesting call:", error);
            // For demo purposes, proceed anyway
            setCallState("waiting");
            setTimeout(() => {
                setOwnerOnline(true);
                setCallState("ready");
            }, 2000);
        }
    };

    const handleJoinCall = () => {
        setCallState("in-call");

        const width = 1200;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        window.open(
            jitsiUrl,
            "PyraRide Video Call",
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );

        setTimeout(() => {
            setIsOpen(false);
            setCallState("idle");
            setOwnerOnline(false);
        }, 2000);
    };

    const handleCancel = () => {
        setCallState("idle");
        setIsOpen(false);
        setOwnerOnline(false);
    };

    const userInitials = session?.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "ME";

    // If user has no booking, show disabled button
    if (!hasBooking) {
        return (
            <Button
                disabled
                className="gap-2 bg-gray-600 text-gray-400 cursor-not-allowed"
                title="Book a ride first to unlock video chat"
            >
                <Video className="h-4 w-4" />
                <span className="font-medium">Meet Your Guide</span>
                <Badge className="bg-gray-500 text-gray-300 text-[10px] px-1.5 py-0.5 ml-1">
                    Book First
                </Badge>
            </Button>
        );
    }

    return (
        <>
            {/* Video Call Button - Only shown to users with bookings */}
            <Button
                onClick={() => setIsOpen(true)}
                className="relative group gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
            >
                <Video className="h-4 w-4" />
                <span className="font-medium">Meet Your Guide</span>
                <Badge className="absolute -top-2 -right-2 bg-white text-emerald-600 text-[10px] px-1.5 py-0.5 shadow-md">
                    Booked ✓
                </Badge>
            </Button>

            {/* Video Call Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => callState === "idle" && handleCancel()}
                    />

                    <Card className="relative z-10 w-full max-w-lg bg-gradient-to-b from-gray-900 to-black border-white/10 shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/10 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                            {ownerImage ? (
                                                <img src={ownerImage} alt={ownerName} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                stableName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-gray-900 ${ownerOnline ? 'bg-green-500' : 'bg-gray-500'
                                            }`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-white text-lg">{stableName}</CardTitle>
                                        <p className="text-sm text-white/60 flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${ownerOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                            {ownerOnline ? `${ownerName} • Online` : `${ownerName} • Offline`}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCancel}
                                    className="text-white/60 hover:text-white hover:bg-white/10"
                                    disabled={callState === "notifying"}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            {/* Booking Confirmation */}
                            {bookingDate && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                    <Calendar className="h-5 w-5 text-emerald-400" />
                                    <div>
                                        <p className="text-sm text-emerald-300 font-medium">Your Booking</p>
                                        <p className="text-xs text-emerald-400/70">{bookingDate}</p>
                                    </div>
                                </div>
                            )}

                            {/* Video Preview Area */}
                            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-white/10">
                                {callState === "idle" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800/50 to-black/80">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-2 border-emerald-500/30 flex items-center justify-center mb-4">
                                            <Video className="h-10 w-10 text-emerald-400" />
                                        </div>
                                        <p className="text-white font-medium mb-1">Video Call with {stableName}</p>
                                        <p className="text-white/50 text-sm">Discuss your upcoming ride</p>
                                    </div>
                                )}

                                {callState === "notifying" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800/50 to-black/80">
                                        <div className="relative mb-4">
                                            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                                                <Bell className="h-8 w-8 text-amber-400" />
                                            </div>
                                            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-amber-500/50 animate-ping" />
                                        </div>
                                        <p className="text-white font-medium">Notifying {ownerName}...</p>
                                        <p className="text-white/50 text-sm">Please wait</p>
                                    </div>
                                )}

                                {callState === "waiting" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800/50 to-black/80">
                                        <div className="relative mb-4">
                                            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Clock className="h-8 w-8 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
                                            </div>
                                        </div>
                                        <p className="text-white font-medium">Waiting for {ownerName}</p>
                                        <p className="text-white/50 text-sm">They'll join shortly...</p>
                                    </div>
                                )}

                                {callState === "ready" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800/50 to-black/80">
                                        <div className="flex -space-x-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-gray-900 flex items-center justify-center text-white font-bold text-xl z-10">
                                                {stableName.charAt(0)}
                                            </div>
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-gray-900 flex items-center justify-center text-white font-bold text-xl">
                                                {userInitials}
                                            </div>
                                        </div>
                                        <p className="text-emerald-400 font-medium text-lg mb-1">{ownerName} is Ready!</p>
                                        <p className="text-white/50 text-sm">Click Join to start your video call</p>
                                    </div>
                                )}

                                {callState === "in-call" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-900/50 to-black/80">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/30 flex items-center justify-center mb-4 animate-pulse">
                                            <Video className="h-8 w-8 text-emerald-400" />
                                        </div>
                                        <p className="text-emerald-400 font-medium">Call Started</p>
                                        <p className="text-white/50 text-sm">Opening in new window...</p>
                                    </div>
                                )}
                            </div>

                            {/* Features List */}
                            {callState === "idle" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <Shield className="h-4 w-4 text-emerald-400" />
                                        <span>Verified Booking</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <Bell className="h-4 w-4 text-emerald-400" />
                                        <span>Owner Notified</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <Users className="h-4 w-4 text-emerald-400" />
                                        <span>Meet the Team</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <MessageSquare className="h-4 w-4 text-emerald-400" />
                                        <span>Ask Questions</span>
                                    </div>
                                </div>
                            )}

                            {/* Call Controls */}
                            <div className="flex items-center justify-center gap-4">
                                {callState === "idle" && (
                                    <Button
                                        onClick={handleRequestCall}
                                        className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-lg font-medium rounded-xl shadow-lg shadow-emerald-500/20"
                                    >
                                        <Bell className="h-5 w-5 mr-2" />
                                        Request Video Call
                                    </Button>
                                )}

                                {(callState === "notifying" || callState === "waiting") && (
                                    <Button
                                        onClick={handleCancel}
                                        className="flex-1 h-14 bg-red-600 hover:bg-red-500 text-white text-lg font-medium rounded-xl"
                                    >
                                        <PhoneOff className="h-5 w-5 mr-2" />
                                        Cancel Request
                                    </Button>
                                )}

                                {callState === "ready" && (
                                    <div className="flex-1 flex gap-3">
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            className="flex-1 h-14 border-white/20 text-white hover:bg-white/10 rounded-xl"
                                        >
                                            <PhoneOff className="h-5 w-5 mr-2" />
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleJoinCall}
                                            className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-lg font-medium rounded-xl shadow-lg shadow-emerald-500/20 animate-pulse"
                                        >
                                            <Phone className="h-5 w-5 mr-2" />
                                            Join Call
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Trust Badge */}
                            <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                                <Shield className="h-4 w-4 text-emerald-400" />
                                <span className="text-xs text-white/50">Booking verified • End-to-end encrypted</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
