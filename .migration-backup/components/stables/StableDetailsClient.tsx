"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
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
    Loader2,
    Settings,
    Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import BookingModal from "@/components/shared/BookingModal";
import { logEvent } from "@/lib/analytics";

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
    imageUrls: string[];
    isActive: boolean;
    pricePerHour?: number | null;
    discountPercent?: number | null;
    color?: string | null;
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
    // User request: 12 PM should be Morning
    if (hour >= 6 && hour <= 12) return 'morning';
    if (hour > 12 && hour < 18) return 'afternoon';
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

function groupSlotsByDayAndPeriod(
    availableSlots: string[],
    leadTimeHours: number,
    currentDate: Date,
    allowShift: boolean = true
): DayGroupedSlots {
    // We need to compare against the ACTUAL current time for lead time check
    const now = new Date();
    const safeBookingTime = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);

    const today: GroupedSlots = { morning: [], afternoon: [], evening: [] };
    const tomorrow: GroupedSlots = { morning: [], afternoon: [], evening: [] };

    availableSlots.forEach(timeStr => {
        const slotDateTime = parseTimeString(timeStr, currentDate);
        const period = getTimePeriod(slotDateTime.getHours());

        if (allowShift && slotDateTime < safeBookingTime) {
            // Slot is within lead time window, push to tomorrow preview
            tomorrow[period].push(timeStr);
        } else if (!allowShift && slotDateTime < safeBookingTime) {
            // Blocked slot rendering: keep in today so it shows grayed out
            today[period].push(timeStr);
        } else {
            // Slot is safe to book today
            today[period].push(timeStr);
        }
    });

    return { today, tomorrow };
}

interface StableDetailsClientProps {
    initialStable: Stable;
    isIsolated?: boolean;
}

function HorseImageCarousel({ modalItems, horseName, tierColor, adminTier, totalImages, openPortfolio }: any) {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const idx = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth);
        setActiveIndex(idx);
    };

    return (
        <div className="relative w-full overflow-hidden bg-muted rounded-t-xl" style={{ aspectRatio: '1/1' }}>
            <div 
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={handleScroll}
            >
                {modalItems.length > 0 ? (
                    modalItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex-none w-full h-full snap-center relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.url}
                                alt={`${horseName} - Image ${idx + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    ))
                ) : (
                    <div className="flex-none w-full h-full snap-center relative flex items-center justify-center text-5xl bg-zinc-100">🐴</div>
                )}
            </div>

            {/* Active Carousel dots */}
            {totalImages > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
                    {Array.from({ length: Math.min(totalImages, 5) }).map((_, i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-200 ${
                                i === activeIndex
                                    ? 'w-5 h-1.5 bg-white'
                                    : 'w-1.5 h-1.5 bg-white/60'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Tier badge */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow ${tierColor}`}>
                    {adminTier || 'Intermediate'}
                </span>
            </div>
        </div>
    );
}

