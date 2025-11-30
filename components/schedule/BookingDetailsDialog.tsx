"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { User, Calendar, Clock, DollarSign, Mail, Phone, Star } from "lucide-react";

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
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Booking Details</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        View details for this booking.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <Badge
                            variant={booking.status === "confirmed" ? "default" : "secondary"}
                            className="px-4 py-1 text-base capitalize bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                        >
                            {booking.status}
                        </Badge>
                    </div>

                    {/* Rider Info */}
                    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                        <h3 className="font-semibold flex items-center gap-2 text-zinc-100">
                            <User className="h-4 w-4 text-zinc-400" /> Rider Information
                        </h3>
                        <div className="grid gap-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Name:</span>
                                <span className="font-medium text-zinc-200">{booking.rider?.fullName || "Guest User"}</span>
                            </div>

                            {/* Rider Level - Assuming it's on the rider object, otherwise fallback */}
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Riding Level:</span>
                                <Badge variant="outline" className="border-zinc-700 text-zinc-300 gap-1">
                                    <Star className="h-3 w-3 fill-yellow-500/20 text-yellow-500" />
                                    {booking.rider?.riderRank?.level || "Beginner"}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Email:</span>
                                <span className="font-medium text-zinc-200">{booking.rider?.email}</span>
                            </div>

                            {booking.rider?.phoneNumber && (
                                <div className="flex justify-between items-center pt-2 border-t border-zinc-800 mt-1">
                                    <span className="text-zinc-400">Phone:</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-zinc-200">{booking.rider.phoneNumber}</span>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400 border border-emerald-500/20"
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
                    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                        <h3 className="font-semibold flex items-center gap-2 text-zinc-100">
                            <Calendar className="h-4 w-4 text-zinc-400" /> Session Details
                        </h3>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Date:</span>
                                <span className="font-medium text-zinc-200">{format(new Date(booking.startTime), "MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Time:</span>
                                <span className="font-medium text-zinc-200">
                                    {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Horse:</span>
                                <span className="font-medium text-zinc-200">{booking.horse?.name || "Unknown Horse"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                        <h3 className="font-semibold flex items-center gap-2 text-zinc-100">
                            <DollarSign className="h-4 w-4 text-zinc-400" /> Payment
                        </h3>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Total Price:</span>
                                <span className="font-bold text-emerald-400">EGP {Number(booking.totalPrice).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Commission:</span>
                                <span className="text-zinc-200">EGP {Number(booking.commission).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
