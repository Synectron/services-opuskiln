const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

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

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      // BufferSource typing in Workers expects ArrayBufferView without SharedArrayBuffer nuance
      salt: salt as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    key,
    KEY_BYTES * 8,
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${b64url(salt)}$${b64url(derived)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [algo, iterRaw, saltB64, hashB64] = stored.split("$");
  if (algo !== "pbkdf2" || !iterRaw || !saltB64 || !hashB64) return false;
  const iterations = Number(iterRaw);
  if (!Number.isFinite(iterations) || iterations < 10_000) return false;
  const salt = fromB64url(saltB64);
  const expected = fromB64url(hashB64);
  const actual = new Uint8Array(await derive(password, salt, iterations));
  if (actual.length !== expected.length) return false;
  let out = 0;
  for (let i = 0; i < actual.length; i += 1) out |= actual[i]! ^ expected[i]!;
  return out === 0;
}
