const stableCourtyard = "/assets/stable-1.jpg";
const desertRide = "/assets/hero-bg.jpg";
const horsePortrait = "/assets/horse-1.jpg";
const horseChestnut = "/assets/horse-1.jpg";
const horseBlack = "/assets/horse-1.jpg";
const horseGrey = "/assets/horse-1.jpg";


// Skill tier ladder. Compared against User.rankPoints to gate selection.
export type AdminTier = "novice" | "intermediate" | "advanced" | "master";

export const TIER_THRESHOLDS: Record<AdminTier, number> = {
  novice: 0,
  intermediate: 1200,
  advanced: 1800,
  master: 2400,
};

export type Horse = {
  id: string;
  stableId: string;
  name: string;
  breed: string;
  age: number;
  temperament: string;
  image: string;
  // Public, dictionary-aligned fields. basePrice is intentionally NEVER exposed.
  adminTier: AdminTier;
  pricePerHour: number;
  isActive: boolean;
};

export type Stable = {
  id: string;
  name: string;
  location: string;
  description: string;
  story: string;
  commissionRate: number;
  image: string;
  established: string;
  amenities: string[];
  hours: string;
  riders: number;
};

export const stables: Stable[] = [
  {
    id: "al-nasr",
    name: "Al-Nasr Heritage Stables",
    location: "Giza Plateau · West",
    description: "A century-old family estate raising purebred Arabians within sight of the Great Pyramid.",
    story: "Founded by Sheikh Mahmoud Al-Nasr in 1924, our estate has been entrusted across four generations. We raise only purebred Egyptian Arabians, trained from birth on the sands of Giza. To ride here is to enter a quiet conversation between rider, horse, and history.",
    commissionRate: 0.12,
    image: stableCourtyard,
    established: "1924",
    amenities: ["Private dressing salon", "Concierge transfer", "Linen tea service", "On-site veterinarian", "Sunrise & sunset rides", "Master rider escort"],
    hours: "06:00 — 19:00 daily",
    riders: 18,
  },
  {
    id: "saqqara",
    name: "Saqqara Royal Equestrian",
    location: "Saqqara · 30 km",
    description: "Olympic-grade dressage facility set among palm groves and the Step Pyramid.",
    story: "An Olympic dressage facility quietly hidden among Saqqara's palm groves, with a private view of the Step Pyramid. We train competitively and ride privately — never both at once.",
    commissionRate: 0.15,
    image: desertRide,
    established: "1987",
    amenities: ["Olympic dressage arena", "Private banquet pavilion", "Folkloric performance", "Concierge transfer", "Master rider escort", "Sommelier service"],
    hours: "07:00 — 22:00 daily",
    riders: 24,
  },
  {
    id: "house-of-horus",
    name: "House of Horus",
    location: "Giza · East Plateau",
    description: "Boutique stable specialising in sunrise rides and private desert dinners under the stars.",
    story: "A boutique house of nine horses and three riders. We arrange one party at a time, never two — so the desert remains, briefly, entirely yours.",
    commissionRate: 0.18,
    image: horsePortrait,
    established: "2009",
    amenities: ["Single-party reservations", "Astronomer guide", "Private desert dinner", "Bespoke itinerary", "Concierge transfer", "Photographer on request"],
    hours: "By reservation",
    riders: 9,
  },
];

export const horses: Horse[] = [
  { id: "h1", stableId: "al-nasr", name: "Nefertari", breed: "Egyptian Arabian", age: 7, temperament: "Spirited · advanced riders", image: horseChestnut, adminTier: "advanced", pricePerHour: 180, isActive: true },
  { id: "h2", stableId: "al-nasr", name: "Anubis", breed: "Egyptian Arabian", age: 9, temperament: "Composed · all levels", image: horseBlack, adminTier: "novice", pricePerHour: 120, isActive: true },
  { id: "h3", stableId: "al-nasr", name: "Sirocco", breed: "Egyptian Arabian", age: 6, temperament: "Gentle · novices welcome", image: horseGrey, adminTier: "novice", pricePerHour: 110, isActive: true },
  { id: "h4", stableId: "al-nasr", name: "Khepri", breed: "Egyptian Arabian", age: 11, temperament: "Stately · intermediate", image: horsePortrait, adminTier: "intermediate", pricePerHour: 150, isActive: true },
  { id: "h5", stableId: "saqqara", name: "Isis", breed: "Egyptian Arabian", age: 8, temperament: "Elegant · dressage trained", image: horseGrey, adminTier: "intermediate", pricePerHour: 160, isActive: true },
  { id: "h6", stableId: "saqqara", name: "Ra", breed: "Egyptian Arabian", age: 10, temperament: "Bold · advanced riders", image: horseChestnut, adminTier: "master", pricePerHour: 220, isActive: true },
  { id: "h7", stableId: "saqqara", name: "Bastet", breed: "Egyptian Arabian", age: 5, temperament: "Quick · intermediate", image: horseBlack, adminTier: "intermediate", pricePerHour: 150, isActive: true },
  { id: "h8", stableId: "house-of-horus", name: "Horus", breed: "Egyptian Arabian", age: 12, temperament: "Regal · all levels", image: horsePortrait, adminTier: "advanced", pricePerHour: 200, isActive: true },
  { id: "h9", stableId: "house-of-horus", name: "Nut", breed: "Egyptian Arabian", age: 7, temperament: "Calm · novices welcome", image: horseGrey, adminTier: "novice", pricePerHour: 115, isActive: true },
];

