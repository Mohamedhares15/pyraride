"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Calendar as CalendarIcon, Loader2, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function PackageCheckoutClient({ pkg }: { pkg: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [date, setDate] = useState<string>("");
  const [tickets, setTickets] = useState<number>(pkg.minPeople);
  const [isProcessing, setIsProcessing] = useState(false);

  const isPrivate = pkg.packageType === "PRIVATE";
  const finalPrice = isPrivate ? pkg.price : pkg.price * tickets;

  const minDate = new Date().toISOString().split("T")[0];

  const handleCheckout = async () => {
    if (status === "unauthenticated") {
      toast.error("Please log in to complete your booking.");
      router.push(`/login?callbackUrl=/checkout/package/${pkg.id}`);
      return;
    }

    if (!date) {
      toast.error("Please select a date for your experience.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          date,
          startTime: pkg.startTime || "10:00",
          ticketsCount: isPrivate ? pkg.maxPeople : tickets,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.success("Booking confirmed! Redirecting...");
        router.push(`/payment/success?packageBookingId=${data.bookingId}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <CardTitle className="text-3xl font-display text-primary">Book Your Package</CardTitle>
          <CardDescription className="text-base mt-2">
            Complete the form below to secure your booking for the {pkg.title}.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-8">
          {/* Selected Package Summary */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold border-b pb-2 flex w-full">Selected Package</Label>
            <Card className="border-primary bg-primary/5 ring-2 ring-primary overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-48 sm:h-auto sm:w-1/3 min-w-[200px]">
                  <Image src={pkg.imageUrl} alt={pkg.title} fill className="object-cover" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-xl">{pkg.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 ml-4" />
                  </div>
                  <div className="flex mt-4 gap-4 flex-wrap text-sm font-medium text-primary">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {pkg.duration} hrs</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {pkg.price} {isPrivate ? "Total" : "/ ticket"}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Select Date */}
            <div className="space-y-3">
              <Label htmlFor="date" className="text-base font-semibold">
                Select Date *
                {date && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })})
                  </span>
                )}
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  className="h-12 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  required
                />
              </div>
              {pkg.availableDays && pkg.availableDays.length > 0 && pkg.availableDays[0] !== "Everyday" && (
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Usually runs on: {pkg.availableDays.join(", ")}
                </p>
              )}
            </div>

            {/* Select Tickets */}
            <div className="space-y-3">
              <Label htmlFor="tickets" className="text-base font-semibold">
                {isPrivate ? "Group Size" : "Number of Tickets *"}
              </Label>
              {isPrivate ? (
                <div className="h-12 w-full rounded-md border border-input bg-muted/50 px-4 py-2 text-sm flex items-center">
                  Private VIP (Up to {pkg.maxPeople} guests included)
                </div>
              ) : (
                <select 
                  id="tickets"
                  className="h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={tickets}
                  onChange={(e) => setTickets(Number(e.target.value))}
                >
                  {Array.from({ length: pkg.maxPeople - pkg.minPeople + 1 }, (_, i) => pkg.minPeople + i).map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Ticket' : 'Tickets'}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Price Summary */}
          {date && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/20 bg-primary/5 p-6 mt-8"
            >
              <h4 className="text-lg font-semibold mb-4 text-primary">Booking Summary</h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{pkg.title} ({isPrivate ? 'Private' : tickets + ' Tickets'})</span>
                  <span>EGP {finalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee</span>
                  <span>Included</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-primary/20 flex items-center justify-between">
                <span className="font-semibold text-lg">Total Due</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-bold text-2xl text-primary">
                    EGP {finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/10 border-t p-6 flex-col gap-4 items-stretch">
          <Button 
            size="lg"
            onClick={handleCheckout} 
            disabled={isProcessing || !date}
            className="w-full h-14 text-base font-semibold tracking-wide"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing Payment...</>
            ) : (
              "Confirm & Pay Securely"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            🔒 Payments are securely processed by Stripe. You will be redirected to complete your payment.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
