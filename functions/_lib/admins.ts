import type { Env } from "./env.ts";
import { hashPassword, verifyPassword } from "./password.ts";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1)
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export type AdminRole = "super_admin" | "admin";

export type AdminRow = {
  email: string;
  role: AdminRole;
  password_hash: string;
  active: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicAdmin = {
  email: string;
  role: AdminRole;
  active: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export function mapAdmin(row: AdminRow): PublicAdmin {
  return {
    email: row.email,
    role: row.role,
    active: row.active === 1,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findAdmin(
  db: D1Database,
  email: string,
): Promise<AdminRow | null> {
  return db
    .prepare(`SELECT * FROM admins WHERE email = ?`)
    .bind(normalizeEmail(email))
    .first<AdminRow>();
}

export async function listAdmins(db: D1Database): Promise<AdminRow[]> {
  const { results } = await db
    .prepare(`SELECT * FROM admins ORDER BY role DESC, email ASC`)
    .all<AdminRow>();
  return results ?? [];
}

export async function upsertAdmin(
  db: D1Database,
  input: {
    email: string;
    role: AdminRole;
    passwordHash: string;
    active?: boolean;
    createdBy?: string | null;
  },
): Promise<AdminRow> {
  const email = normalizeEmail(input.email);
  await db
    .prepare(
      `INSERT INTO admins (email, role, password_hash, active, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(email) DO UPDATE SET
         role = excluded.role,
         password_hash = excluded.password_hash,
         active = excluded.active,
         updated_at = datetime('now')`,
    )
    .bind(
      email,
      input.role,
      input.passwordHash,
      input.active === false ? 0 : 1,
      input.createdBy ?? null,
    )
    .run();
  const row = await findAdmin(db, email);
  if (!row) throw new Error("Failed to upsert admin");
  return row;
}

export async function countActiveSuperAdmins(db: D1Database): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM admins WHERE role = 'super_admin' AND active = 1`,
    )
    .first<{ count: number }>();
  return row?.count ?? 0;
}

/** Verify login against D1 admins, bootstrapping env OWNER_* as the first super admin. */
export async function authenticateAdmin(
  env: Env,
  emailRaw: string,
  password: string,
): Promise<{ email: string; role: AdminRole } | null> {
  if (!env.SESSION_SECRET) return null;
  const email = normalizeEmail(emailRaw);
  if (!email || !password) return null;

  const existing = await findAdmin(env.DB, email);
  if (existing) {
    if (existing.active !== 1) return null;
    const ok = await verifyPassword(password, existing.password_hash);
    if (!ok) return null;
    return { email: existing.email, role: existing.role };
  }

  // Bootstrap / sync env owner into the admins table on first successful login.
  if (
    env.OWNER_EMAIL &&
    env.OWNER_PASSWORD &&
    timingSafeEqual(email, normalizeEmail(env.OWNER_EMAIL)) &&
    timingSafeEqual(password, env.OWNER_PASSWORD)
  ) {
    const role: AdminRole =
      env.OWNER_ROLE === "admin" ? "admin" : "super_admin";
    const passwordHash = await hashPassword(password);
    const row = await upsertAdmin(env.DB, {
      email,
      role,
      passwordHash,
      createdBy: "system",
    });
    return { email: row.email, role: row.role };
  }

  return null;
}
