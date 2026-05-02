import { Router, Request, Response, NextFunction } from "express";
import type { DbUser } from "../lib/auth-db";
import {
  getUserBookings,
  createBooking,
  createPackageBooking,
  getUserPackageBookings,
  createTrainingEnrollment,
  getUserEnrollments,
  createReview,
  getStableReviews,
  getUserLoyalty,
} from "../lib/extended-db";

declare global {
  namespace Express {
    interface Request {
      sessionUser?: DbUser;
    }
  }
}
import {
  findUserWithHashByIdentifier,
  findUserByEmail,
  findSessionUser,
  createSession,
  deleteSession,
  createUser,
  verifyPassword,
  userToResponse,
} from "../lib/auth-db";

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const sid = req.cookies?.sid as string | undefined;
  if (!sid) { res.status(401).json({ error: "Authentication required" }); return; }
  findSessionUser(sid).then((user) => {
    if (!user) { res.status(401).json({ error: "Authentication required" }); return; }
    req.sessionUser = user;
    next();
  }).catch((err: unknown) => {
    console.error("requireAuth error:", err);
    res.status(500).json({ error: "Internal server error" });
  });
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const sid = req.cookies?.sid as string | undefined;
  if (!sid) { res.status(401).json({ error: "Authentication required" }); return; }
  findSessionUser(sid).then((user) => {
    if (!user) { res.status(401).json({ error: "Authentication required" }); return; }
    if (user.role !== "admin") { res.status(403).json({ error: "Admin access required" }); return; }
    req.sessionUser = user;
    next();
  }).catch((err: unknown) => {
    console.error("requireAdmin error:", err);
    res.status(500).json({ error: "Internal server error" });
  });
}

const router = Router();

const LOCATIONS = [
  { id: "giza", name: "Giza", isActive: true, _count: { stables: 5 } },
  { id: "saqqara", name: "Saqqara", isActive: true, _count: { stables: 3 } },
  { id: "luxor", name: "Luxor", isActive: true, _count: { stables: 2 } },
  { id: "sharm", name: "Sharm El-Sheikh", isActive: true, _count: { stables: 2 } },
];

const HORSES = [
  { id: "h1", name: "Anubis", imageUrls: ["/hero-bg.webp"], isActive: true, pricePerHour: 150, discountPercent: null, color: "bay", skills: ["dressage", "trail"], skillLevel: "beginner", adminTier: null, media: [] },
  { id: "h2", name: "Cleopatra", imageUrls: ["/hero-bg.webp"], isActive: true, pricePerHour: 200, discountPercent: 10, color: "grey", skills: ["jumping", "trail"], skillLevel: "intermediate", adminTier: null, media: [] },
  { id: "h3", name: "Ramses", imageUrls: ["/hero-bg.webp"], isActive: true, pricePerHour: 180, discountPercent: null, color: "chestnut", skills: ["trail"], skillLevel: "beginner", adminTier: null, media: [] },
  { id: "h4", name: "Nefertiti", imageUrls: ["/hero-bg.webp"], isActive: true, pricePerHour: 250, discountPercent: 15, color: "black", skills: ["dressage", "jumping"], skillLevel: "advanced", adminTier: "premium", media: [] },
];

