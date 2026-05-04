import {
  STABLES,
  HORSES,
  PACKAGES,
  REVIEWS,
  ACADEMIES,
  GALLERY_ITEMS,
  LEADERBOARD,
  LOCATIONS,
  TRANSPORT_ZONES,
  PROMO_CODES,
} from "../mock-data/seed";
import type {
  Stable,
  Horse,
  Package,
  Review,
  Academy,
  GalleryItem,
  LeaderboardRider,
  Location,
  TransportZone,
  TimeSlot,
  HorseColor,
} from "../types";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

export interface StableFilters {
  search?: string;
  location?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: "recommended" | "price-asc" | "price-desc" | "highest-rated" | "newest";
  color?: HorseColor;
  skills?: string[];
}

export const api = {
  async listStables(filters: StableFilters = {}): Promise<Stable[]> {
    await delay();
    let out = [...STABLES];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      out = out.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          HORSES.some((h) => h.stableId === s.id && h.name.toLowerCase().includes(q)),
      );
    }
    if (filters.location) {
      out = out.filter((s) => s.location === filters.location);
    }
    if (filters.minRating) {
      out = out.filter((s) => s.rating >= filters.minRating!);
    }
    if (filters.minPrice) {
      out = out.filter((s) => s.startingPricePerHour >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      out = out.filter((s) => s.startingPricePerHour <= filters.maxPrice!);
    }
    switch (filters.sort) {
      case "price-asc":
        out.sort((a, b) => a.startingPricePerHour - b.startingPricePerHour);
        break;
      case "price-desc":
        out.sort((a, b) => b.startingPricePerHour - a.startingPricePerHour);
        break;
      case "highest-rated":
        out.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        out.sort((a, b) => a.yearsOperating - b.yearsOperating);
        break;
      default:
        out.sort((a, b) => b.rating * 10 + b.reviewCount / 100 - (a.rating * 10 + a.reviewCount / 100));
    }
    return out;
  },

  async getStable(id: string): Promise<Stable | null> {
    await delay();
    return STABLES.find((s) => s.id === id || s.slug === id) ?? null;
  },

  async listHorses(filters: StableFilters = {}): Promise<Horse[]> {
    await delay();
    let out = HORSES.filter((h) => h.isActive);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      out = out.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.stableName.toLowerCase().includes(q) ||
          h.breed.toLowerCase().includes(q),
      );
    }
    if (filters.color) {
      out = out.filter((h) => h.color === filters.color);
    }
    if (filters.skills && filters.skills.length) {
      out = out.filter((h) => filters.skills!.every((s) => h.skills.includes(s)));
    }
    if (filters.minPrice) out = out.filter((h) => h.pricePerHour >= filters.minPrice!);
    if (filters.maxPrice) out = out.filter((h) => h.pricePerHour <= filters.maxPrice!);
    if (filters.location) {
      const stableIds = STABLES.filter((s) => s.location === filters.location).map((s) => s.id);
      out = out.filter((h) => stableIds.includes(h.stableId));
    }
    switch (filters.sort) {
      case "price-asc":
        out.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case "price-desc":
        out.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
    }
    return out;
  },

  async getHorse(id: string): Promise<Horse | null> {
    await delay();
    return HORSES.find((h) => h.id === id) ?? null;
  },

  async listHorsesForStable(stableId: string): Promise<Horse[]> {
    await delay();
    return HORSES.filter((h) => h.stableId === stableId && h.isActive);
  },

  async listPackages(opts: { featured?: boolean; type?: "PRIVATE_VIP" | "GROUP_EVENT" } = {}): Promise<Package[]> {
    await delay();
    let out = PACKAGES.filter((p) => p.isActive);
    if (opts.featured) out = out.filter((p) => p.isFeatured);
    if (opts.type) out = out.filter((p) => p.packageType === opts.type);
    return out;
  },

  async getPackage(id: string): Promise<Package | null> {
    await delay();
    return PACKAGES.find((p) => p.id === id || p.slug === id) ?? null;
  },

  async listReviews(opts: { stableId?: string; limit?: number } = {}): Promise<Review[]> {
    await delay();
    let out = [...REVIEWS];
    if (opts.stableId) out = out.filter((r) => r.stableId === opts.stableId);
    if (opts.limit) out = out.slice(0, opts.limit);
    return out;
  },

  async listAcademies(): Promise<Academy[]> {
    await delay();
    return ACADEMIES.filter((a) => a.isActive);
  },

  async listGallery(): Promise<GalleryItem[]> {
    await delay();
    return GALLERY_ITEMS.filter((g) => g.status === "approved");
  },

  async getLeaderboard(): Promise<LeaderboardRider[]> {
    await delay();
    return LEADERBOARD;
  },

  async listLocations(): Promise<Location[]> {
    await delay(80);
    return LOCATIONS;
  },

  async listTransportZones(): Promise<TransportZone[]> {
    await delay(80);
    return TRANSPORT_ZONES;
  },

  async validatePromoCode(code: string): Promise<{ valid: boolean; discountPercent: number; message: string }> {
    await delay();
    const found = PROMO_CODES.find((p) => p.code.toLowerCase() === code.toLowerCase());
    if (!found) return { valid: false, discountPercent: 0, message: "Code not recognised." };
    return { valid: true, discountPercent: found.discountPercent, message: `${found.discountPercent}% — ${found.description}` };
  },

  async getStableSlots(stableId: string, dateISO: string, horseId?: string): Promise<TimeSlot[]> {
    await delay();
    const slots: TimeSlot[] = [];
    const date = new Date(dateISO);
    const day = date.getDay();
    const seed = (date.getDate() + (horseId?.length ?? 0)) % 7;
    for (let hour = 6; hour <= 19; hour++) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 1);
      const available = (hour + day + seed) % 3 !== 0;
      slots.push({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        available,
        horseId,
      });
    }
    return slots;
  },

  async createBooking(payload: unknown): Promise<{ id: string; status: "confirmed" | "pending" }> {
    await delay(450);
    return { id: `bk-${Math.random().toString(36).slice(2, 9)}`, status: "confirmed" };
  },

  async createPackageBooking(payload: unknown): Promise<{ id: string }> {
    await delay(450);
    return { id: `pbk-${Math.random().toString(36).slice(2, 9)}` };
  },

  async submitContact(payload: { name: string; email: string; message: string }): Promise<{ ok: true }> {
    await delay(400);
    return { ok: true };
  },
};
