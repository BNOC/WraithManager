// SERVER-ONLY — never import this from client components
// Credentials and session signing logic

export const SESSION_COOKIE = "wd_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// Hard-coded guild credentials — lives server-side only, never reaches the client bundle
const USERS: Record<string, string> = {
  BNOC: "Riley4",
  Phae: "bigdruid",
  Hafad: "bigdk",
  React: "bigdh",
  Cassy: "bigpriest",
};

function getSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-secret-do-not-use-in-production";
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64ToBuf(b64: string): ArrayBuffer {
  const arr = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

export function verifyCredentials(username: string, password: string): boolean {
  const expected = USERS[username];
  if (!expected) return false;
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== password.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(username: string): Promise<string> {
  const payload = btoa(JSON.stringify({ u: username, exp: Date.now() + SESSION_MAX_AGE_MS }));
  const key = await getKey();
  const sig = bufToB64(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64ToBuf(sig),
      new TextEncoder().encode(payload)
    );
    if (!valid) return null;
    const data = JSON.parse(atob(payload));
    if (!data.u || !USERS[data.u] || Date.now() > data.exp) return null;
    return data.u as string;
  } catch {
    return null;
  }
}
