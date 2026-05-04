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
  PromoCode,
  User,
} from "../types";

// Curated photography from Unsplash — pyramids, desert, Arabian horses, riders.
const IMG = {
  pyramidsRider1:
    "https://images.unsplash.com/photo-1589308454676-22c0fd3a7fc1?auto=format&fit=crop&w=1600&q=80",
  pyramidsRider2:
    "https://images.unsplash.com/photo-1548175129-d11c39bc4be8?auto=format&fit=crop&w=1600&q=80",
  desertRide:
    "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1600&q=80",
  arabianBay:
    "https://images.unsplash.com/photo-1534772142200-f2d2148e58e0?auto=format&fit=crop&w=1600&q=80",
  arabianGrey:
    "https://images.unsplash.com/photo-1553284966-19b8815c7817?auto=format&fit=crop&w=1600&q=80",
  blackHorse:
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80",
  whiteHorse:
    "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&w=1600&q=80",
  chestnut:
    "https://images.unsplash.com/photo-1605195339362-2a18a4afdec8?auto=format&fit=crop&w=1600&q=80",
  palomino:
    "https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&w=1600&q=80",
  stable1:
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80",
  stable2:
    "https://images.unsplash.com/photo-1568364935999-50a7d033cf02?auto=format&fit=crop&w=1600&q=80",
  stable3:
    "https://images.unsplash.com/photo-1474314243412-cd4a79f02c6a?auto=format&fit=crop&w=1600&q=80",
  desertSunset:
    "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=80",
  pyramidsWide:
    "https://images.unsplash.com/photo-1539650116574-75c0c6d73f0e?auto=format&fit=crop&w=1920&q=80",
  saqqara:
    "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1600&q=80",
  trainingRing:
    "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=1600&q=80",
  riderPortrait1:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
  riderPortrait2:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  riderPortrait3:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  riderPortrait4:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  riderPortrait5:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  galleryHorse1:
    "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=900&q=80",
  galleryHorse2:
    "https://images.unsplash.com/photo-1593179241555-122324f00cb6?auto=format&fit=crop&w=900&q=80",
  galleryHorse3:
    "https://images.unsplash.com/photo-1567201080540-09d775878732?auto=format&fit=crop&w=900&q=80",
  galleryHorse4:
    "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&w=900&q=80",
};

export const HERO_IMAGE = IMG.pyramidsRider1;

export const LOCATIONS: Location[] = [
  { id: "giza-plateau", name: "Giza Plateau", region: "Giza" },
  { id: "saqqara", name: "Saqqara Necropolis", region: "Giza" },
  { id: "abusir", name: "Abusir", region: "Giza" },
  { id: "nazlet-el-semman", name: "Nazlet El-Semman", region: "Giza" },
  { id: "dahshur", name: "Dahshur", region: "Giza" },
];

export const TRANSPORT_ZONES: TransportZone[] = [
  { id: "tz-cairo", name: "Cairo (within ring road)", price: 350 },
  { id: "tz-newcairo", name: "New Cairo / Fifth Settlement", price: 450 },
  { id: "tz-zamalek", name: "Zamalek / Downtown", price: 400 },
  { id: "tz-maadi", name: "Maadi", price: 500 },
  { id: "tz-6oct", name: "6th of October", price: 350 },
  { id: "tz-airport", name: "Cairo International Airport", price: 650 },
];

export const PROMO_CODES: PromoCode[] = [
  { code: "WELCOME10", discountPercent: 10, description: "10% off your first ride" },
  { code: "CERCLE15", discountPercent: 15, description: "Le Cercle members" },
  { code: "SUNRISE20", discountPercent: 20, description: "Sunrise rides only" },
];

