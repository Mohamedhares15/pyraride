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

// Helper: Group slots by day and time period with lead time filtering
function groupSlotsByDayAndPeriod(
  availableSlots: string[],
  leadTimeHours: number,
  currentDate: Date = new Date(),
  allowShift: boolean = true
): DayGroupedSlots {
  const safeBookingTime = new Date(currentDate.getTime() + leadTimeHours * 60 * 60 * 1000);

  const today: GroupedSlots = { morning: [], afternoon: [], evening: [] };
  const tomorrow: GroupedSlots = { morning: [], afternoon: [], evening: [] };

  availableSlots.forEach(timeStr => {
    const slotDateTime = parseTimeString(timeStr, currentDate);
    const period = getTimePeriod(slotDateTime.getHours());

    if (allowShift && slotDateTime < safeBookingTime) {
      // Slot is within lead time window, push to tomorrow
      tomorrow[period].push(timeStr);
    } else {
      // Slot is safe to book today
      today[period].push(timeStr);
    }
  });

  return { today, tomorrow };
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
    if (userRankPoints === null) return false; // Assume unlocked if rank not loaded yet? Or locked? Let's assume unlocked or handle gracefully.
    // Actually, if rank is not loaded, maybe we shouldn't lock yet.

    const riderTier = getRiderTier(userRankPoints);
    const horseLevel = horse.adminTier ? horse.adminTier.toUpperCase() : "BEGINNER";

    const canBook = (
      (riderTier === "ADVANCED") ||
      (riderTier === "INTERMEDIATE" && horseLevel !== "ADVANCED") ||
      (riderTier === "BEGINNER" && horseLevel === "BEGINNER")
    );

    return !canBook;
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

        const [stableRes, slotsRes, bookingRes] = await Promise.all([
          fetch(`/api/stables/${id}`),
          fetch(`/api/stables/${id}/slots?date=${today}`),
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

        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          // Process slots into available/taken maps
          const newAvailable: Record<string, Record<string, string[]>> = { [today]: {} };
          const newTaken: Record<string, Record<string, any[]>> = { [today]: {} };

          // Initialize for all horses
          stableData.horses.forEach((horse: any) => {
            newAvailable[today][horse.id] = [];
            newTaken[today][horse.id] = [];
          });

          slotsData.forEach((slot: any) => {
            const time = new Date(slot.startTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true
            });

            // If horseId is null, it applies to ALL horses
            const targetHorses = slot.horseId
              ? [stableData.horses.find((h: any) => h.id === slot.horseId)].filter(Boolean)
              : stableData.horses || [];

            targetHorses.forEach((horse: any) => {
              if (!horse) return;

              if (slot.booking) {
                if (!newTaken[today][horse.id]) newTaken[today][horse.id] = [];
                newTaken[today][horse.id].push({ ...slot, startTime: slot.startTime });
              } else {
                if (!newAvailable[today][horse.id]) newAvailable[today][horse.id] = [];
                newAvailable[today][horse.id].push(time);
              }
            });
          });

          setAvailableSlots(newAvailable);
          setTakenSlots(newTaken);
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
        const today = new Date().toISOString().split("T")[0];
        const slotsRes = await fetch(`/api/stables/${id}/slots?date=${today}`);

        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          // Process slots into available/taken/blocked maps
          const newAvailable: Record<string, Record<string, string[]>> = { [today]: {} };
          const newTaken: Record<string, Record<string, any[]>> = { [today]: {} };
          const newBlocked: Record<string, Record<string, string[]>> = { [today]: {} };

          // Initialize for all horses
          stable?.horses.forEach(horse => {
            newAvailable[today][horse.id] = [];
            newTaken[today][horse.id] = [];
            newBlocked[today][horse.id] = [];
          });

          slotsData.forEach((slot: any) => {
            // Parse the slot time and display in local time, ensuring consistency
            const slotDate = new Date(slot.startTime);
            // Use getHours/getMinutes to get local time components directly
            const hours = slotDate.getHours();
            const minutes = slotDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

            // If horseId is null, it applies to ALL horses
            const targetHorses = slot.horseId
              ? [stable?.horses.find(h => h.id === slot.horseId)].filter(Boolean)
              : stable?.horses || [];

            targetHorses.forEach(horse => {
              if (!horse) return;

              // Handle new statuses
              if (slot.status === 'booked') {
                if (!newTaken[today][horse.id]) newTaken[today][horse.id] = [];
                newTaken[today][horse.id].push({ ...slot, startTime: slot.startTime });
              } else if (slot.status === 'available') {
                if (!newAvailable[today][horse.id]) newAvailable[today][horse.id] = [];
                newAvailable[today][horse.id].push(time);
              } else {
                // blocked_session or blocked_lead_time
                if (!newBlocked[today][horse.id]) newBlocked[today][horse.id] = [];
                newBlocked[today][horse.id].push(time);
              }
            });
          });

          setAvailableSlots(newAvailable);
          setTakenSlots(newTaken);
          // We need to add a state for blocked slots or merge them into taken slots with a flag
          // For now, let's merge them into taken slots but with a special flag so UI can render them differently
          // Actually, let's add a new state for blocked slots
          setBlockedSlots(newBlocked);
        }
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

    const today = new Date().toISOString().split("T")[0];
    const leadTimeHours = stable.minLeadTimeHours || 8;
    const currentDate = new Date();

    const newGroupedSlots: Record<string, DayGroupedSlots> = {};
    const newGroupedBlockedSlots: Record<string, DayGroupedSlots> = {};

    stable.horses.forEach(horse => {
      const availableTimes = availableSlots[today]?.[horse.id] || [];
      const blockedTimes = blockedSlots[today]?.[horse.id] || [];

      // Available slots: Allow shifting to tomorrow if missed lead time
      newGroupedSlots[horse.id] = groupSlotsByDayAndPeriod(
        availableTimes,
        leadTimeHours,
        currentDate,
        true // allowShift
      );

      // Blocked slots: NEVER shift to tomorrow. They are blocked for today.
      newGroupedBlockedSlots[horse.id] = groupSlotsByDayAndPeriod(
        blockedTimes,
        leadTimeHours,
        currentDate,
        false // allowShift
      );
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
                      })
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
                                alt={`${horse.name} - Horse available for riding at ${stable.name} in ${stable.location}, Egypt. ${horse.description ? horse.description.substring(0, 80) : 'Professional horse with excellent training.'}`}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                draggable={false}
                                loading="lazy"
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
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-2xl">{horse.name}</h3>
                                <Badge className={`${(horse.adminTier === 'Advanced') ? 'bg-red-500 hover:bg-red-600' :
                                  (horse.adminTier === 'Intermediate') ? 'bg-yellow-500 hover:bg-yellow-600' :
                                    'bg-green-500 hover:bg-green-600'
                                  } text-white border-0`}>
                                  {horse.adminTier || 'Beginner'}
                                </Badge>
                              </div>
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
                            </div>

                            {/* Next Available Rides */}
                            <div className="mt-6 border-t pt-4">
                              <h4 className="mb-3 text-sm font-semibold">Next Available Rides</h4>
                              <DynamicAvailability
                                grouped={groupedSlots[horse.id]}
                                blocked={groupedBlockedSlots[horse.id]}
                                horseId={horse.id}
                                onSlotClick={handleSlotClick}
                                isLocked={isHorseLocked(horse)}
                              />
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
                  onClick={() => {
                    // Redirect to booking page - user can select horse and time there
                    router.push(`/booking?stableId=${stable.id}`);
                  }}
                >
                  Book Now
                </Button>
              ) : (
                <div className="space-y-3">
                  <Link href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`} className="w-full">
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      Sign In to Book
                    </Button>
                  </Link>
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
          onOpenChange={(open) => {
            setIsBookingModalOpen(open);
            if (!open) setBookingSelection(undefined);
          }}
          stableId={stable.id}
          stableName={stable.name}
          horses={stable.horses}
          initialSelection={bookingSelection}
        />
      )}

      {/* Fullscreen Portfolio Viewer - Apple Liquid Glass Effect */}
      {portfolioViewer && (
        <>
          {/* Layer 1: Base Blur - Creates the frosted glass foundation */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100dvh',
              maxHeight: '100vh',
              zIndex: 9996,
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              overflow: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          />

          {/* Layer 2: Color Tint - Warm golden overlay for desert/pyramid soul */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100dvh',
              maxHeight: '100vh',
              zIndex: 9997,
              background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.08) 0%, rgba(184, 134, 11, 0.06) 50%, rgba(139, 69, 19, 0.04) 100%)',
              overflow: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          />

          {/* Layer 3: Vibrancy & Luminosity - Apple's signature glow */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100dvh',
              maxHeight: '100vh',
              zIndex: 9998,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'brightness(1.15) contrast(1.05)',
              WebkitBackdropFilter: 'brightness(1.15) contrast(1.05)',
              mixBlendMode: 'overlay',
              overflow: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          />

          {/* Content Layer - Mobile viewport fix */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100dvh', // Dynamic viewport height for mobile
              maxHeight: '100vh', // Fallback for older browsers
              zIndex: 9999,
              overflow: 'hidden',
              transform: 'translateZ(0)', // Force hardware acceleration
              WebkitTransform: 'translateZ(0)',
            }}
          >
            {/* Header with Liquid Glass Effect - Clean Design */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                zIndex: 1000,
              }}
            >
              <button
                onClick={closePortfolio}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                className="hover:bg-black/40 hover:scale-105 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/90 drop-shadow-md">
                  {portfolioViewer.index + 1} / {portfolioViewer.items.length}
                </span>
              </div>

              <div style={{ width: '40px' }} /> {/* Spacer for balance */}
            </div>

            {/* Main Content Area - Centered & Responsive */}
            <div
              className="flex h-full w-full items-center justify-center p-4 md:p-8"
              onClick={(e) => {
                // Close if clicking outside image
                if (e.target === e.currentTarget) closePortfolio();
              }}
            >
              <AnimatePresence mode="wait" custom={portfolioViewer.index}>
                <motion.div
                  key={portfolioViewer.index}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                  className="relative max-h-[85vh] max-w-[95vw] overflow-hidden rounded-2xl shadow-2xl md:max-w-5xl"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {portfolioViewer.items[portfolioViewer.index].type === "video" ? (
                    <div className="relative aspect-video w-full min-w-[300px] md:min-w-[600px] bg-black">
                      <video
                        src={portfolioViewer.items[portfolioViewer.index].url}
                        controls
                        autoPlay
                        className="h-full w-full object-contain"
                        style={{ maxHeight: '80vh' }}
                      />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portfolioViewer.items[portfolioViewer.index].url}
                      alt={`${portfolioViewer.horseName} - Image ${portfolioViewer.index + 1}`}
                      className="h-auto w-full object-contain"
                      style={{
                        maxHeight: '80vh',
                        maxWidth: '100%',
                        display: 'block'
                      }}
                      draggable={false}
                    />
                  )}

                  {/* Caption Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">
                      {portfolioViewer.horseName}
                    </h3>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons - Desktop */}
            {portfolioViewer.items.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPortfolioViewer(prev => {
                      if (!prev) return null;
                      const newIndex = prev.index === 0 ? prev.items.length - 1 : prev.index - 1;
                      return { ...prev, index: newIndex };
                    });
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all hover:bg-black/40 hover:scale-110 active:scale-95 z-50"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPortfolioViewer(prev => {
                      if (!prev) return null;
                      const newIndex = prev.index === prev.items.length - 1 ? 0 : prev.index + 1;
                      return { ...prev, index: newIndex };
                    });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all hover:bg-black/40 hover:scale-110 active:scale-95 z-50"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Thumbnail Strip - Apple Liquid Glass with Golden Warmth */}
            {portfolioViewer.items.length > 1 && (
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-2xl flex gap-3 overflow-x-auto max-w-[90vw] scrollbar-hide z-50"
                style={{
                  background: 'rgba(20, 20, 20, 0.4)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                }}
              >
                {portfolioViewer.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPortfolioViewer(prev => prev ? { ...prev, index: idx } : null)}
                    className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${idx === portfolioViewer.index
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
                        alt={`${portfolioViewer.horseName} - Thumbnail ${idx + 1} of ${portfolioViewer.items.length} from ${stable.name} portfolio`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
