"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { User, Calendar, Clock, DollarSign, Mail, Phone } from "lucide-react";

interface BookingDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: any; // Using any for now, should be typed properly with Prisma types
}

export function BookingDetailsDialog({
    open,
    onOpenChange,
    booking,
}: BookingDetailsDialogProps) {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>
                        View details for this booking.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <Badge
                            variant={booking.status === "confirmed" ? "default" : "secondary"}
                            className="px-4 py-1 text-base capitalize"
                        >
                            {booking.status}
                        </Badge>
                    </div>

                    {/* Rider Info */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" /> Rider Information
                        </h3>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{booking.rider?.fullName || "Guest User"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{booking.rider?.email}</span>
                            </div>
                            {booking.rider?.phoneNumber && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="font-medium">{booking.rider.phoneNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Info */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Session Details
                        </h3>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium">{format(new Date(booking.startTime), "MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span className="font-medium">
                                    {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Horse:</span>
                                <span className="font-medium">{booking.horse?.name || "Unknown Horse"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> Payment
                        </h3>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Price:</span>
                                <span className="font-bold text-primary">EGP {Number(booking.totalPrice).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Commission:</span>
                                <span>EGP {Number(booking.commission).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {/* Future: Add Cancel/Refund buttons here */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
