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
  Mail,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import BookingModal from "@/components/shared/BookingModal";
import ReviewsSection from "@/components/sections/ReviewsSection";
import StableLocationMap from "@/components/maps/StableLocationMap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface HorseMediaItem {
  url: string;
  type: "image" | "video";
  thumbnailUrl?: string | null;
  sortOrder?: number | null;
}

interface Horse {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  isActive: boolean;
  pricePerHour?: number | null;
  age?: number | null;
  skills?: string[];
  media: HorseMediaItem[];
}

interface PortfolioViewerState {
  horseName: string;
  items: HorseMediaItem[];
  index: number;
}

interface Stable {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  imageUrl?: string | null;
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
  const [portfolioViewer, setPortfolioViewer] = useState<PortfolioViewerState | null>(null);
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

  useEffect(() => {
    if (isLoading || !stable) return;
    if (typeof window === "undefined") return;

    const { hash } = window.location;
    if (!hash) return;

    const element = document.querySelector(hash);
    if (!(element instanceof HTMLElement)) return;

    window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      element.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }, 2000);
    });
  }, [isLoading, stable]);

  const openPortfolio = (horseName: string, items: HorseMediaItem[], startIndex = 0) => {
    if (!items || items.length === 0) return;
    
    // Lock scroll and save current position - Complete lock
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.left = '0';
    body.style.right = '0';
    body.style.touchAction = 'none';
    
    html.style.overflow = 'hidden';
    html.style.position = 'fixed';
    html.style.width = '100%';
    html.style.height = '100%';
    
    // Push history state so back button closes portfolio instead of navigating away
    window.history.pushState({ portfolioOpen: true }, '', window.location.href);
    
    setPortfolioViewer({
      horseName,
      items,
      index: Math.min(Math.max(startIndex, 0), items.length - 1),
    });
  };

  const closePortfolio = () => {
    // Restore scroll position and unlock scroll
    const scrollY = document.body.style.top;
    const html = document.documentElement;
    const body = document.body;
    
    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    body.style.left = '';
    body.style.right = '';
    body.style.touchAction = '';
    
    html.style.overflow = '';
    html.style.position = '';
    html.style.width = '';
    html.style.height = '';
    
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
    
    setPortfolioViewer(null);
    
    // Go back in history if portfolio was opened (to remove the pushed state)
    if (window.history.state?.portfolioOpen) {
      window.history.back();
    }
  };

  const showPreviousMedia = () =>
    setPortfolioViewer((current) => {
      if (!current || current.items.length <= 1) return current;
      const nextIndex =
        (current.index - 1 + current.items.length) % current.items.length;
      return { ...current, index: nextIndex };
    });

  const showNextMedia = () =>
    setPortfolioViewer((current) => {
      if (!current || current.items.length <= 1) return current;
      const nextIndex = (current.index + 1) % current.items.length;
      return { ...current, index: nextIndex };
    });

  // Handle browser back button when portfolio is open
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (portfolioViewer && !event.state?.portfolioOpen) {
        // User pressed back button while portfolio is open
        // Restore scroll position without triggering history.back() again
        const scrollY = document.body.style.top;
        const html = document.documentElement;
        const body = document.body;
        
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.left = '';
        body.style.right = '';
        body.style.touchAction = '';
        
        html.style.overflow = '';
        html.style.position = '';
        html.style.width = '';
        html.style.height = '';
        
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        
        setPortfolioViewer(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [portfolioViewer]);

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
            backgroundImage: stable.imageUrl
              ? `url(${stable.imageUrl})`
              : "url(/hero-bg.webp)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-full"
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

        <div className="grid gap-8 md:grid-cols-3 items-start max-w-full">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8 w-full min-w-0">
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
                    const today = new Date().toISOString().split("T")[0];
                    const horseSlots = takenSlots[today]?.[horse.id] || [];
                    const availableSlotsToday = availableSlots[today] || [];
                    const takenTimes = horseSlots.map((slot: any) =>
                      new Date(slot.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    );
                    const availableTimes = availableSlotsToday.filter(
                      (time: string) => !takenTimes.includes(time)
                    );

                    const horsePriceLabel =
                      horse.pricePerHour !== null && horse.pricePerHour !== undefined
                        ? `EGP ${Number(horse.pricePerHour).toFixed(0)}/hour`
                        : "Contact for pricing";
                    const horseAge =
                      horse.age !== null && horse.age !== undefined
                        ? `${horse.age} years`
                        : "Not specified";
                    const horseSkills =
                      horse.skills && horse.skills.length > 0
                        ? horse.skills
                        : ["Beginner Friendly", "Tour Guide", "Desert Expert"];
                    const portfolioItems = horse.media?.filter(
                      (item) => typeof item?.url === "string"
                    ) ?? [];
                    const galleryItems =
                      portfolioItems.length > 0
                        ? portfolioItems
                        : horse.imageUrls.slice(1).map((url) => ({
                            type: "image" as const,
                            url,
                          }));
                    const heroImage =
                      portfolioItems.find((item) => item.type === "image")?.url ||
                      horse.imageUrls[0];
                    const modalItems =
                      heroImage && galleryItems.every((item) => item.url !== heroImage)
                        ? [{ type: "image" as const, url: heroImage }, ...galleryItems]
                        : galleryItems;

                    return (
                      <Card key={horse.id} id={`horse-${horse.id}`} className="overflow-hidden">
                        <div className="grid gap-0 md:grid-cols-2">
                          {/* Horse Image */}
                          <button
                            type="button"
                            className="group relative h-64 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary md:h-auto"
                            onClick={() => openPortfolio(horse.name, modalItems, 0)}
                            aria-label={`Open ${horse.name} portfolio`}
                          >
                            {heroImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={heroImage}
                                alt={horse.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                draggable={false}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="mx-auto mb-2 text-5xl">🐴</div>
                                  <p className="text-sm text-muted-foreground">{horse.name}</p>
                                </div>
                              </div>
                            )}
                            <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white shadow-lg transition-opacity group-hover:opacity-100">
                              View portfolio
                            </span>
                          </button>
                          
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
                                <span className="font-bold text-primary text-lg">{horsePriceLabel}</span>
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
          <div className="space-y-6 w-full min-w-0">
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

      {/* Fullscreen Portfolio Viewer - Fixed Position */}
      {portfolioViewer && (
        <div 
          className="fixed inset-0 z-[9999] bg-white/15 overflow-hidden"
          style={{
            backdropFilter: 'blur(60px) saturate(200%) brightness(1.1)',
            WebkitBackdropFilter: 'blur(60px) saturate(200%) brightness(1.1)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {/* Header with Liquid Glass Effect - Clean Design */}
          <div 
            className="fixed top-0 left-0 right-0 z-[10000] flex items-center justify-between p-4 md:p-6"
          >
            <button
              onClick={closePortfolio}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-all border-2 border-white/70 shadow-2xl hover:scale-110 backdrop-blur-xl"
              aria-label="Close"
            >
              <ArrowLeft className="h-8 w-8 stroke-[3]" />
            </button>
            <div className="text-white text-base md:text-lg font-bold bg-black/60 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/50 shadow-xl">
              {portfolioViewer.index + 1} / {portfolioViewer.items.length}
            </div>
          </div>

          {/* Main Image - Crystal Clear & Centered */}
          <div className="fixed inset-0 flex items-center justify-center pt-20 pb-28 md:pt-24 md:pb-32 px-4 md:px-8">
            {portfolioViewer.items[portfolioViewer.index]?.type === "video" ? (
              <video
                key={portfolioViewer.items[portfolioViewer.index]?.url}
                controls
                className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                style={{
                  filter: 'contrast(1.05) brightness(1.02)',
                }}
              >
                <source src={portfolioViewer.items[portfolioViewer.index]?.url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={portfolioViewer.items[portfolioViewer.index]?.url}
                src={portfolioViewer.items[portfolioViewer.index]?.url || "/hero-bg.webp"}
                alt={`${portfolioViewer.horseName} portfolio`}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                style={{
                  filter: 'contrast(1.05) brightness(1.02)',
                }}
                draggable={false}
              />
            )}
          </div>

          {/* Navigation Arrows with Liquid Glass */}
          {portfolioViewer.items.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPreviousMedia}
                className="fixed left-4 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/35 transition-all z-[9999] border border-white/50 shadow-2xl hover:scale-110"
                style={{
                  backdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
                  WebkitBackdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={showNextMedia}
                className="fixed right-4 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/35 transition-all z-[9999] border border-white/50 shadow-2xl hover:scale-110"
                style={{
                  backdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
                  WebkitBackdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
                }}
                aria-label="Next"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Thumbnail Strip with Liquid Glass Effect */}
          {portfolioViewer.items.length > 1 && (
            <div 
              className="fixed bottom-0 left-0 right-0 z-[9999] bg-white/15 border-t border-white/30 p-4 pb-safe shadow-2xl"
              style={{
                backdropFilter: 'blur(30px) saturate(200%) brightness(1.15)',
                WebkitBackdropFilter: 'blur(30px) saturate(200%) brightness(1.15)',
              }}
            >
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {portfolioViewer.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPortfolioViewer(prev => prev ? { ...prev, index: idx } : null)}
                    className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === portfolioViewer.index
                        ? "border-white scale-110 shadow-lg shadow-white/25"
                        : "border-white/40 opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {item.type === "video" ? (
                      <div className="h-full w-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white text-sm">▶</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