export const STABLES: Stable[] = [
  {
    id: "st-meridian",
    name: "Meridian Stables",
    slug: "meridian-stables",
    description:
      "Three generations of horsemen on the western edge of the plateau. Meridian's Arabians are bred for the desert — calm in the wind, sure-footed on sand, unhurried under any rider.",
    location: "Giza Plateau",
    address: "Pyramid Road, Nazlet El-Semman, Giza",
    imageUrl: IMG.stable1,
    galleryUrls: [IMG.stable1, IMG.pyramidsRider1, IMG.desertRide, IMG.arabianBay, IMG.arabianGrey],
    status: "approved",
    rating: 4.9,
    reviewCount: 412,
    commissionRate: 0.15,
    minLeadTimeHours: 4,
    announcementBanner: "Sunrise rides depart at 5:45am — limited slots.",
    ownerName: "Hassan El-Sayed",
    yearsOperating: 38,
    horseCount: 24,
    startingPricePerHour: 850,
    amenities: ["Certified guides", "English & Arabic", "Helmets provided", "Tea on return", "Photography included"],
  },
  {
    id: "st-amber",
    name: "Amber House",
    slug: "amber-house",
    description:
      "A small estate-style stable with twelve horses and a private exit onto the desert. Quiet, considered, and unfussy — the owner rides with every guest on their first visit.",
    location: "Giza Plateau",
    address: "Mansouriya Road, Giza",
    imageUrl: IMG.stable2,
    galleryUrls: [IMG.stable2, IMG.arabianGrey, IMG.pyramidsRider2, IMG.whiteHorse],
    status: "approved",
    rating: 4.8,
    reviewCount: 187,
    commissionRate: 0.15,
    minLeadTimeHours: 6,
    ownerName: "Nour Ibrahim",
    yearsOperating: 14,
    horseCount: 12,
    startingPricePerHour: 1100,
    amenities: ["Boutique experience", "Owner-led rides", "Private desert access", "Refreshments"],
  },
  {
    id: "st-saqqara-rose",
    name: "Saqqara Rose",
    slug: "saqqara-rose",
    description:
      "South of the plateau, in sight of the Step Pyramid. A working stable that pairs riders with the right horse, not the most expensive one. Long rides into the older necropolis are their specialty.",
    location: "Saqqara Necropolis",
    address: "Saqqara Road, Badrashin",
    imageUrl: IMG.stable3,
    galleryUrls: [IMG.stable3, IMG.saqqara, IMG.desertSunset, IMG.chestnut],
    status: "approved",
    rating: 4.7,
    reviewCount: 256,
    commissionRate: 0.15,
    minLeadTimeHours: 8,
    ownerName: "Ahmed Farouk",
    yearsOperating: 22,
    horseCount: 18,
    startingPricePerHour: 750,
    amenities: ["Long-distance routes", "Certified guides", "Helmets provided", "Saqqara expertise"],
  },
  {
    id: "st-hares-arabian",
    name: "Hares Arabian Stud",
    slug: "hares-arabian-stud",
    description:
      "A stud farm that opens its gates to riders. Mostly purebred Arabians, mostly greys, all trained from foal. Expect a slower booking — they ask about your experience first.",
    location: "Abusir",
    address: "Abusir Road, Giza",
    imageUrl: IMG.stable1,
    galleryUrls: [IMG.stable1, IMG.arabianGrey, IMG.whiteHorse, IMG.pyramidsWide],
    status: "approved",
    rating: 4.9,
    reviewCount: 94,
    commissionRate: 0.15,
    minLeadTimeHours: 24,
    announcementBanner: "Booking requires a brief experience interview.",
    ownerName: "Mohamed Hares",
    yearsOperating: 31,
    horseCount: 16,
    startingPricePerHour: 1400,
    amenities: ["Purebred Arabians", "Experienced riders preferred", "Owner present", "Premium tack"],
  },
  {
    id: "st-blue-nile",
    name: "Blue Nile Riding Co.",
    slug: "blue-nile-riding-co",
    description:
      "The newest of the plateau stables, opened in 2021 by two former show riders. Clean tack, modern grooming, and an easy attitude. Good first choice for younger riders.",
    location: "Nazlet El-Semman",
    address: "Sphinx Square, Nazlet El-Semman",
    imageUrl: IMG.stable2,
    galleryUrls: [IMG.stable2, IMG.palomino, IMG.chestnut, IMG.pyramidsRider1],
    status: "approved",
    rating: 4.6,
    reviewCount: 142,
    commissionRate: 0.18,
    minLeadTimeHours: 4,
    ownerName: "Yara Mostafa",
    yearsOperating: 4,
    horseCount: 14,
    startingPricePerHour: 700,
    amenities: ["Family friendly", "Beginner programs", "Safety briefings", "Modern facilities"],
  },
  {
    id: "st-dahshur-bend",
    name: "Dahshur Bend",
    slug: "dahshur-bend",
    description:
      "Furthest south, near the Bent Pyramid. Quiet land, fewer crowds, longer rides. The kind of place riders return to once they've outgrown the postcard route.",
    location: "Dahshur",
    address: "Dahshur Village Road",
    imageUrl: IMG.stable3,
    galleryUrls: [IMG.stable3, IMG.desertSunset, IMG.desertRide, IMG.blackHorse],
    status: "approved",
    rating: 4.8,
    reviewCount: 78,
    commissionRate: 0.15,
    minLeadTimeHours: 12,
    ownerName: "Karim Abdelaziz",
    yearsOperating: 19,
    horseCount: 10,
    startingPricePerHour: 900,
    amenities: ["Quiet routes", "Long rides", "Certified guides", "Picnic available"],
  },
  {
    id: "st-cavalier",
    name: "Cavalier Plateau",
    slug: "cavalier-plateau",
    description:
      "A larger operation that handles groups well — good for events, anniversaries, and corporate gatherings without losing the personal feel.",
    location: "Giza Plateau",
    address: "Pyramid Gardens, Giza",
    imageUrl: IMG.stable1,
    galleryUrls: [IMG.stable1, IMG.pyramidsWide, IMG.pyramidsRider2, IMG.arabianBay],
    status: "approved",
    rating: 4.5,
    reviewCount: 320,
    commissionRate: 0.18,
    minLeadTimeHours: 6,
    ownerName: "Tarek Hosni",
    yearsOperating: 27,
    horseCount: 32,
    startingPricePerHour: 650,
    amenities: ["Group bookings", "Event-ready", "Multiple guides", "Catering on request"],
  },
  {
    id: "st-old-quarter",
    name: "Old Quarter Equestrian",
    slug: "old-quarter-equestrian",
    description:
      "Founded in 1962. The oldest licensed stable on the plateau and still family-owned. Half their horses have names older than their guests.",
    location: "Nazlet El-Semman",
    address: "Old Cairo Lane, Nazlet El-Semman",
    imageUrl: IMG.stable2,
    galleryUrls: [IMG.stable2, IMG.arabianBay, IMG.chestnut, IMG.pyramidsRider1],
    status: "approved",
    rating: 4.7,
    reviewCount: 501,
    commissionRate: 0.15,
    minLeadTimeHours: 4,
    ownerName: "Samir El-Masry",
    yearsOperating: 62,
    horseCount: 28,
    startingPricePerHour: 800,
    amenities: ["Heritage stable", "Knowledgeable guides", "Traditional tack", "Mint tea on return"],
  },
];

