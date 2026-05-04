// Core domain types matching the PyraRides Prisma models (mocked layer).

export type UserRole =
  | "rider"
  | "stable_owner"
  | "admin"
  | "captain"
  | "driver"
  | "cx_media";

export type League =
  | "wood"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "elite"
  | "champion";

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  profileImageUrl?: string;
  role: UserRole;
  rankPoints: number;
  currentLeague: League;
  isTrustedRider?: boolean;
  bio?: string;
}

export interface Stable {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string; // human label e.g. "Giza Plateau"
  address: string;
  imageUrl: string;
  galleryUrls: string[];
  status: "pending_approval" | "approved" | "rejected";
  isHidden?: boolean;
  rating: number;
  reviewCount: number;
  commissionRate: number;
  minLeadTimeHours: number;
  announcementBanner?: string;
  ownerName: string;
  yearsOperating: number;
  horseCount: number;
  startingPricePerHour: number;
  amenities: string[];
}

export type HorseColor =
  | "bay"
  | "chestnut"
  | "black"
  | "grey"
  | "white"
  | "palomino"
  | "dapple";

export type HorseTier = "novice" | "intermediate" | "advanced" | "master";

export interface Horse {
  id: string;
  name: string;
  stableId: string;
  stableName: string;
  imageUrls: string[];
  pricePerHour: number;
  discountPercent?: number;
  color: HorseColor;
  age: number;
  skills: string[];
  adminTier: HorseTier;
  isActive: boolean;
  breed: string;
  temperament: string;
  bio: string;
}

export type PackageType = "PRIVATE_VIP" | "GROUP_EVENT";

export interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  duration: number; // hours
  maxPeople: number;
  packageType: PackageType;
  imageUrl: string;
  galleryUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  stableId: string;
  stableName: string;
  hasTransportation: boolean;
  transportZones: TransportZone[];
  highlights: string[];
  itinerary: { time: string; title: string; description: string }[];
  inclusions: string[];
}

export interface TransportZone {
  id: string;
  name: string;
  price: number;
}

export interface Review {
  id: string;
  riderId: string;
  riderName: string;
  riderAvatar?: string;
  stableId: string;
  stableName: string;
  horseName?: string;
  stableRating: number;
  horseRating: number;
  comment: string;
  createdAt: string;
  mediaUrls?: string[];
}

export interface Academy {
  id: string;
  name: string;
  slug: string;
  location: string;
  description: string;
  imageUrl: string;
  captainName: string;
  captainBio: string;
  captainAvatar?: string;
  isActive: boolean;
  programs: TrainingProgram[];
}

export interface TrainingProgram {
  id: string;
  academyId: string;
  name: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  totalSessions: number;
  sessionDuration: number; // minutes
  price: number;
  description: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  riderName: string;
  stableName?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface LeaderboardRider {
  id: string;
  fullName: string;
  profileImageUrl?: string;
  rankPoints: number;
  league: League;
  ridesCompleted: number;
  position: number;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  description: string;
}

export interface TimeSlot {
  startTime: string; // ISO
  endTime: string;
  available: boolean;
  horseId?: string;
}

export interface Location {
  id: string;
  name: string;
  region: string;
}
