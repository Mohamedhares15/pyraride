import { Router, Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";

type SessionUser = { id: string; email: string; fullName: string; role: string; profileImageUrl: null };
const sessions = new Map<string, SessionUser>();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sid = req.cookies?.sid as string | undefined;
  if (!sid || !sessions.has(sid)) {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const sid = req.cookies?.sid as string | undefined;
  const user = sid ? sessions.get(sid) : undefined;
  if (!user) return res.status(401).json({ error: "Authentication required" });
  if (user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  return next();
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
  res.json({ slots: [] });
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

router.get("/auth/session", (req, res) => {
  const sid = req.cookies?.sid as string | undefined;
  const user = sid ? sessions.get(sid) ?? null : null;
  res.json({ user });
});

router.post("/auth/signin", (req, res) => {
  const identifier: string | undefined = req.body.email ?? req.body.identifier;
  if (!identifier) return res.status(400).json({ error: "Email or phone required" });
  const sid = randomBytes(24).toString("hex");
  const user: SessionUser = { id: "user-" + sid.slice(0, 8), email: identifier, fullName: "Guest User", role: "rider", profileImageUrl: null };
  sessions.set(sid, user);
  res.cookie("sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  return res.json({ user });
});

router.post("/auth/signout", (req, res) => {
  const sid = req.cookies?.sid as string | undefined;
  if (sid) sessions.delete(sid);
  res.clearCookie("sid");
  res.json({ success: true });
});

router.post("/auth/register", (req, res) => {
  const { email, fullName } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const sid = randomBytes(24).toString("hex");
  const user: SessionUser = { id: "user-" + sid.slice(0, 8), email, fullName: fullName ?? "New User", role: "rider", profileImageUrl: null };
  sessions.set(sid, user);
  res.cookie("sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  return res.json({ user });
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

router.get("/bookings", (_req, res) => {
  res.json({ bookings: [], total: 0 });
});

router.post("/bookings", (req, res) => {
  res.json({ success: true, booking: { id: "booking-new", ...req.body, status: "pending", createdAt: new Date().toISOString() } });
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

router.post("/checkout/package", (req, res) => {
  res.json({ success: true, bookingId: "pkg-booking-" + Date.now(), ...req.body });
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

router.get("/loyalty", (_req, res) => {
  res.json({ points: 0, tier: "bronze", history: [] });
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

router.post("/ai-chat", (req, res) => {
  const { message } = req.body;
  res.json({
    reply: `Thanks for your question about "${message}". Our team can help you find the perfect horse riding experience in Egypt! Visit our stables page to browse available options.`,
  });
});

router.get("/users/verify", (_req, res) => {
  res.json({ valid: false, user: null });
});

router.post("/users/verify", (req, res) => {
  res.json({ valid: true, user: { email: req.body?.email } });
});

router.get("/notifications/video-call", (_req, res) => {
  res.json({ active: false });
});

router.post("/notifications/video-call", (_req, res) => {
  res.json({ success: true });
});

router.get("/reviews", (_req, res) => {
  res.json([]);
});

router.post("/reviews", (req, res) => {
  res.json({ success: true, review: { id: "review-" + Date.now(), ...req.body } });
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

router.get("/stables/:id/reviews", (req, res) => {
  const stable = STABLES.find(s => s.id === req.params.id);
  res.json({ reviews: stable?.reviews || [], total: stable?.reviews?.length || 0 });
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

router.get("/training/enrollments", (_req, res) => {
  res.json([]);
});

router.post("/training/enroll", (req, res) => {
  res.json({ success: true, enrollmentId: "enroll-" + Date.now(), ...req.body });
});

router.get("/stable-os/dashboard", (_req, res) => {
  res.json({ bookings: [], revenue: 0, horses: [] });
});

export default router;