const skillsPool = [
  "trail",
  "desert",
  "sunrise",
  "sunset",
  "beginner-friendly",
  "intermediate",
  "advanced",
  "trot",
  "canter",
  "gallop",
  "photography-friendly",
  "long-distance",
];

function pick<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[(seed + i * 3) % arr.length]);
  return Array.from(new Set(out));
}

const horseImages = [
  IMG.arabianBay,
  IMG.arabianGrey,
  IMG.blackHorse,
  IMG.whiteHorse,
  IMG.chestnut,
  IMG.palomino,
];

const horseNames = [
  "Anubis", "Sphinx", "Nile", "Cleo", "Ramses", "Isis", "Horus", "Layla",
  "Khamsin", "Zahra", "Faris", "Sahar", "Najm", "Bahar", "Qamar", "Asad",
  "Dune", "Mirage", "Saffron", "Ember", "Cyrus", "Nazar", "Ghazal", "Salma",
  "Tariq", "Yasmin", "Marid", "Habib", "Rana", "Zephyr", "Aswan", "Karnak",
];

const breeds = ["Egyptian Arabian", "Arabian", "Anglo-Arab", "Barb", "Andalusian Cross"];
const temperaments = ["Calm and willing", "Confident, forward", "Gentle, patient", "Spirited, intelligent", "Steady, dependable"];

const horseColors: Horse["color"][] = ["bay", "chestnut", "black", "grey", "white", "palomino", "dapple"];
const tiers: Horse["adminTier"][] = ["novice", "intermediate", "advanced", "master"];

export const HORSES: Horse[] = horseNames.flatMap((name, i) => {
  const stable = STABLES[i % STABLES.length];
  const color = horseColors[i % horseColors.length];
  const tier = tiers[i % tiers.length];
  const img = horseImages[i % horseImages.length];
  return [{
    id: `h-${i + 1}`,
    name,
    stableId: stable.id,
    stableName: stable.name,
    imageUrls: [img, horseImages[(i + 1) % horseImages.length]],
    pricePerHour: 600 + ((i * 73) % 9) * 100,
    discountPercent: i % 7 === 0 ? 10 : undefined,
    color,
    age: 5 + (i % 12),
    skills: pick(skillsPool, 3 + (i % 3), i),
    adminTier: tier,
    isActive: true,
    breed: breeds[i % breeds.length],
    temperament: temperaments[i % temperaments.length],
    bio: `${name} has carried riders along the plateau for ${3 + (i % 8)} years. ${
      tier === "master" || tier === "advanced"
        ? "Best matched with confident riders who appreciate a forward, responsive horse."
        : "Patient with newer riders, steady at every gait, and unfazed by crowds."
    }`,
  }];
});