export default function StableDetailsClient({ initialStable, isIsolated = false }: StableDetailsClientProps) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const id = initialStable.id;

    // Initialize date from URL or default to today
    const getInitialDate = () => {
        const dateParam = searchParams.get('date');
        if (dateParam) return new Date(dateParam);
        return new Date();
    };

    const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate);

    const [stable, setStable] = useState<Stable | null>(initialStable);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Analytics: track viewing the stable
    useEffect(() => {
        if (stable?.id) {
            logEvent({
                action: "view_item",
                item_id: stable.id,
                item_name: stable.name,
                item_category: "stable"
            });
        }
    }, [stable?.id]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const [availableSlots, setAvailableSlots] = useState<Record<string, Record<string, string[]>>>({});
    const [takenSlots, setTakenSlots] = useState<Record<string, Record<string, any[]>>>({});
    const [blockedSlots, setBlockedSlots] = useState<Record<string, Record<string, string[]>>>({});

    const [groupedSlots, setGroupedSlots] = useState<Record<string, DayGroupedSlots>>({});
    // Tomorrow's REAL available slots fetched from the API (used to filter out ghost slots)
    const [tomorrowAvailableSlots, setTomorrowAvailableSlots] = useState<Record<string, string[]>>({});
    const [tomorrowBlockedSlots, setTomorrowBlockedSlots] = useState<Record<string, string[]>>({});
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
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [selectedSlotHorse, setSelectedSlotHorse] = useState<string | null>(null);
    const [announcementBanner, setAnnouncementBanner] = useState<string | null>(null);
    // Owner slot management: locally toggled blocked slots (key = `${horseId}-${startISO}`)
    const [ownerToggledSlots, setOwnerToggledSlots] = useState<Set<string>>(new Set());
    const [slotToggling, setSlotToggling] = useState<string | null>(null);

    // Fetch announcement banner for this stable
    useEffect(() => {
        fetch(`/api/stables/${id}/announce`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data?.banner) setAnnouncementBanner(data.banner); })
            .catch(() => {});
    }, [id]);

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

    const isOwnerOfStable = session?.user?.role === "stable_owner" && stable?.owner?.id === session?.user?.id;

    // Owner: toggle a slot blocked/unblocked by calling the API
    const handleOwnerSlotToggle = async (horseId: string, timeStr: string, isTomorrow?: boolean) => {
        const date = new Date(selectedDate);
        if (isTomorrow) date.setDate(date.getDate() + 1);

        const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeParts) return;
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const ampm = timeParts[3].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        // Build UTC ISO times matching what the API generates (offset = 2)
        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        const utcHour = hours - 3; // Egypt is UTC+3
        const startTime = new Date(Date.UTC(y, m, d, utcHour, 0, 0)).toISOString();
        const endTime = new Date(Date.UTC(y, m, d, utcHour + 1, 0, 0)).toISOString();
        const slotKey = `${horseId}-${startTime}`;
        const optKey = `${horseId}-${Boolean(isTomorrow)}-${timeStr}`;

        setSlotToggling(slotKey);
        // Optimistic toggle
        setOwnerToggledSlots(prev => {
            const next = new Set(prev);
            if (next.has(optKey)) next.delete(optKey);
            else next.add(optKey);
            return next;
        });

        try {
            await fetch(`/api/stables/${id}/slots`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ horseId, startTime, endTime }),
            });
        } catch {
            // Revert on failure
            setOwnerToggledSlots(prev => {
                const next = new Set(prev);
                if (next.has(optKey)) next.delete(optKey);
                else next.add(optKey);
                return next;
            });
        } finally {
            setSlotToggling(null);
        }
    };

    const getRiderTier = (points: number) => {
        if (points >= 1701) return "ADVANCED";
        if (points >= 1301) return "INTERMEDIATE";
        return "BEGINNER";
    };

    const isHorseLocked = (horse: Horse) => {
        if (userRankPoints === null) return false;

        const riderTier = getRiderTier(userRankPoints);
        const horseLevel = horse.adminTier ? horse.adminTier.toUpperCase() : "BEGINNER";

        const canBook = (
            (riderTier === "ADVANCED") ||
            (riderTier === "INTERMEDIATE" && horseLevel !== "ADVANCED") ||
            (riderTier === "BEGINNER" && horseLevel === "BEGINNER")
        );

        return !canBook;
    };

    const handleSlotClick = async (horseId: string, timeStr: string, isTomorrow?: boolean) => {
        // ── OWNER MODE: toggle block/unblock ──────────────────────────────
        if (isOwnerOfStable) {
            handleOwnerSlotToggle(horseId, timeStr, isTomorrow);
            return;
        }

        // ── RIDER MODE: existing booking flow ────────────────────────────
        // 1. Lead Time Validation
        const date = new Date(selectedDate);
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

        // 3. Real-time availability verification
        setIsLoadingSlots(true);
        try {
            const dateStrTarget = date.toISOString().split("T")[0];
            const verifyRes = await fetch(`/api/stables/${id}/slots?date=${dateStrTarget}`);
            if (verifyRes.ok) {
                const data = await verifyRes.json();
                const slotTargetTime = new Date(date);
                slotTargetTime.setUTCHours(hours - 3, minutes, 0, 0); // Egypt UTC+3 offset
                
                const foundSlot = data.find((s: any) => 
                     s.horseId === horseId && new Date(s.startTime).getTime() === slotTargetTime.getTime()
                );
                
                if (foundSlot && foundSlot.status !== "available") {
                    const { toast } = require("sonner");
                    toast.error("Slot No Longer Available", {
                        description: "Sorry, this slot was just booked or blocked while you were viewing the page.",
                        duration: 4000,
                    });
                    
                    // Trigger a silent background refresh
                    window.dispatchEvent(new Event("focus"));
                    setIsLoadingSlots(false);
                    return;
                }
            }
        } catch (e) {
            console.error("Slot verification failed:", e);
        }
        setIsLoadingSlots(false);

        // Redirect to booking page with booking details in URL params
        const bookingParams = new URLSearchParams({
            stableId: id,
            horseId,
            date: date.toISOString().split("T")[0],
            startTime,
            endTime,
        });

        logEvent({
            action: "begin_checkout",
            item_id: horseId,
            item_name: horse?.name || "Horse",
            price: horse?.pricePerHour || 0,
            currency: "EGP",
            stable_name: stable?.name,
            booking_date: date.toISOString().split("T")[0]
        });

        router.push(`/booking?${bookingParams.toString()}`);
    };

    // Fetch slots and bookings (initial load + when date changes)
    useEffect(() => {
        let isMounted = true;
        async function fetchSlotsAndBookings() {
            try {
                setIsLoadingSlots(true);
                const dateStr = selectedDate.toISOString().split("T")[0];

                // ONE combined request for today + tomorrow (was 2 separate requests)
                const [slotsRes, bookingRes] = await Promise.all([
                    fetch(`/api/stables/${id}/slots?date=${dateStr}&includeTomorrow=true`),
                    session?.user?.id
                        ? fetch(`/api/bookings?stableId=${id}&userId=${session.user.id}&status=confirmed`)
                        : Promise.resolve(null),
                ]);

                // Check if user has a booking
                if (bookingRes && bookingRes.ok) {
                    const bookingData = await bookingRes.json();
                    const bookings = Array.isArray(bookingData) ? bookingData : (bookingData.bookings || []);
                    if (Array.isArray(bookings)) {
                        const hasActiveBooking = bookings.some((b: any) =>
                            b.status === "confirmed" ||
                            (b.status === "completed" && new Date(b.endTime).getTime() > Date.now() - 24 * 60 * 60 * 1000)
                        );
                        if (hasActiveBooking) {
                            setHasBookingWithStable(true);
                            const upcoming = bookings
                                .filter((b: any) => new Date(b.startTime) > new Date())
                                .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
                            if (upcoming) setUserBookingDate(new Date(upcoming.startTime).toLocaleDateString());
                        }
                    }
                }

                if (slotsRes.ok) {
                    // Parse combined response { today: slots[], tomorrow: slots[] }
                    const data = await slotsRes.json();
                    const todaySlotsData: any[] = data.today || [];
                    const tomorrowSlotsData: any[] = data.tomorrow || [];

                    const newAvailable: Record<string, Record<string, string[]>> = { [dateStr]: {} };
                    const newTaken: Record<string, Record<string, any[]>> = { [dateStr]: {} };
                    const newBlocked: Record<string, Record<string, string[]>> = { [dateStr]: {} };
                    initialStable.horses.forEach((horse: any) => {
                        newAvailable[dateStr][horse.id] = [];
                        newTaken[dateStr][horse.id] = [];
                        newBlocked[dateStr][horse.id] = [];
                    });

                    todaySlotsData.forEach((slot: any) => {
                        const time = new Date(slot.startTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        });
                        const targetHorses = slot.horseId
                            ? [initialStable.horses.find((h: any) => h.id === slot.horseId)].filter(Boolean)
                            : initialStable.horses || [];
                        targetHorses.forEach((horse: any) => {
                            if (!horse) return;
                            if (slot.booking || slot.status === "booked") {
                                if (!newTaken[dateStr][horse.id]) newTaken[dateStr][horse.id] = [];
                                newTaken[dateStr][horse.id].push({ ...slot, startTime: slot.startTime });
                            } else if (slot.status === "blocked" || slot.status === "blocked_session") {
                                if (!newBlocked[dateStr][horse.id]) newBlocked[dateStr][horse.id] = [];
                                newBlocked[dateStr][horse.id].push(time);
                            } else if (slot.status === "available") {
                                if (!newAvailable[dateStr][horse.id]) newAvailable[dateStr][horse.id] = [];
                                newAvailable[dateStr][horse.id].push(time);
                            }
                        });
                    });

                    // Process tomorrow data
                    const tomorrowAvail: Record<string, string[]> = {};
                    const tomorrowBlocked: Record<string, string[]> = {};
                    initialStable.horses.forEach((horse: any) => {
                        tomorrowAvail[horse.id] = [];
                        tomorrowBlocked[horse.id] = [];
                    });
                    tomorrowSlotsData.forEach((slot: any) => {
                        const time = new Date(slot.startTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        });
                        const targetHorses = slot.horseId
                            ? [initialStable.horses.find((h: any) => h.id === slot.horseId)].filter(Boolean)
                            : initialStable.horses || [];
                        targetHorses.forEach((horse: any) => {
                            if (!horse) return;
                            if (slot.status === "blocked" || slot.status === "blocked_session") {
                                if (!tomorrowBlocked[horse.id]) tomorrowBlocked[horse.id] = [];
                                tomorrowBlocked[horse.id].push(time);
                            } else if (slot.status === "available") {
                                if (!tomorrowAvail[horse.id]) tomorrowAvail[horse.id] = [];
                                tomorrowAvail[horse.id].push(time);
                            }
                        });
                    });

                    if (isMounted) {
                        setAvailableSlots(newAvailable);
                        setTakenSlots(newTaken);
                        setBlockedSlots(newBlocked);
                        setTomorrowAvailableSlots(tomorrowAvail);
                        setTomorrowBlockedSlots(tomorrowBlocked);
                    }
                }
            } catch (error) {
                console.error("Error fetching slots:", error);
            } finally {
                if (isMounted) setIsLoadingSlots(false);
            }
        }

        fetchSlotsAndBookings();
        return () => { isMounted = false; };
    }, [id, session, selectedDate, initialStable]);

    // Refresh slots when user returns to tab — replaces polling
    useEffect(() => {
        const handleFocus = () => {
            // Only refresh if tab was hidden for more than 30 seconds
            if (document.hidden) return;
            const dateStr = selectedDate.toISOString().split("T")[0];
            const tomorrowDate = new Date(selectedDate);
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            const tomorrowDateStr = tomorrowDate.toISOString().split("T")[0];

            fetch(`/api/stables/${id}/slots?date=${dateStr}&includeTomorrow=true`)
                .then(res => res.json())
                .then(data => {
                    if (!data.today) return;
                    const newAvailable: Record<string, Record<string, string[]>> = { [dateStr]: {} };
                    const newTaken: Record<string, Record<string, any[]>> = { [dateStr]: {} };
                    const newBlocked: Record<string, Record<string, string[]>> = { [dateStr]: {} };
                    stable?.horses.forEach(horse => {
                        newAvailable[dateStr][horse.id] = [];
                        newTaken[dateStr][horse.id] = [];
                        newBlocked[dateStr][horse.id] = [];
                    });
                    data.today.forEach((slot: any) => {
                        const slotDate = new Date(slot.startTime);
                        const hours = slotDate.getHours();
                        const minutes = slotDate.getMinutes();
                        const ampm = hours >= 12 ? "PM" : "AM";
                        const displayHours = hours % 12 || 12;
                        const time = `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
                        const targetHorses = slot.horseId ? [stable?.horses.find(h => h.id === slot.horseId)].filter(Boolean) : stable?.horses || [];
                        targetHorses.forEach((horse: any) => {
                            if (!horse) return;
                            if (slot.status === "booked") {
                                newTaken[dateStr][horse.id].push({ ...slot });
                            } else if (slot.status === "blocked" || slot.status === "blocked_session") {
                                newBlocked[dateStr][horse.id].push(time);
                            } else if (slot.status === "available") {
                                newAvailable[dateStr][horse.id].push(time);
                            }
                        });
                    });
                    setAvailableSlots(newAvailable);
                    setTakenSlots(newTaken);
                    setBlockedSlots(newBlocked);
                    // Update tomorrow slots
                    const tomorrowAvail: Record<string, string[]> = {};
                    const tomorrowBlocked: Record<string, string[]> = {};
                    stable?.horses.forEach(horse => {
                        tomorrowAvail[horse.id] = [];
                        tomorrowBlocked[horse.id] = [];
                    });
                    (data.tomorrow || []).forEach((slot: any) => {
                        const slotDate = new Date(slot.startTime);
                        const hours = slotDate.getHours();
                        const minutes = slotDate.getMinutes();
                        const ampm = hours >= 12 ? "PM" : "AM";
                        const displayHours = hours % 12 || 12;
                        const time = `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
                        const targetHorses = slot.horseId ? [stable?.horses.find(h => h.id === slot.horseId)].filter(Boolean) : stable?.horses || [];
                        targetHorses.forEach((horse: any) => {
                            if (!horse) return;
                            if (slot.status === "blocked" || slot.status === "blocked_session") {
                                tomorrowBlocked[horse.id].push(time);
                            } else if (slot.status === "available") {
                                tomorrowAvail[horse.id].push(time);
                            }
                        });
                    });
                    setTomorrowAvailableSlots(tomorrowAvail);
                    setTomorrowBlockedSlots(tomorrowBlocked);
                })
                .catch(err => console.error("Focus refresh failed:", err));
        };

        document.addEventListener("visibilitychange", handleFocus);
        window.addEventListener("focus", handleFocus);
        return () => {
            document.removeEventListener("visibilitychange", handleFocus);
            window.removeEventListener("focus", handleFocus);
        };
    }, [id, stable, selectedDate]);

    // Scroll to horse hash anchor ONLY on initial load
    const hasScrolledRef = useRef(false);

    useEffect(() => {
        if (isLoading || !stable) return;
        if (typeof window === "undefined") return;
        if (hasScrolledRef.current) return;

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
            hasScrolledRef.current = true;
        });
    }, [isLoading, stable]);

    // Group slots by horse for DynamicAvailability component
    useEffect(() => {
        if (!stable) return;
        if (isLoadingSlots) return;

        const dateStr = selectedDate.toISOString().split("T")[0];
        const leadTimeHours = stable.minLeadTimeHours || 8;
        const currentDate = new Date(selectedDate);

        const newGroupedSlots: Record<string, DayGroupedSlots> = {};
        const newGroupedBlockedSlots: Record<string, DayGroupedSlots> = {};

        stable.horses.forEach(horse => {
            const availableTimes = availableSlots[dateStr]?.[horse.id] || [];
            const blockedTimes = blockedSlots[dateStr]?.[horse.id] || [];

            const grouped = groupSlotsByDayAndPeriod(
                availableTimes,
                leadTimeHours,
                currentDate,
                true
            );

            // CRITICAL FIX: Filter the "tomorrow" bucket against real tomorrow data.
            // Only keep a slot in the tomorrow preview if it actually exists as available in tomorrow's API response.
            const realTomorrowTimes = tomorrowAvailableSlots[horse.id] || [];
            if (realTomorrowTimes.length > 0) {
                // Keep shifted slots only if they match a real available slot tomorrow
                (['morning', 'afternoon', 'evening'] as const).forEach(period => {
                    grouped.tomorrow[period] = grouped.tomorrow[period].filter(
                        time => realTomorrowTimes.includes(time)
                    );
                });
            }
            // If we have NO real tomorrow data yet, clear the tomorrow bucket entirely to avoid ghost slots
            if (realTomorrowTimes.length === 0 && (grouped.tomorrow.morning.length > 0 || grouped.tomorrow.afternoon.length > 0 || grouped.tomorrow.evening.length > 0)) {
                grouped.tomorrow = { morning: [], afternoon: [], evening: [] };
            }

            newGroupedSlots[horse.id] = grouped;

            newGroupedBlockedSlots[horse.id] = groupSlotsByDayAndPeriod(
                blockedTimes,
                leadTimeHours,
                currentDate,
                false
            );
            
            // Fix: groupSlotsByDayAndPeriod doesn't put "tomorrow" slots into the tomorrow bucket 
            // when allowShift is false. We must manually group the real tomorrow blocked slots.
            const realTomorrowBlocked = tomorrowBlockedSlots[horse.id] || [];
            if (realTomorrowBlocked.length > 0) {
                const tomorrowDate = new Date(currentDate);
                tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                const groupedRealTomorrowBlocked = groupSlotsByDayAndPeriod(
                    realTomorrowBlocked,
                    leadTimeHours,
                    tomorrowDate,
                    false
                );
                newGroupedBlockedSlots[horse.id].tomorrow = groupedRealTomorrowBlocked.today;
            }
        });

        setGroupedSlots(newGroupedSlots);
        setGroupedBlockedSlots(newGroupedBlockedSlots);
    }, [availableSlots, blockedSlots, tomorrowAvailableSlots, tomorrowBlockedSlots, stable, selectedDate]);

    const openPortfolio = (horseName: string, items: HorseMediaItem[], startIndex = 0) => {
        if (!items || items.length === 0) return;

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

        window.history.pushState({ portfolioOpen: true }, '', window.location.href);

        setPortfolioViewer({
            horseName,
            items,
            index: Math.min(Math.max(startIndex, 0), items.length - 1),
        });
    };

    const closePortfolio = () => {
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

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (portfolioViewer && !event.state?.portfolioOpen) {
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

    if (!stable) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Back Button (Hidden if isolated) */}
            {!isIsolated && (
                <div className="border-b border-border bg-card/50 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-lg">
                    <div className="mx-auto max-w-5xl px-4 md:px-8">
                        <Link href="/stables">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Stables
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Announcement Banner (shown if the stable owner set one) */}
            {announcementBanner && (
                <div className="bg-amber-50 border-b border-amber-200">
                    <div className="mx-auto max-w-5xl px-4 py-2.5 flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-800 font-medium">{announcementBanner}</p>
                    </div>
                </div>
            )}

            {/* Owner Toolbar — only visible to the stable owner */}
            {session?.user?.role === "stable_owner" && stable.owner.id === session.user.id && (
                <div className="bg-black/90 border-b border-white/10">
                    <div className="mx-auto max-w-5xl px-4 py-2.5 flex items-center justify-between">
                        <span className="text-xs text-white/60 font-semibold uppercase tracking-widest">🏇 Owner View</span>
                        <Link href="/dashboard/stable/os">
                            <button className="inline-flex items-center gap-2 rounded-full bg-white text-black text-xs font-bold px-4 py-2 shadow hover:bg-white/90 transition-colors">
                                <Settings className="h-3.5 w-3.5" />
                                Manage Stable OS
                            </button>
                        </Link>
                    </div>
                </div>
            )}

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
                </motion.div>

                <div className="grid gap-8 md:grid-cols-3 items-start max-w-full">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8 w-full min-w-0">
                        {/* Horses */}
                        <div id="horses-section">
                            <h2 className="mb-6 font-display text-2xl font-bold">Our Horses</h2>
                            {stable.horses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {stable.horses.map((horse) => {
                                        const dateStr = selectedDate.toISOString().split("T")[0];
                                        const horseSlots = takenSlots[dateStr]?.[horse.id] || [];
                                        const availableTimes = availableSlots[dateStr]?.[horse.id] || [];

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
                                        const totalImages = modalItems.length;

                                        const SKILL_LABELS: Record<string, string> = {
                                            "Adab": "Well-Mannered",
                                            "Levade": "Trained Dancer",
                                            "Impulsion": "Energetic",
                                            "Mettle": "Confident",
                                            "Bolt": "Fast Runner",
                                            "Nerve": "Fearless",
                                            "Impeccable Manners": "Gentle",
                                            "Beginner Friendly": "Beginner Friendly"
                                        };
                                        const horseSkills = horse.skills && horse.skills.length > 0 ? horse.skills : [];
                                        const isSlotOpen = selectedSlotHorse === horse.id;

                                        // Discount calculation
                                        const originalPrice = horse.pricePerHour;
                                        const discount = horse.discountPercent;
                                        const discountedPrice = originalPrice && discount
                                            ? Math.round(originalPrice * (1 - discount / 100))
                                            : null;

                                        // Tier color
                                        const tierColor =
                                            horse.adminTier === 'Advanced' ? 'bg-red-500' :
                                            horse.adminTier === 'Intermediate' ? 'bg-amber-500' :
                                            'bg-emerald-500';

                                        return (
                                            <div
                                                key={horse.id}
                                                id={`horse-${horse.id}`}
                                                className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
                                            >
                                                {/* Image Section */}
                                                {/* Image Section - Scrollable Carousel */}
                                                <HorseImageCarousel
                                                    modalItems={modalItems}
                                                    horseName={horse.name}
                                                    tierColor={tierColor}
                                                    adminTier={horse.adminTier}
                                                    totalImages={totalImages}
                                                />

                                                {/* Info Section */}
                                                <div className="px-3.5 pt-3 pb-3.5 border-t-0">
                                                    {/* Title & Color Row */}
                                                    <div className="flex items-start justify-between mb-1">
                                                        <h3 className="font-bold text-[19px] leading-tight text-foreground truncate pl-1">{horse.name}</h3>
                                                        {horse.color && (
                                                            <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground shrink-0 ml-2 mt-0.5">
                                                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-700/60 border border-border" />
                                                                {horse.color}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Location row */}
                                                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground mb-2.5 pl-1">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="truncate">{stable.name}</span>
                                                    </div>

                                                    {/* Skills chips */}
                                                    {horseSkills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-3 pl-1">
                                                            {horseSkills.slice(0, 3).map((skill, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/60"
                                                                >
                                                                    {SKILL_LABELS[skill] || skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Price + Book button */}
                                                    <div className="flex items-center justify-between mt-1 pt-1">
                                                        <div className="flex items-baseline gap-1 pl-1">
                                                            {discountedPrice ? (
                                                                <>
                                                                    <span className="font-bold text-base text-foreground">{discountedPrice.toLocaleString()} EGP</span>
                                                                    <span className="text-[11px] text-muted-foreground line-through ml-1">{originalPrice?.toLocaleString()}</span>
                                                                </>
                                                            ) : (
                                                                <span className="font-bold text-[18px] text-foreground">{originalPrice?.toLocaleString() || "0"} EGP</span>
                                                            )}
                                                            <span className="font-normal text-[13px] text-muted-foreground">/hr</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSlotHorse(isSlotOpen ? null : horse.id)}
                                                            className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] text-white text-[15px] font-bold px-6 py-3 shadow hover:bg-black active:scale-95 transition-all duration-150"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                                            {isSlotOpen ? 'Close' : 'Book Now'}
                                                        </button>
                                                    </div>

                                                    {/* Slot Picker — expands inline */}
                                                    {isSlotOpen && (
                                                        <div className="mt-4 pt-4 border-t border-border">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pick a slot</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                                                                        onClick={() => {
                                                                            const prevDate = new Date(selectedDate);
                                                                            prevDate.setDate(prevDate.getDate() - 1);
                                                                            const today = new Date(); today.setHours(0, 0, 0, 0);
                                                                            if (prevDate >= today) setSelectedDate(prevDate);
                                                                        }}
                                                                        disabled={(() => {
                                                                            const prevDate = new Date(selectedDate);
                                                                            prevDate.setDate(prevDate.getDate() - 1);
                                                                            const today = new Date(); today.setHours(0, 0, 0, 0);
                                                                            return prevDate < today;
                                                                        })()}
                                                                    >
                                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <span className="text-xs font-medium min-w-[72px] text-center">
                                                                        {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                                                        onClick={() => {
                                                                            const nextDate = new Date(selectedDate);
                                                                            nextDate.setDate(nextDate.getDate() + 1);
                                                                            setSelectedDate(nextDate);
                                                                        }}
                                                                    >
                                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="min-h-[120px] relative">
                                                                {isLoadingSlots && (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10 rounded-md">
                                                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                                    </div>
                                                                )}
                                                                <DynamicAvailability
                                                                    grouped={groupedSlots[horse.id]}
                                                                    blocked={!isOwnerOfStable ? undefined : groupedBlockedSlots[horse.id]}
                                                                    horseId={horse.id}
                                                                    onSlotClick={handleSlotClick}
                                                                    isLocked={isHorseLocked(horse)}
                                                                    selectedDate={selectedDate}
                                                                    ownerToggledSlots={ownerToggledSlots}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                                    <p className="text-muted-foreground">No horses listed yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Location & Map — moved below horses for better UX */}
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

                        {/* About Section — moved below horses */}
                        <Card className="p-6 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-4">About {stable.name}</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {stable.description}
                                </p>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    Located at <strong>{stable.location} Pyramids</strong>, {stable.name} offers authentic horse riding
                                    experiences with stunning views of Egypt&apos;s most iconic landmarks. Book your adventure
                                    through <strong>PyraRides.com</strong> - Egypt&apos;s trusted booking marketplace for horse riding experiences
                                    at the pyramids. As part of PyraRides&apos;s verified stable network, {stable.name} has been thoroughly
                                    inspected for safety, quality, and animal welfare standards.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold mb-4">Why Book {stable.name} on PyraRides?</h2>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                    <li><strong>Instant booking confirmation</strong> - No waiting for responses</li>
                                    <li><strong>Verified stable</strong> with {stable.rating > 0 ? `${stable.rating.toFixed(1)}⭐` : 'excellent'} rating from {stable.totalReviews} {stable.totalReviews === 1 ? 'review' : 'reviews'}</li>
                                    <li><strong>Secure online payment</strong> with multiple payment options</li>
                                    <li><strong>24/7 customer support</strong> to help with any questions</li>
                                    <li><strong>Compare with other stables</strong> before booking - only on PyraRides</li>
                                    <li><strong>Verified for safety</strong> - All PyraRides stables meet strict safety and quality standards</li>
                                </ul>
                            </div>
                        </Card>

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
                                        duration: 0.2,
                                        ease: "easeInOut"
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
            {/* Sticky CTA — Mobile only — scrolls to horses section */}
            <button
                onClick={() => {
                    const el = document.getElementById('horses-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden bg-primary text-white px-6 py-3 rounded-full shadow-lg shadow-primary/30 font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
                aria-label="Scroll to horses and book"
            >
                🐴 View Horses &amp; Book
            </button>
        </div>
    );
}
