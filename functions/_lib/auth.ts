import { findAdmin, type AdminRole } from "./admins.ts";
import type { Env } from "./env.ts";

const COOKIE = "rkn_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 14;

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromB64url(value: string): Uint8Array {
  const padded =
    value.replaceAll("-", "+").replaceAll("_", "/") +
    "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  email: string,
  secret: string,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = b64url(
    new TextEncoder().encode(JSON.stringify({ email, exp })),
  );
  const key = await hmacKey(secret);
  const sig = b64url(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)),
  );
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<{ email: string } | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    fromB64url(sig),
    new TextEncoder().encode(payload),
  );
  if (!ok) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as {
      email?: string;
      exp?: number;
    };
    if (!data.email || !data.exp || data.exp < Math.floor(Date.now() / 1000))
      return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string, secure: boolean): string {
  const parts = [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE_SEC}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(secure: boolean): string {
  const parts = [
    `${COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readCookie(request: Request, name = COOKIE): string | null {
  const raw = request.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=") || null;
  }
  return null;
}

export function ownerRole(env: Env): AdminRole {
  return env.OWNER_ROLE === "admin" ? "admin" : "super_admin";
}

export async function requireOwner(
  request: Request,
  env: Env,
): Promise<{ email: string; role: AdminRole } | Response> {
  if (!env.SESSION_SECRET) {
    return new Response(
      JSON.stringify({ error: "Owner auth is not configured" }),
      {
        status: 503,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  }
  const token = readCookie(request);
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  const session = await verifySessionToken(token, env.SESSION_SECRET);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const admin = await findAdmin(env.DB, session.email);
  if (admin && admin.active === 1) {
    return { email: admin.email, role: admin.role };
  }

  // Allow env owner briefly before their first login bootstraps the admins row.
  if (
    env.OWNER_EMAIL &&
    session.email.toLowerCase() === env.OWNER_EMAIL.trim().toLowerCase()
  ) {
    return { email: session.email.toLowerCase(), role: ownerRole(env) };
  }

  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function requireSuperAdmin(
  request: Request,
  env: Env,
): Promise<{ email: string; role: AdminRole } | Response> {
  const session = await requireOwner(request, env);
  if (session instanceof Response) return session;
  if (session.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Super admin only" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return session;
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1)
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