export const PACKAGES: Package[] = [
  {
    id: "pkg-sunrise-private",
    title: "Sunrise at the Pyramids — Private",
    slug: "sunrise-at-the-pyramids-private",
    description: "Two hours alone with the desert as the sun rises behind the Great Pyramid.",
    longDescription:
      "Meet your guide and horse before first light. Walk out onto the plateau as the colour returns to the stones. We follow the old caravan track to a quiet rise behind the Sphinx, pause for tea, and return through the south field. Two riders maximum. Photography included.",
    price: 4200,
    originalPrice: 4800,
    duration: 2.5,
    maxPeople: 2,
    packageType: "PRIVATE_VIP",
    imageUrl: IMG.pyramidsRider1,
    galleryUrls: [IMG.pyramidsRider1, IMG.desertSunset, IMG.arabianGrey, IMG.pyramidsWide],
    isActive: true,
    isFeatured: true,
    stableId: "st-meridian",
    stableName: "Meridian Stables",
    hasTransportation: true,
    transportZones: TRANSPORT_ZONES,
    highlights: [
      "Departure 45 minutes before sunrise",
      "Two riders maximum",
      "Personal photographer included",
      "Bedouin tea at the viewpoint",
    ],
    itinerary: [
      { time: "5:15", title: "Pickup", description: "Driver collects you from your hotel." },
      { time: "5:45", title: "Stable arrival", description: "Brief introduction with your guide and horse." },
      { time: "6:00", title: "Departure", description: "Walk out onto the plateau as the sun rises." },
      { time: "7:15", title: "Tea at the viewpoint", description: "A quiet pause behind the Sphinx." },
      { time: "8:30", title: "Return", description: "Back to the stable, breakfast available on request." },
    ],
    inclusions: [
      "Private guide",
      "Trained horse matched to your level",
      "Helmet and refreshments",
      "Photo set delivered within 48 hours",
      "Hotel pickup and return",
    ],
  },
  {
    id: "pkg-sunset-couples",
    title: "Sunset Ride for Two",
    slug: "sunset-ride-for-two",
    description: "A 90-minute private ride with the pyramids at golden hour.",
    longDescription:
      "Designed for couples and small parties. We leave the stable two hours before sunset, follow the western route, and time our return to the moment the pyramids turn gold. Champagne available on request.",
    price: 3400,
    duration: 1.5,
    maxPeople: 2,
    packageType: "PRIVATE_VIP",
    imageUrl: IMG.desertSunset,
    galleryUrls: [IMG.desertSunset, IMG.pyramidsRider2, IMG.arabianBay],
    isActive: true,
    isFeatured: true,
    stableId: "st-amber",
    stableName: "Amber House",
    hasTransportation: true,
    transportZones: TRANSPORT_ZONES,
    highlights: ["90-minute golden hour ride", "Champagne on request", "Photography included", "Hotel transfer"],
    itinerary: [
      { time: "16:00", title: "Pickup", description: "Driver collects you from your hotel." },
      { time: "16:45", title: "Departure", description: "Walk out toward the western face." },
      { time: "17:30", title: "Golden hour", description: "Pause at the viewpoint." },
      { time: "18:30", title: "Return", description: "Back to the stable." },
    ],
    inclusions: ["Private guide", "Two horses", "Helmets", "Photo set", "Hotel transfer"],
  },
  {
    id: "pkg-saqqara-half",
    title: "Saqqara Half-Day Expedition",
    slug: "saqqara-half-day-expedition",
    description: "Four hours of riding through the older necropolis with a historian guide.",
    longDescription:
      "A longer ride for confident riders. We leave Saqqara Rose mid-morning, ride south past the Step Pyramid to the older mastabas, and return through the palm groves. Includes a guided walk and a Bedouin lunch.",
    price: 5500,
    duration: 4,
    maxPeople: 4,
    packageType: "GROUP_EVENT",
    imageUrl: IMG.saqqara,
    galleryUrls: [IMG.saqqara, IMG.desertRide, IMG.chestnut, IMG.pyramidsWide],
    isActive: true,
    isFeatured: true,
    stableId: "st-saqqara-rose",
    stableName: "Saqqara Rose",
    hasTransportation: true,
    transportZones: TRANSPORT_ZONES,
    highlights: ["Historian guide", "Bedouin lunch", "Step Pyramid views", "4-hour ride"],
    itinerary: [
      { time: "9:00", title: "Pickup", description: "Driver collects you." },
      { time: "10:00", title: "Departure", description: "Ride toward the Step Pyramid." },
      { time: "11:30", title: "Guided walk", description: "Dismount for a 30-minute walking tour." },
      { time: "13:00", title: "Lunch", description: "Bedouin lunch under shade." },
      { time: "14:30", title: "Return", description: "Ride back through the palms." },
    ],
    inclusions: ["Historian guide", "Stable handler", "Lunch", "Refreshments", "Hotel transfer"],
  },
  {
    id: "pkg-night-ride",
    title: "Night Ride Under the Stars",
    slug: "night-ride-under-the-stars",
    description: "An intimate evening ride after the plateau has emptied.",
    longDescription:
      "Once the sites close, the desert is quiet. We ride out by lantern, pause at the southern dunes for stargazing, and return through the cool sand. Limited to four riders.",
    price: 3900,
    duration: 2,
    maxPeople: 4,
    packageType: "GROUP_EVENT",
    imageUrl: IMG.desertRide,
    galleryUrls: [IMG.desertRide, IMG.desertSunset, IMG.blackHorse],
    isActive: true,
    isFeatured: false,
    stableId: "st-dahshur-bend",
    stableName: "Dahshur Bend",
    hasTransportation: true,
    transportZones: TRANSPORT_ZONES,
    highlights: ["Lantern-lit ride", "Stargazing pause", "Limited to 4 riders", "Hotel transfer"],
    itinerary: [
      { time: "20:00", title: "Pickup", description: "Driver collects you." },
      { time: "21:00", title: "Departure", description: "Ride out by lantern." },
      { time: "21:45", title: "Stargazing", description: "Tea and stories at the dunes." },
      { time: "23:00", title: "Return", description: "Back to the stable." },
    ],
    inclusions: ["Guide", "Lanterns", "Tea", "Hotel transfer"],
  },
  {
    id: "pkg-anniversary",
    title: "The Anniversary Ride",
    slug: "the-anniversary-ride",
    description: "A private celebration with photography, flowers, and champagne at the viewpoint.",
    longDescription:
      "Designed with proposals and anniversaries in mind. Two hours, custom photography, a flower setup at the viewpoint, and a private return.",
    price: 7800,
    originalPrice: 8500,
    duration: 2,
    maxPeople: 2,
    packageType: "PRIVATE_VIP",
    imageUrl: IMG.pyramidsRider2,
    galleryUrls: [IMG.pyramidsRider2, IMG.desertSunset, IMG.whiteHorse],
    isActive: true,
    isFeatured: true,
    stableId: "st-amber",
    stableName: "Amber House",
    hasTransportation: true,
    transportZones: TRANSPORT_ZONES,
    highlights: ["Photographer + videographer", "Flower setup", "Champagne", "Two hours private"],
    itinerary: [
      { time: "Pickup", title: "Pickup", description: "Discreet hotel collection." },
      { time: "Ride", title: "Private ride", description: "Out to a prepared viewpoint." },
      { time: "Setup", title: "The moment", description: "Flowers, champagne, your photographer ready." },
      { time: "Return", title: "Return", description: "Photos delivered same week." },
    ],
    inclusions: ["Private guide", "Two horses", "Photographer + videographer", "Flowers", "Champagne", "Hotel transfer"],
  },
  {
    id: "pkg-family",
    title: "Family Half-Day",
    slug: "family-half-day",
    description: "A relaxed introduction for families with children eight and up.",
    longDescription:
      "A ground lesson, a slow walk through the southern paddock, and a short ride along the plateau edge. Designed for first-time riders and families.",
    price: 4900,
    duration: 3,
    maxPeople: 6,
    packageType: "GROUP_EVENT",
    imageUrl: IMG.trainingRing,
    galleryUrls: [IMG.trainingRing, IMG.palomino, IMG.chestnut],
    isActive: true,
    isFeatured: false,
    stableId: "st-blue-nile",
    stableName: "Blue Nile Riding Co.",
    hasTransportation: true,
    transportZones: TRANSPORT_ZONES,
    highlights: ["Children 8+ welcome", "Ground lesson included", "6 riders max", "Refreshments"],
    itinerary: [
      { time: "9:00", title: "Pickup", description: "Driver collects family." },
      { time: "10:00", title: "Ground lesson", description: "Meet the horses, learn the basics." },
      { time: "11:00", title: "Ride", description: "Slow walk along the plateau." },
      { time: "12:30", title: "Return", description: "Snacks and back to the hotel." },
    ],
    inclusions: ["Two guides", "Helmets in all sizes", "Snacks", "Hotel transfer"],
  },
];

