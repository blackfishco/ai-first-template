import { createHmac } from "node:crypto";

/**
 * The visitor's IP address from the request headers, or `null` when there is
 * none (local scripts, tests).
 *
 * On Vercel `x-forwarded-for` is set by the platform and its first entry is
 * the client. Behind another proxy, make sure that proxy overwrites the header;
 * a visitor can otherwise send their own and spread requests over many keys.
 */
export function clientIp(headers: Pick<Headers, "get">): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  const real = headers.get("x-real-ip")?.trim();
  return real || null;
}

/**
 * The stored form of a client for one scope: an HMAC, so the database never
 * holds a readable IP address and the same address gives unrelated keys in
 * different scopes.
 */
export function clientKey(scope: string, client: string, secret: string): string {
  return createHmac("sha256", secret).update(`${scope}\n${client}`).digest("hex");
}
