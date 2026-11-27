/** Pure rules of the rate limit. The store lives in `./server.ts`. */

export interface RateLimitRule {
  /** Requests allowed per window. */
  limit: number;
  /** Length of the sliding window in milliseconds. */
  windowMs: number;
}

export type RateLimitDecision = "allowed" | "limited";

/** The oldest moment that still counts against the limit. */
export function windowStart(now: Date, rule: RateLimitRule): Date {
  return new Date(now.getTime() - rule.windowMs);
}

/** Decide on a new request, given how many were already accepted in the window. */
export function decide(
  acceptedInWindow: number,
  rule: RateLimitRule,
): RateLimitDecision {
  return acceptedInWindow < rule.limit ? "allowed" : "limited";
}