export const REVIEWS: Review[] = [
  {
    id: "rv-1",
    riderId: "u-1",
    riderName: "Anya Petrov",
    riderAvatar: IMG.riderPortrait2,
    stableId: "st-meridian",
    stableName: "Meridian Stables",
    horseName: "Layla",
    stableRating: 5,
    horseRating: 5,
    comment:
      "We rode at sunrise. There were maybe four other people on the plateau. Layla was a perfect match — calm but eager. Hassan met us himself.",
    createdAt: "2025-04-12",
    mediaUrls: [IMG.galleryHorse1, IMG.pyramidsRider1],
  },
  {
    id: "rv-2",
    riderId: "u-2",
    riderName: "James Okafor",
    riderAvatar: IMG.riderPortrait3,
    stableId: "st-amber",
    stableName: "Amber House",
    horseName: "Khamsin",
    stableRating: 5,
    horseRating: 5,
    comment:
      "I've ridden in six countries. Amber House is in the top three. Quiet, considered, and the horses are clearly loved.",
    createdAt: "2025-04-08",
  },
  {
    id: "rv-3",
    riderId: "u-3",
    riderName: "Mariam Hassan",
    riderAvatar: IMG.riderPortrait1,
    stableId: "st-saqqara-rose",
    stableName: "Saqqara Rose",
    horseName: "Najm",
    stableRating: 5,
    horseRating: 4,
    comment:
      "The half-day expedition was the highlight of our trip. The historian guide made the older necropolis come alive.",
    createdAt: "2025-04-02",
    mediaUrls: [IMG.galleryHorse2],
  },
  {
    id: "rv-4",
    riderId: "u-4",
    riderName: "Lucas Bernard",
    riderAvatar: IMG.riderPortrait4,
    stableId: "st-meridian",
    stableName: "Meridian Stables",
    horseName: "Sphinx",
    stableRating: 5,
    horseRating: 5,
    comment: "Booked at 11pm, rode at 6am. PyraRides made it effortless. The horse was beautifully trained.",
    createdAt: "2025-03-28",
  },
  {
    id: "rv-5",
    riderId: "u-5",
    riderName: "Sophia Almeida",
    riderAvatar: IMG.riderPortrait5,
    stableId: "st-hares-arabian",
    stableName: "Hares Arabian Stud",
    horseName: "Ghazal",
    stableRating: 5,
    horseRating: 5,
    comment:
      "They asked about my experience for ten minutes before booking. I appreciated it. Ghazal was the most responsive horse I've ever ridden.",
    createdAt: "2025-03-22",
    mediaUrls: [IMG.galleryHorse3, IMG.galleryHorse4],
  },
  {
    id: "rv-6",
    riderId: "u-6",
    riderName: "Omar Tantawy",
    riderAvatar: IMG.riderPortrait3,
    stableId: "st-old-quarter",
    stableName: "Old Quarter Equestrian",
    horseName: "Karnak",
    stableRating: 4,
    horseRating: 5,
    comment: "Family-run for 60 years and you can feel it. My father rode here in the 80s. Some things you don't replace.",
    createdAt: "2025-03-15",
  },
  {
    id: "rv-7",
    riderId: "u-7",
    riderName: "Hannah Mueller",
    riderAvatar: IMG.riderPortrait2,
    stableId: "st-blue-nile",
    stableName: "Blue Nile Riding Co.",
    horseName: "Saffron",
    stableRating: 4,
    horseRating: 5,
    comment: "Took my 10-year-old. The team was patient and the horses were lovely. We'll be back.",
    createdAt: "2025-03-09",
  },
  {
    id: "rv-8",
    riderId: "u-8",
    riderName: "Daniel Kim",
    riderAvatar: IMG.riderPortrait4,
    stableId: "st-dahshur-bend",
    stableName: "Dahshur Bend",
    horseName: "Mirage",
    stableRating: 5,
    horseRating: 5,
    comment: "If you've already done the Giza ride, do this one. Quieter, longer, and the Bent Pyramid is unforgettable.",
    createdAt: "2025-02-28",
  },
];

