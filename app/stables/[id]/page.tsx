"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import BookingModal from "@/components/shared/BookingModal";

import ReviewsSection, { Review } from "@/components/sections/ReviewsSection";
import StableLocationMap from "@/components/maps/StableLocationMap";
import DynamicAvailability from "@/components/availability/DynamicAvailability";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";



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
  skillLevel?: string;
  adminTier?: string | null;
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
  minLeadTimeHours?: number;
  createdAt: string;
  owner: {
    id: string;
    fullName: string | null;
    email: string;
  };
  horses: Horse[];
  reviews: Review[];
}

// Dynamic availability grouping types
type TimePeriod = 'morning' | 'afternoon' | 'evening';

interface GroupedSlots {
  morning: string[];
  afternoon: string[];
  evening: string[];
}

interface DayGroupedSlots {
  today: GroupedSlots;
  tomorrow: GroupedSlots;
}

// Helper: Determine time period from hour (24h format)
function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

// Helper: Parse time string "10:00 AM" to Date object for today
function parseTimeString(timeStr: string, baseDate: Date): Date {
  const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeParts) return baseDate;

  let hours = parseInt(timeParts[1]);
  const minutes = parseInt(timeParts[2]);
  const ampm = timeParts[3].toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export default function StableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.id as string;

  const [stable, setStable] = useState<Stable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [availableSlots, setAvailableSlots] = useState<Record<string, Record<string, string[]>>>({});
  const [takenSlots, setTakenSlots] = useState<Record<string, Record<string, any[]>>>({});
  const [blockedSlots, setBlockedSlots] = useState<Record<string, Record<string, string[]>>>({});

  const [groupedSlots, setGroupedSlots] = useState<Record<string, DayGroupedSlots>>({});
  const [groupedBlockedSlots, setGroupedBlockedSlots] = useState<Record<string, DayGroupedSlots>>({});

  const [portfolioViewer, setPortfolioViewer] = useState<PortfolioViewerState | null>(null);

  const { data: session } = useSession();
  const [hasBookingWithStable, setHasBookingWithStable] = useState(false);
  const [userBookingDate, setUserBookingDate] = useState<string | null>(null);
  const [bookingSelection, setBookingSelection] = useState<{
    horseId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  } | undefined>(undefined);

  const [userRankPoints, setUserRankPoints] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}/profile`)
        .then(res => res.json())
        .then(data => {
          if (data?.rankPoints) setUserRankPoints(data.rankPoints);
        })
        .catch(err => console.error("Failed to fetch user rank", err));
    }
  }, [session?.user?.id]);

  const getRiderTier = (points: number) => {
    if (points >= 1701) return "ADVANCED";
    if (points >= 1301) return "INTERMEDIATE";
    return "BEGINNER";
  };

  const isHorseLocked = (horse: Horse) => {
    // If user is not logged in or rank not loaded, assume unlocked or handle as needed.
    // However, user reported "BEGINNER rider cannot book ADVANCED horse".
    // If points are null, we might want to default to 0 (Beginner).
    const points = userRankPoints ?? 0;

    const riderTier = getRiderTier(points);
    const horseLevel = horse.adminTier ? horse.adminTier.toUpperCase() : "BEGINNER";

    // Logic:
    // ADVANCED rider can ride anything.
    // INTERMEDIATE rider can ride INTERMEDIATE and BEGINNER.
    // BEGINNER rider can ONLY ride BEGINNER.

    if (riderTier === "ADVANCED") return false; // Unlocked
    if (riderTier === "INTERMEDIATE" && horseLevel !== "ADVANCED") return false; // Unlocked
    if (riderTier === "BEGINNER" && horseLevel === "BEGINNER") return false; // Unlocked

    return true; // Locked
  };

  const handleSlotClick = (horseId: string, timeStr: string, isTomorrow?: boolean) => {
    // 1. Lead Time Validation
    const date = new Date(); // Today
    if (isTomorrow) {
      date.setDate(date.getDate() + 1);
    }

    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = 0;
    let minutes = 0;

    if (timeParts) {
      hours = parseInt(timeParts[1]);
      minutes = parseInt(timeParts[2]);
      const ampm = timeParts[3].toUpperCase();

      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }

    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const leadTimeHours = stable?.minLeadTimeHours || 8;
    const minBookingTime = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);

    if (bookingDateTime < minBookingTime) {
      const { toast } = require("sonner");
      toast.error("Booking time too soon", {
        description: `This stable requires at least ${leadTimeHours} hours notice. Earliest available: ${minBookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        duration: 4000,
      });
      return;
    }

    // 2. Skill Level Validation
    const horse = stable?.horses.find(h => h.id === horseId);
    if (horse && isHorseLocked(horse)) {
      const riderTier = getRiderTier(userRankPoints || 0);
      const horseLevel = horse.adminTier ? horse.adminTier.toUpperCase() : "BEGINNER";

      const { toast } = require("sonner");
      toast.error("Skill Level Mismatch", {
        description: `You are a ${riderTier} rider, but this horse requires ${horseLevel} skills. Please choose another horse.`,
        duration: 4000,
      });
      return;
    }

    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    // Default 1 hour duration
    const endHours = (hours + 1) % 24;
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Redirect to booking page with booking details in URL params
    const bookingParams = new URLSearchParams({
      stableId: id,
      horseId,
      date: date.toISOString().split("T")[0],
      startTime,
      endTime,
    });
    router.push(`/booking?${bookingParams.toString()}`);
  };

  useEffect(() => {
    async function fetchStable() {
      try {
        // Use local date string to avoid UTC shifts
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        const [stableRes, bookingRes] = await Promise.all([
          fetch(`/api/stables/${id}`),
          session?.user?.id ? fetch(`/api/bookings?stableId=${id}&userId=${session.user.id}&status=confirmed`) : Promise.resolve(null)
        ]);

        if (!stableRes.ok) {
          throw new Error("Stable not found");
        }

        const stableData = await stableRes.json();
        setStable(stableData);

        // Check if user has a booking
        if (bookingRes && bookingRes.ok) {
          const bookingData = await bookingRes.json();
          // Handle both array and object response formats
          const bookings = Array.isArray(bookingData) ? bookingData : (bookingData.bookings || []);

          if (Array.isArray(bookings)) {
            // Check for any active booking (confirmed or completed recently)
            const hasActiveBooking = bookings.some((b: any) =>
              b.status === 'confirmed' ||
              (b.status === 'completed' && new Date(b.endTime).getTime() > Date.now() - 24 * 60 * 60 * 1000)
            );

            if (hasActiveBooking) {
              setHasBookingWithStable(true);
              // Find the next upcoming booking date
              const upcoming = bookings
                .filter((b: any) => new Date(b.startTime) > new Date())
                .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

              if (upcoming) {
                setUserBookingDate(new Date(upcoming.startTime).toLocaleDateString());
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching stable:", error);
        setError("Failed to load stable details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStable();
  }, [id, session]);

  // Refresh slots every 15 seconds (more frequent updates)
  useEffect(() => {
    if (!id) return;

    const fetchSlots = async () => {
      try {
        const todayDate = new Date();
        const tomorrowDate = new Date(todayDate);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        const today = todayDate.toISOString().split("T")[0];
        const tomorrow = tomorrowDate.toISOString().split("T")[0];

        // Fetch BOTH days
        const [todayRes, tomorrowRes] = await Promise.all([
          fetch(`/api/stables/${id}/slots?date=${today}`),
          fetch(`/api/stables/${id}/slots?date=${tomorrow}`)
        ]);

        const todayData = todayRes.ok ? await todayRes.json() : [];
        const tomorrowData = tomorrowRes.ok ? await tomorrowRes.json() : [];

        // Combine data processing
        const processSlotsForDate = (slotsData: any[], dateStr: string) => {
          const available: Record<string, string[]> = {};
          const taken: Record<string, any[]> = {};
          const blocked: Record<string, string[]> = {};

          // Initialize
          stable?.horses.forEach(horse => {
            available[horse.id] = [];
            taken[horse.id] = [];
            blocked[horse.id] = [];
          });

          slotsData.forEach((slot: any) => {
            const slotDate = new Date(slot.startTime);
            const hours = slotDate.getHours();
            const minutes = slotDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

            const targetHorses = slot.horseId
              ? [stable?.horses.find(h => h.id === slot.horseId)].filter(Boolean)
              : stable?.horses || [];

            targetHorses.forEach(horse => {
              if (!horse) return;

              if (slot.status === 'booked') {
                if (!taken[horse.id]) taken[horse.id] = [];
                taken[horse.id].push({ ...slot, startTime: slot.startTime });
              } else if (slot.status === 'available') {
                if (!available[horse.id]) available[horse.id] = [];
                available[horse.id].push(time);
              } else {
                // blocked_session or blocked_lead_time
                if (!blocked[horse.id]) blocked[horse.id] = [];
                blocked[horse.id].push(time);
              }
            });
          });
          return { available, taken, blocked };
        };

        const todayProcessed = processSlotsForDate(todayData, today);
        const tomorrowProcessed = processSlotsForDate(tomorrowData, tomorrow);

        setAvailableSlots({
          [today]: todayProcessed.available,
          [tomorrow]: tomorrowProcessed.available
        });
        setTakenSlots({
          [today]: todayProcessed.taken,
          [tomorrow]: tomorrowProcessed.taken
        });
        setBlockedSlots({
          [today]: todayProcessed.blocked,
          [tomorrow]: tomorrowProcessed.blocked
        });

      } catch (err) {
        console.error("Error refreshing slots:", err);
      }
    };

    fetchSlots(); // Fetch immediately
    const interval = setInterval(fetchSlots, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [id, stable]);

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

  // Group slots by horse for DynamicAvailability component
  useEffect(() => {
    if (!stable) return;

    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const today = todayDate.toISOString().split("T")[0];
    const tomorrow = tomorrowDate.toISOString().split("T")[0];

    const leadTimeHours = stable.minLeadTimeHours || 8;
    const minBookingTime = new Date(todayDate.getTime() + leadTimeHours * 60 * 60 * 1000);

    const newGroupedSlots: Record<string, DayGroupedSlots> = {};
    const newGroupedBlockedSlots: Record<string, DayGroupedSlots> = {};

    stable.horses.forEach(horse => {
      // Get raw available times
      const todayAvailable = availableSlots[today]?.[horse.id] || [];
      const tomorrowAvailable = availableSlots[tomorrow]?.[horse.id] || [];

      const todayBlocked = blockedSlots[today]?.[horse.id] || [];
      const tomorrowBlocked = blockedSlots[tomorrow]?.[horse.id] || [];

      // Helper to categorize times
      const categorize = (times: string[]) => {
        const grouped: GroupedSlots = { morning: [], afternoon: [], evening: [] };
        times.forEach(t => {
          const timeParts = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeParts) {
            let h = parseInt(timeParts[1]);
            const ampm = timeParts[3].toUpperCase();
            if (ampm === "PM" && h < 12) h += 12;
            if (ampm === "AM" && h === 12) h = 0;
            grouped[getTimePeriod(h)].push(t);
          }
        });
        return grouped;
      };

      // Filter Today's slots for lead time
      // If a slot is today but < lead time, we DO NOT shift it to tomorrow anymore
      // because we have fetched actual tomorrow slots. We just hide it or mark it blocked.
      // Actually, user might want to see it as blocked.
      // But for now, let's just filter it out from "Available" list.

      const validTodayAvailable = todayAvailable.filter(timeStr => {
        const slotDate = parseTimeString(timeStr, todayDate);
        return slotDate >= minBookingTime;
      });

      // We can add the filtered-out slots to blocked list if we want to show them as gray
      const leadTimeBlocked = todayAvailable.filter(timeStr => {
        const slotDate = parseTimeString(timeStr, todayDate);
        return slotDate < minBookingTime;
      });

      const finalTodayBlocked = [...todayBlocked, ...leadTimeBlocked];

      newGroupedSlots[horse.id] = {
        today: categorize(validTodayAvailable),
        tomorrow: categorize(tomorrowAvailable)
      };

      newGroupedBlockedSlots[horse.id] = {
        today: categorize(finalTodayBlocked),
        tomorrow: categorize(tomorrowBlocked)
      };
    });

    setGroupedSlots(newGroupedSlots);
    setGroupedBlockedSlots(newGroupedBlockedSlots);
  }, [availableSlots, blockedSlots, stable]);

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
      <div className="relative h-[400px] w-full overflow-hidden" role="img" aria-label={`${stable.name} - Horse riding stable in ${stable.location}, Egypt`}>
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

          {/* Video Chat Button */}
          {/* Video Chat Button Removed as per request */}
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

            {/* SEO Content Section */}
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">About {stable.name}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {stable.description}
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Located at <strong>{stable.location} Pyramids</strong>, {stable.name} offers authentic horse riding
                  experiences with stunning views of Egypt's most iconic landmarks. Book your adventure
                  through <strong>PyraRide.com</strong> - Egypt's trusted booking marketplace for horse riding experiences
                  at the pyramids. As part of PyraRide's verified stable network, {stable.name} has been thoroughly
                  inspected for safety, quality, and animal welfare standards.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Why Book {stable.name} on PyraRide?</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Instant booking confirmation</strong> - No waiting for responses</li>
                  <li><strong>Verified stable</strong> with {stable.rating > 0 ? `${stable.rating.toFixed(1)}⭐` : 'excellent'} rating from {stable.totalReviews} {stable.totalReviews === 1 ? 'review' : 'reviews'}</li>
                  <li><strong>Secure online payment</strong> with multiple payment options</li>
                  <li><strong>Best price guarantee</strong> - We'll match or beat any price</li>
                  <li><strong>24/7 customer support</strong> to help with any questions</li>
                  <li><strong>Compare with other stables</strong> before booking - only on PyraRide</li>
                  <li><strong>Verified for safety</strong> - All PyraRide stables meet strict safety and quality standards</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Location & Directions</h2>
                <p className="text-muted-foreground mb-2">
                  {stable.address ? `${stable.address}, ` : ''}<strong>{stable.location}</strong>, Egypt.
                  Easily accessible from Cairo city center, typically a 30-45 minute drive.
                  Free parking is available at most stables.
                </p>
                <p className="text-muted-foreground">
                  GPS coordinates and detailed Google Maps directions are provided in your booking confirmation email.
                  Most hotels in Cairo can arrange transportation, or you can use taxi/Uber services. Some stables
                  offer hotel pickup services for an additional fee.
                </p>
              </div>
            </Card>

            {/* Horses */}
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold">Our Horses</h2>
              {stable.horses.length > 0 ? (
                <div className="space-y-6">
                  {stable.horses.map((horse) => {
                    const today = new Date().toISOString().split("T")[0];
                    const horseSlots = takenSlots[today]?.[horse.id] || [];
                    const availableTimes = availableSlots[today]?.[horse.id] || [];

                    const takenTimes = horseSlots.map((slot: any) =>
                      new Date(slot.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                      })
                    );

                    return (
                      <Card key={horse.id} className="overflow-hidden">
                        <div className="relative h-64 w-full">
                          <Image
                            src={horse.imageUrls[0] || "/horse-placeholder.jpg"}
                            alt={horse.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-4 right-4">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-black/70 text-white hover:bg-black/80"
                              onClick={() => openPortfolio(horse.name, horse.media)}
                            >
                              View portfolio
                            </Button>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h3 className="font-display text-2xl font-bold">{horse.name}</h3>
                              <div className="mb-6">
                                <p className="text-muted-foreground">{horse.description}</p>
                              </div>

                              <div className="border-t pt-4">
                                <h4 className="mb-3 font-semibold">Next Available Rides</h4>
                                <DynamicAvailability
                                  grouped={groupedSlots[horse.id]}
                                  blocked={groupedBlockedSlots[horse.id]}
                                  horseId={horse.id}
                                  onSlotClick={handleSlotClick}
                                  isLocked={isHorseLocked(horse)}
                                />
                              </div>
                            </div>
                          </Card>
                          );
                  })}
                        </div>
                        ) : (
                        <p className="text-muted-foreground">No horses available at this stable.</p>
              )}
                      </div>

            {/* Reviews */ }
                    <div id="reviews">
                      <h2 className="mb-6 font-display text-2xl font-bold">Customer Reviews</h2>
                      <ReviewsSection
                        reviews={stable.reviews}
                        averageStableRating={stable.rating}
                        averageHorseRating={
                          stable.reviews.reduce((acc, r) => acc + r.horseRating, 0) /
                          (stable.reviews.length || 1)
                        }
                        totalReviews={stable.totalReviews}
                      />
                    </div>
          </div>

          {/* Sidebar */}
              <div className="sticky top-24 space-y-6">
                <Card className="p-6">
                  <h3 className="mb-4 font-display text-xl font-bold">Book a Ride</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Select a horse and time slot to book your riding experience.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Instant Confirmation</p>
                        <p className="text-muted-foreground">Book instantly, no waiting</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheckIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Secure Payment</p>
                        <p className="text-muted-foreground">100% secure checkout</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <ThumbsUpIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Best Price Guarantee</p>
                        <p className="text-muted-foreground">We match any price</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Contact Card */}
                <Card className="p-6">
                  <h3 className="mb-4 font-semibold">Need Help?</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Have questions about this stable or need a custom package?
                  </p>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href="mailto:support@pyraride.com">
                      <Mail className="h-4 w-4" />
                      Contact Support
                    </a>
                  </Button>
                </Card>
              </div>
            </div>
          </div>

          {/* Booking Modal */}
          <BookingModal
            open={isBookingModalOpen}
            onOpenChange={setIsBookingModalOpen}
            stableId={stable.id}
            stableName={stable.name}
            horses={stable.horses}
            initialSelection={bookingSelection}
          />

          {/* Portfolio Viewer Overlay */}
          <AnimatePresence>
            {portfolioViewer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
                onClick={closePortfolio}
              >
                {/* Close Button */}
                <button
                  onClick={closePortfolio}
                  className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-8 md:top-8"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Content Container */}
                <div
                  className="relative h-full w-full max-w-7xl px-4 py-12 md:px-12 md:py-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex h-full flex-col items-center justify-center">
                    {/* Main Media */}
                    <div className="relative aspect-video w-full max-h-[80vh] overflow-hidden rounded-lg bg-black shadow-2xl ring-1 ring-white/10">
                      {portfolioViewer.items[portfolioViewer.index].type === 'video' ? (
                        <video
                          src={portfolioViewer.items[portfolioViewer.index].url}
                          controls
                          autoPlay
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Image
                          src={portfolioViewer.items[portfolioViewer.index].url}
                          alt={`${portfolioViewer.horseName} portfolio item ${portfolioViewer.index + 1}`}
                          fill
                          className="object-contain"
                          priority
                        />
                      )}

                      {/* Navigation Arrows */}
                      {portfolioViewer.items.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showPreviousMedia();
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110 md:left-8"
                          >
                            <ChevronLeft className="h-8 w-8" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showNextMedia();
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110 md:right-8"
                          >
                            <ChevronRight className="h-8 w-8" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {portfolioViewer.items.length > 1 && (
                      <div className="mt-6 flex w-full max-w-4xl gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
                        {portfolioViewer.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPortfolioViewer({ ...portfolioViewer, index: idx });
                            }}
                            className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md transition-all ${idx === portfolioViewer.index
                              ? 'ring-2 ring-primary ring-offset-2 ring-offset-black'
                              : 'opacity-50 hover:opacity-100'
                              }`}
                          >
                            {item.type === 'video' ? (
                              <div className="flex h-full w-full items-center justify-center bg-gray-800">
                                <span className="text-xs text-white">Video</span>
                              </div>
                            ) : (
                              <Image
                                src={item.url}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1 text-sm text-white backdrop-blur-sm md:bottom-8">
                      {portfolioViewer.index + 1} / {portfolioViewer.items.length}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        );
}

        function ShieldCheckIcon(props: any) {
  return (
        <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        )
}


        function ThumbsUpIcon(props: any) {
  return (
        <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
        )
}
