import { pool } from "@workspace/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export interface DbUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  full_name: string | null;
  role: string;
  profile_image_url: string | null;
}

export interface DbSession {
  id: string;
  user_id: string;
  expires_at: Date;
}

export async function initAuthSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email       TEXT UNIQUE,
      phone_number TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      full_name   TEXT,
      role        TEXT NOT NULL DEFAULT 'rider',
      profile_image_url TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS app_sessions (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    DELETE FROM app_sessions WHERE expires_at < NOW();
  `);
}

export async function findUserByIdentifier(identifier: string): Promise<DbUser | null> {
  const normalized = identifier.trim().toLowerCase();
  const { rows } = await pool.query<DbUser & { password_hash: string }>(
    `SELECT id, email, phone_number, full_name, role, profile_image_url, password_hash
       FROM app_users
      WHERE email = $1 OR phone_number = $1
      LIMIT 1`,
    [normalized],
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const { rows } = await pool.query<DbUser>(
    `SELECT id, email, phone_number, full_name, role, profile_image_url FROM app_users WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function createUser(opts: {
  email?: string;
  phoneNumber?: string;
  password: string;
  fullName?: string;
  role?: string;
}): Promise<DbUser> {
  const hash = await hashPassword(opts.password);
  const { rows } = await pool.query<DbUser>(
    `INSERT INTO app_users (email, phone_number, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, phone_number, full_name, role, profile_image_url`,
    [
      opts.email?.toLowerCase() ?? null,
      opts.phoneNumber ?? null,
      hash,
      opts.fullName ?? null,
      opts.role ?? "rider",
    ],
  );
  return rows[0];
}

export async function createSession(userId: string): Promise<string> {
  const sid = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO app_sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [sid, userId, expiresAt],
  );
  return sid;
}

export async function findSessionUser(sid: string): Promise<DbUser | null> {
  const { rows } = await pool.query<DbUser>(
    `SELECT u.id, u.email, u.phone_number, u.full_name, u.role, u.profile_image_url
       FROM app_sessions s
       JOIN app_users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > NOW()
      LIMIT 1`,
    [sid],
  );
  return rows[0] ?? null;
}

export async function deleteSession(sid: string): Promise<void> {
  await pool.query(`DELETE FROM app_sessions WHERE id = $1`, [sid]);
}
