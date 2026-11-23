import type { Env } from "./env.ts";
import { hashPassword, verifyPassword } from "./password.ts";

export type CustomerRow = {
  id: string;
  phone: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export type CustomerPublic = {
  id: string;
  phone: string;
  name: string;
};

/** Normalize Indian mobiles to 91XXXXXXXXXX. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let national = digits;
  if (national.startsWith("91") && national.length === 12) {
    national = national.slice(2);
  } else if (national.startsWith("0") && national.length === 11) {
    national = national.slice(1);
  }
  if (!/^[6-9]\d{9}$/.test(national)) return null;
  return `91${national}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const national =
    digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  if (national.length === 10) return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
  return phone;
}

export function mapCustomer(row: CustomerRow): CustomerPublic {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
  };
}

export async function findCustomerById(
  db: D1Database,
  id: string,
): Promise<CustomerRow | null> {
  return (
    (await db
      .prepare(`SELECT * FROM customers WHERE id = ?`)
      .bind(id)
      .first<CustomerRow>()) ?? null
  );
}

export async function findCustomerByPhone(
  db: D1Database,
  phone: string,
): Promise<CustomerRow | null> {
  return (
    (await db
      .prepare(`SELECT * FROM customers WHERE phone = ?`)
      .bind(phone)
      .first<CustomerRow>()) ?? null
  );
}

export async function registerCustomer(
  env: Env,
  input: { phone: string; password: string; name: string },
): Promise<
  { ok: true; customer: CustomerPublic } | { ok: false; error: string; status?: number }
> {
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, error: "Enter a valid 10-digit Indian mobile number" };
  const password = input.password;
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  if (password.length > 128) {
    return { ok: false, error: "Password is too long" };
  }
  const name = input.name.trim().slice(0, 80);
  if (!name) return { ok: false, error: "Name is required" };

  const existing = await findCustomerByPhone(env.DB, phone);
  if (existing) {
    return { ok: false, error: "An account with this phone already exists", status: 409 };
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  try {
    await env.DB.prepare(
      `INSERT INTO customers (id, phone, name, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
    )
      .bind(id, phone, name, passwordHash)
      .run();
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Could not create account", status: 500 };
  }

  const row = await findCustomerById(env.DB, id);
  if (!row) return { ok: false, error: "Account created but not found", status: 500 };
  return { ok: true, customer: mapCustomer(row) };
}

export async function authenticateCustomer(
  env: Env,
  phoneRaw: string,
  password: string,
): Promise<CustomerPublic | null> {
  const phone = normalizePhone(phoneRaw);
  if (!phone || !password) return null;
  const row = await findCustomerByPhone(env.DB, phone);
  if (!row) return null;
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return null;
  return mapCustomer(row);
}