export const ACADEMIES: Academy[] = [
  {
    id: "ac-meridian",
    name: "Meridian Riding Academy",
    slug: "meridian-riding-academy",
    location: "Giza Plateau",
    description:
      "An academy attached to Meridian Stables, run by certified BHS captains. Programs from absolute beginner through to intermediate dressage.",
    imageUrl: IMG.trainingRing,
    captainName: "Captain Yousef Saad",
    captainBio: "BHS-certified, fifteen years instructing across Egypt and the UK. Specialises in adult beginners.",
    captainAvatar: IMG.riderPortrait3,
    isActive: true,
    programs: [
      {
        id: "tp-1",
        academyId: "ac-meridian",
        name: "Foundation",
        skillLevel: "BEGINNER",
        totalSessions: 8,
        sessionDuration: 60,
        price: 6800,
        description: "Eight sessions covering mounting, balance, walk, halt, basic trot.",
      },
      {
        id: "tp-2",
        academyId: "ac-meridian",
        name: "Intermediate Trail",
        skillLevel: "INTERMEDIATE",
        totalSessions: 10,
        sessionDuration: 75,
        price: 9800,
        description: "Ten sessions for confident walkers ready to canter and ride out.",
      },
    ],
  },
  {
    id: "ac-saqqara",
    name: "Saqqara Equestrian School",
    slug: "saqqara-equestrian-school",
    location: "Saqqara Necropolis",
    description: "A focused school with a single ring and dedicated instructors. Small cohorts only.",
    imageUrl: IMG.saqqara,
    captainName: "Captain Reem Adel",
    captainBio: "Former competitive show jumper. Teaches with patience and precision.",
    captainAvatar: IMG.riderPortrait2,
    isActive: true,
    programs: [
      {
        id: "tp-3",
        academyId: "ac-saqqara",
        name: "Advanced Seat",
        skillLevel: "ADVANCED",
        totalSessions: 12,
        sessionDuration: 90,
        price: 14000,
        description: "Twelve sessions of refined position work and gallop.",
      },
    ],
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "g-1", url: IMG.pyramidsRider1, caption: "First light, first ride.", riderName: "Anya Petrov", stableName: "Meridian Stables", status: "approved", createdAt: "2025-04-12" },
  { id: "g-2", url: IMG.pyramidsRider2, caption: "Golden hour at the western face.", riderName: "James Okafor", stableName: "Amber House", status: "approved", createdAt: "2025-04-08" },
  { id: "g-3", url: IMG.desertRide, caption: "South of the plateau.", riderName: "Daniel Kim", stableName: "Dahshur Bend", status: "approved", createdAt: "2025-02-28" },
  { id: "g-4", url: IMG.arabianGrey, caption: "Khamsin, before the ride.", riderName: "James Okafor", stableName: "Amber House", status: "approved", createdAt: "2025-04-08" },
  { id: "g-5", url: IMG.saqqara, caption: "Saqqara, half-day expedition.", riderName: "Mariam Hassan", stableName: "Saqqara Rose", status: "approved", createdAt: "2025-04-02" },
  { id: "g-6", url: IMG.galleryHorse1, caption: "Layla.", riderName: "Anya Petrov", stableName: "Meridian Stables", status: "approved", createdAt: "2025-04-12" },
  { id: "g-7", url: IMG.galleryHorse2, caption: "Najm against the morning.", riderName: "Mariam Hassan", stableName: "Saqqara Rose", status: "approved", createdAt: "2025-04-02" },
  { id: "g-8", url: IMG.galleryHorse3, caption: "Ghazal.", riderName: "Sophia Almeida", stableName: "Hares Arabian Stud", status: "approved", createdAt: "2025-03-22" },
  { id: "g-9", url: IMG.galleryHorse4, caption: "Returning.", riderName: "Lucas Bernard", stableName: "Meridian Stables", status: "approved", createdAt: "2025-03-28" },
  { id: "g-10", url: IMG.desertSunset, caption: "Last light.", riderName: "Hannah Mueller", stableName: "Blue Nile Riding Co.", status: "approved", createdAt: "2025-03-09" },
  { id: "g-11", url: IMG.pyramidsWide, caption: "The plateau at dawn.", riderName: "Omar Tantawy", stableName: "Old Quarter Equestrian", status: "approved", createdAt: "2025-03-15" },
  { id: "g-12", url: IMG.whiteHorse, caption: "Sahar.", riderName: "Sophia Almeida", stableName: "Hares Arabian Stud", status: "approved", createdAt: "2025-03-22" },
];

