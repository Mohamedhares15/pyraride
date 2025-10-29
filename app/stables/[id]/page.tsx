"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  Calendar,
  Users,
  User,
  Clock,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import BookingModal from "@/components/shared/BookingModal";
import ReviewsSection from "@/components/sections/ReviewsSection";
import StableLocationMap from "@/components/maps/StableLocationMap";

interface Review {
  id: string;
  stableRating: number;
  horseRating: number;
  comment: string;
  createdAt: string;
  rider: {
    id: string;
    fullName: string | null;
    email: string;
  };
}

interface Horse {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  isActive: boolean;
}

interface Stable {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  rating: number;
  totalBookings: number;
  totalReviews: number;
  createdAt: string;
  owner: {
    id: string;
    fullName: string | null;
    email: string;
  };
  horses: Horse[];
  reviews: Review[];
}

export default function StableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [stable, setStable] = useState<Stable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [takenSlots, setTakenSlots] = useState<Record<string, Record<string, any[]>>>({});
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchStable() {
      try {
        const [stableRes, slotsRes] = await Promise.all([
          fetch(`/api/stables/${id}`),
          fetch(`/api/stables/${id}/slots`),
        ]);
        
        if (!stableRes.ok) {
          throw new Error("Stable not found");
        }

        const stableData = await stableRes.json();
        setStable(stableData);

        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          setAvailableSlots(slotsData.availableSlots || {});
          setTakenSlots(slotsData.takenSlots || {});
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stable");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchStable();
    }
  }, [id]);

  // Refresh slots every 15 seconds (more frequent updates)
  useEffect(() => {
    if (!id) return;
    
    const interval = setInterval(async () => {
      try {
        const slotsRes = await fetch(`/api/stables/${id}/slots`);
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          setAvailableSlots(slotsData.availableSlots || {});
          setTakenSlots(slotsData.takenSlots || {});
        }
      } catch (err) {
        console.error("Error refreshing slots:", err);
      }
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading stable details...</p>
        </div>
      </div>
    );
  }

  if (error || !stable) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🐴</div>
          <h2 className="mb-2 font-display text-2xl font-bold">Stable Not Found</h2>
          <p className="mb-6 text-muted-foreground">{error || "This stable doesn't exist"}</p>
          <Button onClick={() => router.push("/stables")}>
            Browse Stables
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border bg-card/50 py-4 backdrop-blur-lg">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <Link href="/stables">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Stables
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: stable.horses.length > 0 && stable.horses[0].imageUrls.length > 0
              ? `url(${stable.horses[0].imageUrls[0]})`
              : "url(/hero-bg.webp)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-primary/90 text-primary-foreground">
              <Star className="mr-1 h-3 w-3 fill-yellow-400" />
              {stable.rating > 0 ? `${stable.rating.toFixed(1)} Rating` : "New Stable"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {stable.location}
            </Badge>
          </div>
          
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {stable.name}
          </h1>
          
          <p className="mb-6 text-lg text-muted-foreground">
            {stable.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{stable.horses.length} Horses</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{stable.totalBookings} Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{stable.totalReviews} Reviews</span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Location & Map */}
            <Card className="p-6">
              <div className="mb-4 flex items-start gap-4">
                <MapPin className="mt-1 h-6 w-6 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">Location</h3>
                  <p className="text-sm text-muted-foreground">{stable.address || stable.location}</p>
                  <p className="mt-1 text-sm capitalize">{stable.location}</p>
                </div>
              </div>
              <StableLocationMap 
                stableId={stable.id} 
                stableName={stable.name} 
                stableLocation={stable.location}
                stableAddress={stable.address}
              />
            </Card>

            {/* Horses */}
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold">Our Horses</h2>
              {stable.horses.length > 0 ? (
                <div className="space-y-6">
                  {stable.horses.map((horse) => {
                    // Extract or default horse info
                    const horsePrice = "500"; // Default price, can be extracted from description
                    const horseAge = "8 years"; // Default age, can be extracted from description
                    const horseSkills = ["Beginner Friendly", "Tour Guide", "Desert Expert"]; // Default skills
                    
                    // Get slots for this horse
                    const today = new Date().toISOString().split("T")[0];
                    const horseSlots = takenSlots[today]?.[horse.id] || [];
                    const availableSlotsToday = availableSlots[today] || [];
                    const takenTimes = horseSlots.map((slot: any) => 
                      new Date(slot.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                    );
                    const availableTimes = availableSlotsToday.filter((time: string) => !takenTimes.includes(time));

                    return (
                      <Card key={horse.id} className="overflow-hidden">
                        <div className="grid gap-0 md:grid-cols-2">
                          {/* Horse Image */}
                          <div className="relative h-64 w-full md:h-auto bg-gradient-to-br from-primary/20 to-secondary/20">
                            {horse.imageUrls && horse.imageUrls.length > 0 ? (
                              <Image
                                src={horse.imageUrls[0]}
                                alt={horse.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="mx-auto mb-2 text-5xl">🐴</div>
                                  <p className="text-sm text-muted-foreground">{horse.name}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Horse Info */}
                          <div className="p-6">
                            <div className="mb-4">
                              <h3 className="mb-2 font-semibold text-2xl">{horse.name}</h3>
                              <p className="text-sm text-muted-foreground mb-4">{horse.description}</p>
                            </div>

                            {/* Horse Details Footer */}
                            <div className="space-y-3 border-t pt-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Age:</span>
                                <span className="font-medium">{horseAge}</span>
                              </div>
                              <div className="flex items-start justify-between text-sm">
                                <span className="text-muted-foreground">Skills:</span>
                                <div className="flex flex-wrap gap-1 justify-end">
                                  {horseSkills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-bold text-primary text-lg">EGP {horsePrice}/hour</span>
                              </div>
                            </div>

                            {/* Available Slots */}
                            <div className="mt-6 border-t pt-4">
                              <h4 className="mb-3 text-sm font-semibold">Today&apos;s Availability</h4>
                              {availableTimes.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {availableTimes.slice(0, 6).map((time: string) => (
                                    <Badge key={time} className="bg-green-500/20 text-green-700 border-green-500/50">
                                      {time}
                                    </Badge>
                                  ))}
                                  {availableTimes.length > 6 && (
                                    <Badge variant="outline">
                                      +{availableTimes.length - 6} more
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground mb-3">No available slots today</p>
                              )}
                              
                              {takenTimes.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-muted-foreground mb-2">Booked:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {takenTimes.slice(0, 4).map((time: string) => (
                                      <Badge key={time} variant="outline" className="opacity-60">
                                        {time}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Updated every 30 seconds</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No horses listed yet.</p>
                </Card>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold">Customer Reviews</h2>
              <ReviewsSection
                reviews={stable.reviews}
                averageStableRating={
                  stable.reviews.length > 0
                    ? stable.reviews.reduce((sum, r) => sum + r.stableRating, 0) /
                      stable.reviews.length
                    : 0
                }
                averageHorseRating={
                  stable.reviews.length > 0
                    ? stable.reviews.reduce((sum, r) => sum + r.horseRating, 0) /
                      stable.reviews.length
                    : 0
                }
                totalReviews={stable.totalReviews}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Stable Owner</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    {stable.owner.fullName || stable.owner.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{stable.owner.email}</span>
                </div>
              </div>
            </Card>

            {/* Book Now */}
            <Card className="border-primary/50 bg-primary/5 p-6">
              <h3 className="mb-4 font-display text-xl font-bold">
                Book Your Ride
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Experience the pyramids with our trusted horses. Book now and secure your spot!
              </p>
              {session && session.user.role === "rider" ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Book Now
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    variant="outline"
                    onClick={() => alert("Please sign in as a rider to book")}
                  >
                    Sign In to Book
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Only riders can create bookings
                  </p>
                </div>
              )}
            </Card>

            {/* Stats */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Bookings</span>
                  <span className="font-medium">{stable.totalBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Reviews</span>
                  <span className="font-medium">{stable.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-medium">{stable.rating.toFixed(1)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {stable && (
        <BookingModal
          open={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
          stableId={stable.id}
          stableName={stable.name}
          horses={stable.horses}
          pricePerHour={50}
        />
      )}
    </div>
  );
}