const STABLES = [
  {
    id: "stable-1",
    name: "Pyramids View Stables",
    description: "Ride alongside the Great Pyramids of Giza with breathtaking views. Our experienced guides ensure a safe and unforgettable experience.",
    location: "Giza",
    address: "Pyramid Road, Giza, Egypt",
    imageUrl: "/hero-bg.webp",
    rating: 4.9,
    totalBookings: 1240,
    totalReviews: 312,
    minLeadTimeHours: 2,
    createdAt: "2023-01-15T00:00:00.000Z",
    distanceKm: 3.2,
    owner: { id: "owner-1", fullName: "Hassan El-Masry", email: "hassan@pyramidsview.com" },
    horses: HORSES.slice(0, 3),
    reviews: [
      { id: "r1", stableRating: 5, horseRating: 5, comment: "Absolutely magical experience!", rider: { fullName: "Sarah Johnson", email: "sarah@example.com" }, reviewMedias: [], createdAt: "2024-03-01T00:00:00.000Z" },
      { id: "r2", stableRating: 5, horseRating: 4, comment: "Best ride of my life, highly recommend!", rider: { fullName: "Ahmed Ali", email: "ahmed@example.com" }, reviewMedias: [], createdAt: "2024-02-15T00:00:00.000Z" },
    ],
  },
  {
    id: "stable-2",
    name: "Saqqara Desert Riders",
    description: "Explore the ancient Saqqara necropolis on horseback. A unique adventure through Egypt's oldest pyramid complex.",
    location: "Saqqara",
    address: "Saqqara Road, Badrashin, Egypt",
    imageUrl: "/hero-bg.webp",
    rating: 4.7,
    totalBookings: 876,
    totalReviews: 198,
    minLeadTimeHours: 3,
    createdAt: "2023-03-20T00:00:00.000Z",
    distanceKm: 12.5,
    owner: { id: "owner-2", fullName: "Khaled Ibrahim", email: "khaled@saqqarariders.com" },
    horses: HORSES.slice(1, 4),
    reviews: [
      { id: "r3", stableRating: 5, horseRating: 5, comment: "Incredible history and amazing horses!", rider: { fullName: "Maria Garcia", email: "maria@example.com" }, reviewMedias: [], createdAt: "2024-03-10T00:00:00.000Z" },
    ],
  },
  {
    id: "stable-3",
    name: "Nile Valley Equestrian",
    description: "Scenic rides along the Nile Valley with stunning sunset views. Perfect for romantic getaways and family adventures.",
    location: "Giza",
    address: "Corniche El-Nile, Giza, Egypt",
    imageUrl: "/hero-bg.webp",
    rating: 4.8,
    totalBookings: 654,
    totalReviews: 145,
    minLeadTimeHours: 2,
    createdAt: "2023-06-01T00:00:00.000Z",
    distanceKm: 5.1,
    owner: { id: "owner-3", fullName: "Amal Yousef", email: "amal@nilevalley.com" },
    horses: [HORSES[0], HORSES[3]],
    reviews: [],
  },
  {
    id: "stable-4",
    name: "Memphis Horse Ranch",
    description: "Experience Egyptian equestrian culture at the ancient city of Memphis. Expert trainers for all levels.",
    location: "Saqqara",
    address: "Mit Rahina, Memphis, Egypt",
    imageUrl: "/hero-bg.webp",
    rating: 4.6,
    totalBookings: 432,
    totalReviews: 89,
    minLeadTimeHours: 4,
    createdAt: "2023-09-10T00:00:00.000Z",
    distanceKm: 18.7,
    owner: { id: "owner-4", fullName: "Omar Farouk", email: "omar@memphisranch.com" },
    horses: HORSES.slice(0, 2),
    reviews: [],
  },
];