export const LEADERBOARD: LeaderboardRider[] = [
  { id: "u-1", fullName: "Anya Petrov", profileImageUrl: IMG.riderPortrait2, rankPoints: 8420, league: "champion", ridesCompleted: 142, position: 1 },
  { id: "u-5", fullName: "Sophia Almeida", profileImageUrl: IMG.riderPortrait5, rankPoints: 7180, league: "elite", ridesCompleted: 119, position: 2 },
  { id: "u-2", fullName: "James Okafor", profileImageUrl: IMG.riderPortrait3, rankPoints: 6240, league: "elite", ridesCompleted: 98, position: 3 },
  { id: "u-4", fullName: "Lucas Bernard", profileImageUrl: IMG.riderPortrait4, rankPoints: 5180, league: "platinum", ridesCompleted: 87, position: 4 },
  { id: "u-8", fullName: "Daniel Kim", profileImageUrl: IMG.riderPortrait4, rankPoints: 4720, league: "platinum", ridesCompleted: 79, position: 5 },
  { id: "u-3", fullName: "Mariam Hassan", profileImageUrl: IMG.riderPortrait1, rankPoints: 4120, league: "gold", ridesCompleted: 68, position: 6 },
  { id: "u-7", fullName: "Hannah Mueller", profileImageUrl: IMG.riderPortrait2, rankPoints: 3680, league: "gold", ridesCompleted: 61, position: 7 },
  { id: "u-6", fullName: "Omar Tantawy", profileImageUrl: IMG.riderPortrait3, rankPoints: 2890, league: "silver", ridesCompleted: 49, position: 8 },
  { id: "u-9", fullName: "Léa Marchetti", profileImageUrl: IMG.riderPortrait5, rankPoints: 2240, league: "silver", ridesCompleted: 38, position: 9 },
  { id: "u-10", fullName: "Adam Khalil", profileImageUrl: IMG.riderPortrait4, rankPoints: 1820, league: "bronze", ridesCompleted: 31, position: 10 },
  { id: "u-11", fullName: "Priya Shah", profileImageUrl: IMG.riderPortrait1, rankPoints: 1420, league: "bronze", ridesCompleted: 24, position: 11 },
  { id: "u-12", fullName: "Noor Al-Ahmadi", profileImageUrl: IMG.riderPortrait2, rankPoints: 980, league: "wood", ridesCompleted: 16, position: 12 },
];

