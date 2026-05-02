import { pool } from "@workspace/db";

export async function initExtendedSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id       TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      stable_id     TEXT NOT NULL,
      horse_id      TEXT,
      date          DATE NOT NULL,
      start_time    TEXT NOT NULL,
      end_time      TEXT,
      duration_hrs  NUMERIC,
      status        TEXT NOT NULL DEFAULT 'pending',
      notes         TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS package_bookings (
      id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id               TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      package_id            TEXT NOT NULL,
      date                  DATE NOT NULL,
      start_time            TEXT NOT NULL DEFAULT '10:00',
      tickets_count         INT NOT NULL DEFAULT 1,
      transport_zone_id     TEXT,
      pickup_location_url   TEXT,
      status                TEXT NOT NULL DEFAULT 'pending',
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS training_enrollments (
      id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id           TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      academy_id        TEXT NOT NULL,
      program_id        TEXT NOT NULL,
      start_date        DATE NOT NULL,
      payment_method    TEXT NOT NULL DEFAULT 'VISA',
      payment_structure TEXT NOT NULL DEFAULT 'FULL',
      status            TEXT NOT NULL DEFAULT 'active',
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id       TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      booking_id    TEXT,
      stable_id     TEXT NOT NULL,
      stable_rating INT NOT NULL DEFAULT 5,
      horse_rating  INT NOT NULL DEFAULT 5,
      comment       TEXT,
      photos        JSONB DEFAULT '[]',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS loyalty_points (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id     TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      amount      INT NOT NULL,
      type        TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function getUserBookings(userId: string) {
  const { rows } = await pool.query(
    `SELECT id, stable_id, horse_id, date, start_time, end_time, duration_hrs, status, notes, created_at
       FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function createBooking(opts: {
  userId: string;
  stableId: string;
  horseId?: string;
  date: string;
  startTime: string;
  endTime?: string;
  durationHrs?: number;
  notes?: string;
}) {
  const { rows } = await pool.query(
    `INSERT INTO bookings (user_id, stable_id, horse_id, date, start_time, end_time, duration_hrs, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [opts.userId, opts.stableId, opts.horseId ?? null, opts.date, opts.startTime,
     opts.endTime ?? null, opts.durationHrs ?? null, opts.notes ?? null],
  );
  await awardPoints(opts.userId, 100, "BOOKING", "Booked a ride");
  return rows[0];
}

export async function createPackageBooking(opts: {
  userId: string;
  packageId: string;
  date: string;
  startTime?: string;
  ticketsCount?: number;
  transportZoneId?: string;
  pickupLocationUrl?: string;
}) {
  const { rows } = await pool.query(
    `INSERT INTO package_bookings
       (user_id, package_id, date, start_time, tickets_count, transport_zone_id, pickup_location_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [opts.userId, opts.packageId, opts.date, opts.startTime ?? "10:00",
     opts.ticketsCount ?? 1, opts.transportZoneId ?? null, opts.pickupLocationUrl ?? null],
  );
  await awardPoints(opts.userId, 150, "PACKAGE_BOOKING", "Booked a curated package");
  return rows[0];
}

export async function getUserPackageBookings(userId: string) {
  const { rows } = await pool.query(
    `SELECT id, package_id, date, start_time, tickets_count, transport_zone_id, status, created_at
       FROM package_bookings WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function createTrainingEnrollment(opts: {
  userId: string;
  academyId: string;
  programId: string;
  startDate: string;
  paymentMethod?: string;
  paymentStructure?: string;
}) {
  const { rows } = await pool.query(
    `INSERT INTO training_enrollments
       (user_id, academy_id, program_id, start_date, payment_method, payment_structure)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [opts.userId, opts.academyId, opts.programId, opts.startDate,
     opts.paymentMethod ?? "VISA", opts.paymentStructure ?? "FULL"],
  );
  await awardPoints(opts.userId, 50, "ENROLLMENT", "Enrolled in a training programme");
  return rows[0];
}

export async function getUserEnrollments(userId: string) {
  const { rows } = await pool.query(
    `SELECT id, academy_id, program_id, start_date, payment_method, payment_structure, status, created_at
       FROM training_enrollments WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function createReview(opts: {
  userId: string;
  bookingId?: string;
  stableId: string;
  stableRating: number;
  horseRating: number;
  comment?: string;
  photos?: string[];
}) {
  const { rows } = await pool.query(
    `INSERT INTO reviews (user_id, booking_id, stable_id, stable_rating, horse_rating, comment, photos)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [opts.userId, opts.bookingId ?? null, opts.stableId,
     opts.stableRating, opts.horseRating, opts.comment ?? null,
     JSON.stringify(opts.photos ?? [])],
  );
  await awardPoints(opts.userId, 50, "REVIEW", "Left a review");
  return rows[0];
}

export async function getStableReviews(stableId: string) {
  const { rows } = await pool.query(
    `SELECT r.id, r.stable_rating, r.horse_rating, r.comment, r.photos, r.created_at,
            u.full_name, u.email
       FROM reviews r
       JOIN app_users u ON u.id = r.user_id
      WHERE r.stable_id = $1
      ORDER BY r.created_at DESC
      LIMIT 50`,
    [stableId],
  );
  return rows.map((row) => ({
    id: row.id,
    stableRating: row.stable_rating,
    horseRating: row.horse_rating,
    comment: row.comment,
    photos: row.photos ?? [],
    createdAt: row.created_at,
    rider: { fullName: row.full_name ?? "Anonymous", email: row.email ?? "" },
    reviewMedias: (row.photos ?? []).map((url: string, i: number) => ({ id: `media-${i}`, url })),
  }));
}

export async function awardPoints(userId: string, amount: number, type: string, description: string) {
  await pool.query(
    `INSERT INTO loyalty_points (user_id, amount, type, description) VALUES ($1,$2,$3,$4)`,
    [userId, amount, type, description],
  );
}

export async function getUserLoyalty(userId: string) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::int AS total_points FROM loyalty_points WHERE user_id = $1`,
    [userId],
  );
  const totalPoints: number = rows[0]?.total_points ?? 0;

  const { rows: txRows } = await pool.query(
    `SELECT id, amount, type, description, created_at FROM loyalty_points
      WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
    [userId],
  );

  const TIERS = [
    { key: "bronze", min: 0, max: 500, next: "silver" },
    { key: "silver", min: 500, max: 1500, next: "gold" },
    { key: "gold", min: 1500, max: 3500, next: "platinum" },
    { key: "platinum", min: 3500, max: Infinity, next: null },
  ];

  const tier = TIERS.findLast((t) => totalPoints >= t.min) ?? TIERS[0];
  const nextTier = tier.next;
  const pointsToNextTier = nextTier
    ? (TIERS.find((t) => t.key === nextTier)?.min ?? 0) - totalPoints
    : null;

  return {
    points: totalPoints,
    tier: tier.key,
    nextTier,
    pointsToNextTier: pointsToNextTier !== null ? Math.max(0, pointsToNextTier) : null,
    redemptionValue: Math.floor(totalPoints * 0.05),
    transactions: txRows.map((r) => ({
      id: r.id,
      amount: r.amount,
      type: r.type,
      description: r.description,
      createdAt: r.created_at,
    })),
  };
}