const PACKAGES = [
  {
    id: "pkg-1",
    title: "Pyramids Sunrise Ride",
    description: "Watch the sun rise over the Great Pyramids from horseback. A once-in-a-lifetime experience including professional photos.",
    price: 1200,
    originalPrice: 1500,
    packageType: "premium",
    minPeople: 1,
    maxPeople: 6,
    duration: 120,
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"],
    startTime: "06:00",
    hasHorseRide: true,
    hasFood: true,
    hasDancingShow: false,
    hasParty: false,
    hasTransportation: true,
    transportationType: "hotel_pickup",
    included: ["Professional guide", "Hotel pickup & dropoff", "Breakfast", "Photos"],
    highlights: ["Sunrise views", "Great Pyramid backdrop", "Camel optional"],
    imageUrl: "/hero-bg.webp",
    isActive: true,
    createdAt: "2023-02-01T00:00:00.000Z",
    stable: { id: "stable-1", name: "Pyramids View Stables", location: "Giza" },
  },
  {
    id: "pkg-2",
    title: "Saqqara Half-Day Adventure",
    description: "Explore the Step Pyramid and ancient tombs on horseback. Includes lunch and guided historical tour.",
    price: 800,
    originalPrice: null,
    packageType: "standard",
    minPeople: 2,
    maxPeople: 8,
    duration: 180,
    availableDays: ["Tuesday", "Thursday", "Saturday", "Sunday"],
    startTime: "09:00",
    hasHorseRide: true,
    hasFood: true,
    hasDancingShow: false,
    hasParty: false,
    hasTransportation: false,
    transportationType: null,
    included: ["Experienced guide", "Lunch", "Water", "Historical briefing"],
    highlights: ["Step Pyramid", "Ancient tombs", "Desert landscape"],
    imageUrl: "/hero-bg.webp",
    isActive: true,
    createdAt: "2023-03-15T00:00:00.000Z",
    stable: { id: "stable-2", name: "Saqqara Desert Riders", location: "Saqqara" },
  },
  {
    id: "pkg-3",
    title: "Sunset Nile Valley Ride",
    description: "A romantic sunset ride along the Nile with dinner at a riverside restaurant.",
    price: 950,
    originalPrice: 1100,
    packageType: "premium",
    minPeople: 1,
    maxPeople: 4,
    duration: 150,
    availableDays: ["Wednesday", "Friday", "Saturday", "Sunday"],
    startTime: "17:00",
    hasHorseRide: true,
    hasFood: true,
    hasDancingShow: true,
    hasParty: false,
    hasTransportation: true,
    transportationType: "private_car",
    included: ["Private guide", "Dinner", "Transportation", "Traditional show"],
    highlights: ["Nile sunset", "Romantic atmosphere", "Live music"],
    imageUrl: "/hero-bg.webp",
    isActive: true,
    createdAt: "2023-05-20T00:00:00.000Z",
    stable: { id: "stable-3", name: "Nile Valley Equestrian", location: "Giza" },
  },
  {
    id: "pkg-4",
    title: "Full-Day Desert Expedition",
    description: "A full day exploring the Egyptian desert with lunch, camel option, and campfire experience.",
    price: 1800,
    originalPrice: 2200,
    packageType: "exclusive",
    minPeople: 2,
    maxPeople: 10,
    duration: 480,
    availableDays: ["Saturday", "Sunday"],
    startTime: "07:00",
    hasHorseRide: true,
    hasFood: true,
    hasDancingShow: true,
    hasParty: true,
    hasTransportation: true,
    transportationType: "bus",
    included: ["All meals", "Camel ride", "Campfire", "Entertainment", "Transport"],
    highlights: ["Desert camping", "Traditional Bedouin lunch", "Stargazing"],
    imageUrl: "/hero-bg.webp",
    isActive: true,
    createdAt: "2023-07-10T00:00:00.000Z",
    stable: { id: "stable-1", name: "Pyramids View Stables", location: "Giza" },
  },
];

const ACADEMIES = [
  {
    id: "acad-1",
    name: "Cairo Equestrian Academy",
    description: "Professional riding lessons for all ages and skill levels. Certified instructors with international experience.",
    location: "Giza",
    imageUrl: "/hero-bg.webp",
    captain: { fullName: "Ahmed El-Sayed", profileImageUrl: null, bio: "15 years of equestrian training experience" },
    programs: [
      { id: "prog-1", name: "Beginner Basics", level: "beginner", price: 300 },
      { id: "prog-2", name: "Intermediate Dressage", level: "intermediate", price: 500 },
      { id: "prog-3", name: "Advanced Show Jumping", level: "advanced", price: 800 },
    ],
    _count: { enrollments: 145 },
  },
  {
    id: "acad-2",
    name: "Pyramids Riding School",
    description: "Learn to ride with the pyramids as your backdrop. Specialized in desert riding techniques.",
    location: "Giza",
    imageUrl: "/hero-bg.webp",
    captain: { fullName: "Layla Mansour", profileImageUrl: null, bio: "Former national champion, 10 years teaching" },
    programs: [
      { id: "prog-4", name: "Desert Riding Intro", level: "beginner", price: 350 },
      { id: "prog-5", name: "Trail Mastery", level: "intermediate", price: 550 },
    ],
    _count: { enrollments: 98 },
  },
];

