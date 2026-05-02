"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { User, Calendar, DollarSign, Phone, Star } from "lucide-react";

interface BookingDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: any;
}

export function BookingDetailsDialog({
    open,
    onOpenChange,
    booking,
}: BookingDetailsDialogProps) {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-gradient-to-b from-black/95 to-black border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-white">Booking Details</DialogTitle>
                    <DialogDescription className="text-white/60">
                        View complete information for this booking.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <Badge
                            variant={booking.status === "confirmed" ? "default" : "secondary"}
                            className="px-6 py-2 text-base capitalize bg-gradient-to-r from-[rgba(218,165,32,0.3)] to-[rgba(184,134,11,0.2)] border-[rgba(218,165,32,0.5)] text-[rgb(218,165,32)] shadow-[0_0_15px_rgba(218,165,32,0.2)]"
                        >
                            {booking.status}
                        </Badge>
                    </div>

                    {/* Rider Info */}
                    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg">
                        <h3 className="font-semibold flex items-center gap-2 text-white text-lg">
                            <User className="h-5 w-5 text-[rgb(218,165,32)]" /> Rider Information
                        </h3>
                        <div className="grid gap-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Name:</span>
                                <span className="font-semibold text-white">{booking.rider?.fullName || "Guest User"}</span>
                            </div>

                            {/* Rider Level */}
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Riding Level:</span>
                                <Badge variant="outline" className="border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.1)] text-[rgb(218,165,32)] gap-1.5 px-3 py-1">
                                    <Star className="h-3.5 w-3.5 fill-[rgb(218,165,32)]" />
                                    {booking.rider?.riderRank?.level || "Beginner"}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Email:</span>
                                <span className="font-medium text-white/90">{booking.rider?.email}</span>
                            </div>

                            {booking.rider?.phoneNumber && (
                                <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-1">
                                    <span className="text-white/60">Phone:</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-white/90">{booking.rider.phoneNumber}</span>
                                        <Button
                                            size="icon"
                                            className="h-9 w-9 rounded-full bg-gradient-to-br from-[rgba(218,165,32,0.3)] to-[rgba(184,134,11,0.2)] hover:from-[rgba(218,165,32,0.4)] hover:to-[rgba(184,134,11,0.3)] border border-[rgba(218,165,32,0.4)] text-[rgb(218,165,32)] shadow-[0_0_15px_rgba(218,165,32,0.2)] hover:shadow-[0_0_25px_rgba(218,165,32,0.3)] transition-all"
                                            asChild
                                        >
                                            <a href={`tel:${booking.rider.phoneNumber}`}>
                                                <Phone className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Info */}
                    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg">
                        <h3 className="font-semibold flex items-center gap-2 text-white text-lg">
                            <Calendar className="h-5 w-5 text-[rgb(218,165,32)]" /> Session Details
                        </h3>
                        <div className="grid gap-2.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/60">Date:</span>
                                <span className="font-semibold text-white">{format(new Date(booking.startTime), "MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Time:</span>
                                <span className="font-semibold text-white">
                                    {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Horse:</span>
                                <span className="font-semibold text-white">{booking.horse?.name || "Unknown Horse"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg">
                        <h3 className="font-semibold flex items-center gap-2 text-white text-lg">
                            <DollarSign className="h-5 w-5 text-[rgb(218,165,32)]" /> Payment
                        </h3>
                        <div className="grid gap-2.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/60">Total Price:</span>
                                <span className="font-bold text-[rgb(218,165,32)] text-lg">EGP {Number(booking.totalPrice).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Commission:</span>
                                <span className="text-white/80 font-medium">EGP {Number(booking.commission).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