// ────────────────────────────────────────────────────────────
// Transport zones — surfaced as a dropdown on packages with hasTransportation.
// ────────────────────────────────────────────────────────────
export type TransportZone = {
  id: string;
  name: string;
  price: number; // add-on, USD
};

export const transportZones: TransportZone[] = [
  { id: "tz-giza", name: "Giza · Pyramids quarter", price: 0 },
  { id: "tz-zamalek", name: "Zamalek · Cairo island", price: 45 },
  { id: "tz-newcairo", name: "New Cairo · East", price: 70 },
  { id: "tz-airport", name: "Cairo International Airport", price: 95 },
  { id: "tz-northcoast", name: "North Coast · by request", price: 240 },
];

// ────────────────────────────────────────────────────────────
// Current rider session (mocked until Lovable Cloud auth lands).
// Drives skill-gating + cash-payment trust check.
// ────────────────────────────────────────────────────────────
export type CurrentUser = {
  id: string;
  fullName: string;
  email: string;
  role: "rider" | "stable_owner" | "admin" | "cx_media" | "captain" | "driver";
  rankPoints: number;
  isTrustedRider: boolean;
};

export const currentUser: CurrentUser = {
  id: "u-demo",
  fullName: "Aya Karim",
  email: "aya@pyrarides.demo",
  role: "rider",
  rankPoints: 1350, // intermediate
  isTrustedRider: false,
};

// ────────────────────────────────────────────────────────────
// Promo codes (validated client-side; backend remains source of truth).
// ────────────────────────────────────────────────────────────
export type PromoCode = { code: string; percentOff: number; label: string };
export const promoCodes: PromoCode[] = [
  { code: "CERCLE10", percentOff: 0.10, label: "Cercle members · 10% off" },
  { code: "SUNRISE15", percentOff: 0.15, label: "Sunrise season · 15% off" },
];

export type Package = {
  id: string;
  stableId: string;
  name: string;
  tagline: string;
  duration: string;
  minPeople: number;
  maxPeople: number;
  price: number;
  hasFood: boolean;
  hasHorseRide: boolean;
  hasTransportation: boolean;
  hasDancingShow: boolean;
  image: string;
};

export const packages: Package[] = [
  { id: "p1", stableId: "al-nasr", name: "The Sunrise Procession", tagline: "First light at the Great Pyramid", duration: "3 hours", minPeople: 1, maxPeople: 4, price: 480, hasFood: true, hasHorseRide: true, hasTransportation: true, hasDancingShow: false, image: desertRide },
  { id: "p2", stableId: "saqqara", name: "Pharaoh's Banquet", tagline: "Private ride & desert dinner", duration: "5 hours", minPeople: 2, maxPeople: 8, price: 1240, hasFood: true, hasHorseRide: true, hasTransportation: true, hasDancingShow: true, image: stableCourtyard },
  { id: "p3", stableId: "house-of-horus", name: "The Horus Initiation", tagline: "Two-day immersion & training", duration: "2 days", minPeople: 1, maxPeople: 2, price: 2890, hasFood: true, hasHorseRide: true, hasTransportation: true, hasDancingShow: false, image: horsePortrait },
  { id: "p4", stableId: "al-nasr", name: "Twilight at Khufu", tagline: "Sunset ride with mint tea ceremony", duration: "2 hours", minPeople: 1, maxPeople: 6, price: 360, hasFood: true, hasHorseRide: true, hasTransportation: true, hasDancingShow: false, image: stableCourtyard },
];