router.get("/locations", (_req, res) => {
  res.json(LOCATIONS);
});

router.get("/stables", (req, res) => {
  const { location, search, minRating, sort, limit } = req.query;
  let results = [...STABLES];
  if (location && location !== "all") {
    results = results.filter(s => s.location.toLowerCase() === String(location).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }
  if (minRating) {
    results = results.filter(s => s.rating >= parseFloat(String(minRating)));
  }
  if (sort === "rating") results.sort((a, b) => b.rating - a.rating);
  else if (sort === "bookings") results.sort((a, b) => b.totalBookings - a.totalBookings);
  if (limit) results = results.slice(0, parseInt(String(limit)));
  res.json({ stables: results, total: results.length });
});

router.get("/stables/:id", (req, res) => {
  const stable = STABLES.find(s => s.id === req.params.id);
  if (!stable) return res.status(404).json({ error: "Stable not found" });
  return res.json(stable);
});

router.get("/stables/:id/coordinates", (req, res) => {
  const stable = STABLES.find(s => s.id === req.params.id);
  if (!stable) return res.status(404).json({ error: "Not found" });
  const coords: Record<string, { lat: number; lng: number }> = {
    "stable-1": { lat: 29.9773, lng: 31.1325 },
    "stable-2": { lat: 29.8714, lng: 31.2168 },
    "stable-3": { lat: 29.9960, lng: 31.2284 },
    "stable-4": { lat: 29.8500, lng: 31.2500 },
  };
  return res.json({ coordinates: coords[req.params.id] || { lat: 29.9773, lng: 31.1325 }, address: stable.address });
});

router.get("/stables/:id/slots", (_req, res) => {
  res.json([]);
});

router.get("/stables/:id/announce", (_req, res) => {
  res.json({ announcement: null });
});

router.post("/stables/:id/announce", (req, res) => {
  res.json({ success: true, announcement: req.body?.announcement });
});

router.post("/stables/:id/slots", (_req, res) => {
  res.json({ success: true, slot: { id: "slot-new", date: new Date().toISOString() } });
});

router.delete("/stables/:id/slots", (_req, res) => {
  res.json({ success: true });
});

router.get("/packages", (req, res) => {
  const { stableId, type } = req.query;
  let results = [...PACKAGES];
  if (stableId) results = results.filter(p => p.stable.id === String(stableId));
  if (type) results = results.filter(p => p.packageType === String(type));
  res.json(results);
});

router.get("/packages/:id", (req, res) => {
  const pkg = PACKAGES.find(p => p.id === req.params.id);
  if (!pkg) return res.status(404).json({ error: "Package not found" });
  return res.json(pkg);
});

router.get("/horses", (req, res) => {
  const { stableId } = req.query;
  let results = [...HORSES];
  if (stableId) {
    const stable = STABLES.find(s => s.id === String(stableId));
    results = stable ? stable.horses : [];
  }
  res.json(results);
});

router.get("/academies", (req, res) => {
  const { location } = req.query;
  let results = [...ACADEMIES];
  if (location) results = results.filter(a => a.location.toLowerCase() === String(location).toLowerCase());
  res.json(results);
});

router.get("/academies/:id", (req, res) => {
  const academy = ACADEMIES.find(a => a.id === req.params.id);
  if (!academy) return res.status(404).json({ error: "Academy not found" });
  return res.json(academy);
});

router.get("/auth/session", async (req, res) => {
  const sid = req.cookies?.sid as string | undefined;
  if (!sid) { res.json({ user: null }); return; }
  try {
    const dbUser = await findSessionUser(sid);
    res.json({ user: dbUser ? userToResponse(dbUser) : null });
  } catch (err: unknown) {
    console.error("session error:", err);
    res.json({ user: null });
  }
});

router.post("/auth/signin", async (req, res) => {
  const identifier: string | undefined = req.body.email ?? req.body.identifier;
  const password: string | undefined = req.body.password;
  if (!identifier) { res.status(400).json({ error: "Email or phone required" }); return; }
  if (!password) { res.status(400).json({ error: "Password required" }); return; }
  try {
    const dbUser = await findUserWithHashByIdentifier(identifier);
    if (!dbUser) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const valid = await verifyPassword(password, dbUser.password_hash);
    if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const sid = await createSession(dbUser.id);
    res.cookie("sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: userToResponse(dbUser) });
  } catch (err: unknown) {
    console.error("signin error:", err);
    res.status(500).json({ error: "Authentication service unavailable" });
  }
});

router.post("/auth/signout", async (req, res) => {
  const sid = req.cookies?.sid as string | undefined;
  if (sid) { try { await deleteSession(sid); } catch (err: unknown) { console.error("signout error:", err); } }
  res.clearCookie("sid");
  res.json({ success: true });
});

router.post("/auth/register", async (req, res) => {
  const { email, phoneNumber, password, fullName } = req.body;
  if (!email && !phoneNumber) return res.status(400).json({ error: "Email or phone required" });
  if (!password) return res.status(400).json({ error: "Password required" });
  try {
    const dbUser = await createUser({ email, phoneNumber, password, fullName, role: "rider" });
    const sid = await createSession(dbUser.id);
    res.cookie("sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ user: { id: dbUser.id, email: dbUser.email, fullName: dbUser.full_name, role: dbUser.role, profileImageUrl: dbUser.profile_image_url } });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ error: "Account already exists" });
    return res.status(500).json({ error: "Registration service unavailable" });
  }
});

router.post("/auth/forgot-password", (_req, res) => {
  res.json({ success: true, message: "If an account exists, you'll receive a reset email." });
});

router.post("/auth/reset-password", (_req, res) => {
  res.json({ success: true, message: "Password reset successfully." });
});

router.get("/weather", (req, res) => {
  const { location } = req.query;
  res.json({
    location: location || "Giza",
    temperature: 28,
    condition: "Sunny",
    humidity: 35,
    windSpeed: 12,
    icon: "sun",
    feelsLike: 31,
    forecast: [
      { day: "Today", high: 32, low: 22, condition: "Sunny" },
      { day: "Tomorrow", high: 30, low: 21, condition: "Partly Cloudy" },
      { day: "Day 3", high: 29, low: 20, condition: "Sunny" },
    ],
  });
});

router.get("/bookings", requireAuth, async (req, res) => {
  try {
    const bookings = await getUserBookings(req.sessionUser!.id);
    res.json({ bookings, total: bookings.length });
  } catch (err: unknown) {
    console.error("GET /bookings error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.post("/bookings", requireAuth, async (req, res) => {
  const { stableId, horseId, date, startTime, endTime, durationHrs, notes } = req.body;
  if (!stableId || !date || !startTime) {
    res.status(400).json({ error: "stableId, date, and startTime are required" });
    return;
  }
  try {
    const booking = await createBooking({
      userId: req.sessionUser!.id,
      stableId, horseId, date, startTime, endTime, durationHrs, notes,
    });
    res.json({ success: true, booking });
  } catch (err: unknown) {
    console.error("POST /bookings error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

router.get("/bookings/:id", (req, res) => {
  res.json({ id: req.params.id, status: "pending", createdAt: new Date().toISOString() });
});

router.get("/favorites", (_req, res) => {
  res.json([]);
});

router.post("/favorites", (req, res) => {
  res.json({ success: true, ...req.body });
});

router.delete("/favorites/:id", (_req, res) => {
  res.json({ success: true });
});

router.post("/checkout", (req, res) => {
  res.json({ success: true, bookingId: "booking-" + Date.now(), ...req.body });
});

router.post("/checkout/package", requireAuth, async (req, res) => {
  const { packageId, date, startTime, ticketsCount, transportationZoneId, pickupLocationUrl } = req.body;
  if (!packageId || !date) {
    res.status(400).json({ error: "packageId and date are required" });
    return;
  }
  try {
    const booking = await createPackageBooking({
      userId: req.sessionUser!.id,
      packageId, date,
      startTime: startTime ?? "10:00",
      ticketsCount: ticketsCount ?? 1,
      transportZoneId: transportationZoneId ?? undefined,
      pickupLocationUrl: pickupLocationUrl ?? undefined,
    });
    res.json({ success: true, bookingId: booking.id, booking });
  } catch (err: unknown) {
    console.error("POST /checkout/package error:", err);
    res.status(500).json({ error: "Failed to create package booking" });
  }
});

router.get("/notifications", (_req, res) => {
  res.json([]);
});

router.get("/gallery", (_req, res) => {
  res.json({ media: [], total: 0 });
});

router.get("/cx/gallery", (_req, res) => {
  res.json({ media: [], total: 0 });
});

router.get("/leaderboard", (_req, res) => {
  res.json({ riders: [], total: 0 });
});

router.get("/loyalty", requireAuth, async (req, res) => {
  try {
    const data = await getUserLoyalty(req.sessionUser!.id);
    res.json(data);
  } catch (err: unknown) {
    console.error("GET /loyalty error:", err);
    res.status(500).json({ error: "Failed to fetch loyalty data" });
  }
});

router.get("/friends", (_req, res) => {
  res.json([]);
});

router.get("/users/search", (req, res) => {
  const { q } = req.query;
  res.json({ users: [], query: q });
});

router.get("/users/:id", (req, res) => {
  res.json({ id: req.params.id, fullName: "User", email: "", role: "rider" });
});

router.get("/conversations", (_req, res) => {
  res.json([]);
});

router.get("/messages", (_req, res) => {
  res.json([]);
});

router.post("/messages", (req, res) => {
  res.json({ success: true, message: { id: "msg-" + Date.now(), ...req.body } });
});

router.get("/coming-soon/status", (_req, res) => {
  res.json({ active: false });
});

router.post("/newsletter/subscribe", (req, res) => {
  res.json({ success: true, email: req.body?.email });
});

router.get("/training/enrollments/:id", (req, res) => {
  res.json({ id: req.params.id, status: "active", academy: ACADEMIES[0], program: ACADEMIES[0].programs[0] });
});

router.get("/my-stable", (_req, res) => {
  res.json(null);
});

router.get("/captain/dashboard", (_req, res) => {
  res.json({ sessions: [], stats: { totalSessions: 0, totalStudents: 0 } });
});

router.get("/captain/sessions/:id", (req, res) => {
  res.json({ id: req.params.id, status: "scheduled" });
});

router.get("/driver/orders/available", (_req, res) => {
  res.json([]);
});

router.get("/driver/orders/active", (_req, res) => {
  res.json([]);
});

router.get("/driver/orders/history", (_req, res) => {
  res.json([]);
});

router.get("/driver/orders/:id", (req, res) => {
  res.json({ id: req.params.id, status: "pending" });
});

router.get("/analytics", (_req, res) => {
  res.json({ pageViews: 0, bookings: 0, revenue: 0 });
});

router.use("/admin", requireAdmin);

router.get("/admin/stables", (_req, res) => {
  res.json({ stables: STABLES, total: STABLES.length });
});

router.get("/admin/stables/:id", (req, res) => {
  const stable = STABLES.find(s => s.id === req.params.id);
  if (!stable) return res.status(404).json({ error: "Not found" });
  return res.json(stable);
});

router.get("/admin/packages", (_req, res) => {
  res.json({ packages: PACKAGES, total: PACKAGES.length });
});

router.get("/admin/packages/bookings", (_req, res) => {
  res.json({ bookings: [], total: 0 });
});

router.get("/admin/locations", (_req, res) => {
  res.json(LOCATIONS);
});

router.post("/admin/locations", (req, res) => {
  res.json({ id: "loc-" + Date.now(), ...req.body });
});

router.get("/admin/horses", (_req, res) => {
  res.json({ horses: HORSES, total: HORSES.length });
});

router.get("/admin/horses/:id", (req, res) => {
  const horse = HORSES.find(h => h.id === req.params.id);
  if (!horse) return res.status(404).json({ error: "Not found" });
  return res.json(horse);
});

router.get("/admin/bookings", (_req, res) => {
  res.json({ bookings: [], total: 0 });
});

router.get("/admin/bookings/instant", (_req, res) => {
  res.json({ bookings: [], total: 0 });
});

router.post("/admin/bookings/instant", (req, res) => {
  const { riderEmail, horseId, stableId, date, startTime, endTime, notes } = req.body;
  if (!riderEmail || !horseId || !stableId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  return res.json({
    success: true,
    bookingId: "instant-" + Date.now(),
    message: "Instant booking created successfully",
    booking: { riderEmail, horseId, stableId, date, startTime, endTime, notes, status: "confirmed" }
  });
});

router.get("/admin/users", (_req, res) => {
  res.json({ users: [], total: 0 });
});

router.get("/admin/premium", (_req, res) => {
  res.json({ subscribers: [], total: 0 });
});

router.get("/admin/academies", (_req, res) => {
  res.json({ academies: ACADEMIES, total: ACADEMIES.length });
});

router.get("/admin/academies/programs", (_req, res) => {
  res.json([]);
});

router.post("/admin/academies", (req, res) => {
  res.json({ id: "acad-" + Date.now(), ...req.body });
});

router.get("/admin/academies/:id", (req, res) => {
  const academy = ACADEMIES.find(a => a.id === req.params.id);
  if (!academy) return res.status(404).json({ error: "Not found" });
  return res.json(academy);
});

router.get("/admin/academies/:id/price", (req, res) => {
  res.json({ price: 500, academyId: req.params.id });
});

router.get("/admin/transport", (_req, res) => {
  res.json({ orders: [], total: 0 });
});

router.get("/admin/horse-changes", (_req, res) => {
  res.json({ changes: [], total: 0 });
});

router.post("/ai-chat", async (req, res) => {
  const { message, conversationHistory = [], currentPage = "/" } = req.body as {
    message: string;
    conversationHistory: Array<{ role: string; content: string }>;
    currentPage: string;
  };

  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    const { openai } = await import("@workspace/integrations-openai-ai-server");

    const systemPrompt = `You are Yara, a luxury private concierge for PyraRides — Egypt's premier equestrian experience platform. You help guests discover and book exclusive horse riding experiences, curated journeys, and training programmes near the Pyramids of Giza and across Egypt.

Your personality: warm, refined, knowledgeable, and subtly eloquent — like a five-star hotel concierge. Use graceful, polished language without being flowery. Keep responses concise (2-4 sentences max unless details are needed).

Key services you help with:
- Curated horse riding journeys & packages (Pyramid rides, desert trails, sunrise rides)
- Training academy enrollments (beginner to advanced)
- Stable browsing & selection
- Booking logistics (dates, group sizes, transport from Cairo/Giza hotels)
- Loyalty rewards programme (Bronze → Silver → Gold → Platinum tiers)

Current page context: ${currentPage}

Always end with 2-3 brief contextual follow-up suggestions formatted as JSON after your response text like this:
SUGGESTIONS: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 400,
      messages,
    });

    const raw = completion.choices[0]?.message?.content ?? "A pleasure. Allow me a moment to find the perfect experience for you.";

    const suggMatch = raw.match(/SUGGESTIONS:\s*(\[[\s\S]*?\])/);
    let suggestions: string[] = [];
    let responseText = raw;

    if (suggMatch) {
      try {
        suggestions = JSON.parse(suggMatch[1]);
      } catch { /* ignore */ }
      responseText = raw.replace(/SUGGESTIONS:\s*\[[\s\S]*?\]/, "").trim();
    }

    res.json({ response: responseText, suggestions, actions: [] });
  } catch (err: unknown) {
    console.error("ai-chat error:", err);
    res.json({
      response: "My apologies — I'm having a moment of difficulty. Our human concierge team is available at any time to assist you directly.",
      suggestions: ["Browse our packages", "View stables", "Contact us"],
      actions: [],
    });
  }
});

router.get("/users/verify", (_req, res) => {
  res.json({ valid: false, user: null });
});

router.post("/users/verify", async (req, res) => {
  const email: string | undefined = req.body?.email;
  if (!email) { res.status(400).json({ error: "Email required" }); return; }
  try {
    const dbUser = await findUserByEmail(email);
    if (!dbUser) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ valid: true, user: userToResponse(dbUser) });
  } catch (err: unknown) {
    console.error("users/verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notifications/video-call", (_req, res) => {
  res.json({ active: false });
});

router.post("/notifications/video-call", (_req, res) => {
  res.json({ success: true });
});

router.get("/reviews", async (req, res) => {
  const { stableId } = req.query;
  if (stableId) {
    try {
      const reviews = await getStableReviews(String(stableId));
      res.json({ reviews, total: reviews.length });
      return;
    } catch (err: unknown) {
      console.error("GET /reviews error:", err);
      res.status(500).json({ error: "Failed to fetch reviews" });
      return;
    }
  }
  res.json([]);
});

router.post("/reviews", requireAuth, async (req, res) => {
  const { bookingId, stableId, stableRating, horseRating, comment, photos } = req.body;
  if (!stableId || !stableRating) {
    res.status(400).json({ error: "stableId and stableRating are required" });
    return;
  }
  try {
    const review = await createReview({
      userId: req.sessionUser!.id,
      bookingId, stableId,
      stableRating: Number(stableRating),
      horseRating: Number(horseRating ?? stableRating),
      comment, photos,
    });
    res.json({ success: true, review });
  } catch (err: unknown) {
    console.error("POST /reviews error:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

router.get("/chat/conversations", (_req, res) => {
  res.json([]);
});

router.post("/chat/conversations", (req, res) => {
  const conv = { id: "conv-" + Date.now(), ...req.body };
  res.json({ conversation: conv });
});

router.put("/my-stable", (req, res) => {
  res.json({ success: true, ...req.body });
});

router.get("/users/:id/profile", (req, res) => {
  res.json({ id: req.params.id, fullName: "User", email: "", role: "rider", profileImageUrl: null });
});

router.put("/users/:id/profile", (req, res) => {
  res.json({ success: true, ...req.body });
});

router.get("/admin/reviews", (_req, res) => {
  res.json({ reviews: [], total: 0 });
});

router.get("/stables/:id/reviews", async (req, res) => {
  try {
    const reviews = await getStableReviews(req.params.id);
    const fallbackStable = STABLES.find(s => s.id === req.params.id);
    const merged = reviews.length > 0 ? reviews : (fallbackStable?.reviews ?? []);
    res.json({ reviews: merged, total: merged.length });
  } catch (err: unknown) {
    console.error("GET /stables/:id/reviews error:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/horses/:id", (req, res) => {
  const horse = HORSES.find(h => h.id === req.params.id);
  if (!horse) return res.status(404).json({ error: "Not found" });
  return res.json(horse);
});

router.put("/horses/:id", (req, res) => {
  res.json({ success: true, id: req.params.id, ...req.body });
});

router.get("/training", (_req, res) => {
  res.json(ACADEMIES);
});

router.get("/training/enrollments", requireAuth, async (req, res) => {
  try {
    const enrollments = await getUserEnrollments(req.sessionUser!.id);
    res.json(enrollments);
  } catch (err: unknown) {
    console.error("GET /training/enrollments error:", err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

router.post("/training/enroll", requireAuth, async (req, res) => {
  const { programId, startDate, paymentMethod, paymentStructure } = req.body;
  const academyId = req.body.academyId ?? req.body.academy_id;
  if (!programId || !startDate) {
    res.status(400).json({ error: "programId and startDate are required" });
    return;
  }
  try {
    const enrollment = await createTrainingEnrollment({
      userId: req.sessionUser!.id,
      academyId: academyId ?? "unknown",
      programId, startDate, paymentMethod, paymentStructure,
    });
    res.json({ success: true, enrollmentId: enrollment.id, enrollment });
  } catch (err: unknown) {
    console.error("POST /training/enroll error:", err);
    res.status(500).json({ error: "Failed to create enrollment" });
  }
});

router.get("/stable-os/dashboard", (_req, res) => {
  res.json({ bookings: [], revenue: 0, horses: [] });
});

export default router;
