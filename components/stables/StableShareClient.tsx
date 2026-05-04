"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MapPin, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import Link from "next/link";

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
  adminTier?: string | null;
  media: HorseMediaItem[];
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
  owner: { id: string; fullName: string | null; email: string };
  horses: Horse[];
  reviews: any[];
}

interface Props {
  initialStable: Stable;
}

const SKILL_LABELS: Record<string, string> = {
  Adab: "Well-Mannered",
  Levade: "Trained Dancer",
  Impulsion: "Energetic",
  Mettle: "Confident",
  Bolt: "Fast Runner",
  Nerve: "Fearless",
  "Impeccable Manners": "Gentle",
  "Beginner Friendly": "Beginner Friendly",
};

function HorseShareCarousel({
  modalItems,
  horseName,
  tierColor,
  adminTier,
  totalImages,
}: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const idx = Math.round(
      e.currentTarget.scrollLeft / e.currentTarget.clientWidth
    );
    setActiveIndex(idx);
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-muted rounded-t-xl"
      style={{ aspectRatio: "1/1" }}
    >
      <div
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={handleScroll}
      >
        {modalItems.length > 0 ? (
          (modalItems || []).map((item: any, idx: number) => (
            <div key={idx} className="flex-none w-full h-full snap-center relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={`${horseName} - Photo ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <div className="flex-none w-full h-full flex items-center justify-center text-5xl bg-zinc-100">
            🐴
          </div>
        )}
      </div>

      {/* Dots */}
      {totalImages > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
          {Array.from({ length: Math.min(totalImages, 5) }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Tier badge */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow ${tierColor}`}
        >
          {adminTier || "Intermediate"}
        </span>
      </div>
    </div>
  );
}

export default function StableShareClient({ initialStable }: Props) {
  const { data: session } = useSession();
  const stable = initialStable;
  const [bookingSelection, setBookingSelection] = useState<{
    horseId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  } | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlotHorse, setSelectedSlotHorse] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Record<string, Record<string, string[]>>>({});
  const [takenSlots, setTakenSlots] = useState<Record<string, Record<string, string[]>>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (!selectedSlotHorse) return;
    const dateStr = selectedDate.toISOString().split("T")[0];
    if (availableSlots[dateStr]?.[selectedSlotHorse]) return;

    setIsLoadingSlots(true);
    fetch(`/api/stables/${stable.id}/slots?date=${dateStr}&horseId=${selectedSlotHorse}`)
      .then((r) => r.json())
      .then((data) => {
        setAvailableSlots((prev) => ({
          ...prev,
          [dateStr]: { ...(prev[dateStr] || {}), [selectedSlotHorse]: data.available || [] },
        }));
        setTakenSlots((prev) => ({
          ...prev,
          [dateStr]: { ...(prev[dateStr] || {}), [selectedSlotHorse]: data.taken || [] },
        }));
      })
      .finally(() => setIsLoadingSlots(false));
  }, [selectedSlotHorse, selectedDate, stable.id]);

  const handleSlotSelect = (horseId: string, time: string) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const [h, m] = time.replace(/ (AM|PM)/, "").split(":").map(Number);
    const isPM = time.includes("PM");
    const hour = isPM && h < 12 ? h + 12 : !isPM && h === 12 ? 0 : h;
    const start = new Date(selectedDate);
    start.setHours(hour, m || 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);

    setBookingSelection({
      horseId,
      date: dateStr,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative w-full overflow-hidden" style={{ height: "40vw", maxHeight: 320, minHeight: 160 }}>
        {stable.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stable.imageUrl}
            alt={stable.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-amber-700 flex items-center justify-center text-7xl">🐴</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <h1 className="text-2xl font-bold text-white leading-tight">{stable.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {stable.location}
            </span>
            {stable.totalReviews > 0 && (
              <span className="flex items-center gap-1 text-white/80 text-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {stable.rating.toFixed(1)} ({stable.totalReviews} reviews)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Horses */}
        <div>
          <h2 className="text-xl font-bold mb-4">Available Horses</h2>
          {stable.horses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(stable.horses || []).map((horse) => {
                const allImages = [
                  ...(horse.media?.filter((m) => m.type === "image").map((m) => m.url) || []),
                  ...(horse.imageUrls || []),
                ];
                const uniqueImages = Array.from(new Set(allImages));
                const modalItems = (uniqueImages || []).map((url) => ({ url, type: "image" as const }));
                const totalImages = modalItems.length;
                const horseSkills = horse.skills || [];
                const originalPrice = horse.pricePerHour;
                const discount = horse.discountPercent;
                const discountedPrice =
                  originalPrice && discount
                    ? Math.round(originalPrice * (1 - discount / 100))
                    : null;
                const tierColor =
                  horse.adminTier === "Advanced"
                    ? "bg-red-500"
                    : horse.adminTier === "Intermediate"
                    ? "bg-amber-500"
                    : "bg-emerald-500";
                const isOpen = selectedSlotHorse === horse.id;
                const dateStr = selectedDate.toISOString().split("T")[0];
                const slots = availableSlots[dateStr]?.[horse.id] || [];
                const taken = takenSlots[dateStr]?.[horse.id] || [];

                return (
                  <motion.div
                    key={horse.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm"
                  >
                    <HorseShareCarousel
                      modalItems={modalItems}
                      horseName={horse.name}
                      tierColor={tierColor}
                      adminTier={horse.adminTier}
                      totalImages={totalImages}
                    />

                    <div className="px-3.5 pt-3 pb-3.5">
                      {/* Name & color */}
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-[19px] leading-tight truncate">{horse.name}</h3>
                        {horse.color && (
                          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground shrink-0 ml-2 mt-0.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-700/60 border border-border" />
                            {horse.color}
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-2.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{stable.name}</span>
                      </div>

                      {/* Skill chips */}
                      {horseSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {horseSkills.slice(0, 3).map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/60"
                            >
                              {SKILL_LABELS[s] || s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price + Book */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-baseline gap-1">
                          {discountedPrice ? (
                            <>
                              <span className="font-bold text-base">{discountedPrice.toLocaleString()} EGP</span>
                              <span className="text-[11px] text-muted-foreground line-through ml-1">{originalPrice?.toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="font-bold text-[18px]">{originalPrice?.toLocaleString() || "0"} EGP</span>
                          )}
                          <span className="font-normal text-[13px] text-muted-foreground">/hr</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedSlotHorse(isOpen ? null : horse.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] text-white text-[15px] font-bold px-6 py-3 shadow hover:bg-black active:scale-95 transition-all duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                          {isOpen ? "Close" : "Book Now"}
                        </button>
                      </div>

                      {/* Inline Slot Picker */}
                      {isOpen && (
                        <div className="mt-4 pt-4 border-t border-border">
                          {/* Date nav */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pick a slot</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40"
                                onClick={() => {
                                  const d = new Date(selectedDate);
                                  d.setDate(d.getDate() - 1);
                                  const today = new Date(); today.setHours(0,0,0,0);
                                  if (d >= today) setSelectedDate(d);
                                }}
                                disabled={(() => {
                                  const d = new Date(selectedDate);
                                  d.setDate(d.getDate() - 1);
                                  const today = new Date(); today.setHours(0,0,0,0);
                                  return d < today;
                                })()}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-xs font-medium min-w-[72px] text-center">
                                {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              <button
                                type="button"
                                className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                                onClick={() => {
                                  const d = new Date(selectedDate);
                                  d.setDate(d.getDate() + 1);
                                  setSelectedDate(d);
                                }}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Slots */}
                          <div className="min-h-[80px] relative">
                            {isLoadingSlots && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            )}
                            {!isLoadingSlots && slots.length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">No slots available for this date.</p>
                            )}
                            {!isLoadingSlots && slots.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {(slots || []).map((time) => {
                                  const isTaken = taken.includes(time);
                                  return (
                                    <button
                                      key={time}
                                      type="button"
                                      disabled={isTaken}
                                      onClick={() => handleSlotSelect(horse.id, time)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        isTaken
                                          ? "bg-muted text-muted-foreground border-border/40 line-through cursor-not-allowed opacity-50"
                                          : "bg-background text-foreground border-border hover:bg-primary hover:text-primary-foreground cursor-pointer"
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No horses listed yet.</p>
            </div>
          )}
        </div>

        {/* Reviews snippet */}
        {initialStable.reviews && initialStable.reviews.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">What Riders Say</h2>
            <div className="space-y-3">
              {initialStable.reviews.slice(0, 3).map((review: any) => (
                <div key={review.id} className="rounded-xl border border-border p-4 bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">
                      {review.rider?.fullName || "Rider"}
                    </span>
                    <div className="flex">
                      {Array.from({ length: Math.round(review.stableRating) }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Powered by PyraRides watermark */}
        <div className="flex flex-col items-center py-6 gap-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Booking powered by</p>
          <Link
            href="https://www.pyrarides.com"
            target="_blank"
            className="text-sm font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            🐴 PyraRides
          </Link>
          <p className="text-[11px] text-muted-foreground text-center max-w-xs">
            Egypt&apos;s trusted horse riding booking platform at the Pyramids.
          </p>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingSelection && (
        <BookingModal
          open={!!bookingSelection}
          onOpenChange={(open) => { if (!open) setBookingSelection(undefined); }}
          stableId={stable.id}
          stableName={stable.name}
          horses={(stable.horses || []).map((h) => ({
            id: h.id,
            name: h.name,
            imageUrls: h.imageUrls || [],
            isActive: h.isActive,
            pricePerHour: h.pricePerHour,
            discountPercent: h.discountPercent,
            color: h.color,
          }))}
          initialSelection={bookingSelection}
        />
      )}
    </div>
  );
}