export const DEMO_USERS: Record<string, User> = {
  rider: {
    id: "demo-rider",
    email: "rider@pyrarides.com",
    fullName: "Anya Petrov",
    profileImageUrl: IMG.riderPortrait2,
    role: "rider",
    rankPoints: 8420,
    currentLeague: "champion",
    isTrustedRider: true,
    bio: "Eight countries, three continents, one favourite ride.",
  },
  stable_owner: {
    id: "demo-owner",
    email: "owner@pyrarides.com",
    fullName: "Hassan El-Sayed",
    profileImageUrl: IMG.riderPortrait3,
    role: "stable_owner",
    rankPoints: 0,
    currentLeague: "wood",
    bio: "Third generation. Meridian Stables, Giza Plateau.",
  },
  captain: {
    id: "demo-captain",
    email: "captain@pyrarides.com",
    fullName: "Captain Yousef Saad",
    profileImageUrl: IMG.riderPortrait3,
    role: "captain",
    rankPoints: 0,
    currentLeague: "wood",
    bio: "BHS-certified, fifteen years in the saddle.",
  },
  driver: {
    id: "demo-driver",
    email: "driver@pyrarides.com",
    fullName: "Tarek Hosni",
    profileImageUrl: IMG.riderPortrait4,
    role: "driver",
    rankPoints: 0,
    currentLeague: "wood",
    bio: "Concierge transfer driver, twelve years on the plateau roads.",
  },
  cx_media: {
    id: "demo-cx",
    email: "cx@pyrarides.com",
    fullName: "Léa Marchetti",
    profileImageUrl: IMG.riderPortrait5,
    role: "cx_media",
    rankPoints: 0,
    currentLeague: "wood",
    bio: "House photographer and guest correspondence.",
  },
  admin: {
    id: "demo-admin",
    email: "admin@pyrarides.com",
    fullName: "Nour Ibrahim",
    profileImageUrl: IMG.riderPortrait1,
    role: "admin",
    rankPoints: 0,
    currentLeague: "wood",
    bio: "House operations, all estates.",
  },
};

