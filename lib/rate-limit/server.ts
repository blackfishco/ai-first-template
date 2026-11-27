import "server-only";

import config from "@payload-config";
import { ResultAsync } from "neverthrow";
import { getPayload } from "payload";

import { env } from "@/lib/env";

import { clientKey } from "./client";
import {
  decide,
  type RateLimitDecision,
  type RateLimitRule,
  windowStart,
} from "./policy";

export type RateLimitError = { code: "UNAVAILABLE" };

const COLLECTION = "rate-limit-hits";

/**
 * Counts a request against the limit and records it when it is allowed.
 *
 * Hits live in Postgres, so the limit holds across every server instance. A
 * request without a known client (local scripts, tests) is not limited.
 * Expired hits of the scope are deleted on the way, so the table stays small.
 *
 * Two requests that arrive at the same moment can both pass the last free
 * slot. For a contact form that is an acceptable error of one.
 */
export function consumeRateLimit(
  scope: string,
  rule: RateLimitRule,
  client: string | null,
  now: Date = new Date(),
): ResultAsync<RateLimitDecision, RateLimitError> {
  if (!client) return ResultAsync.fromSafePromise(Promise.resolve("allowed"));

  const run = async (): Promise<RateLimitDecision> => {
    const payload = await getPayload({ config });
    const since = windowStart(now, rule).toISOString();
    const key = clientKey(scope, client, env.PAYLOAD_SECRET);

    // Housekeeping through the database adapter: no hooks, one statement.
    await payload.db.deleteMany({
      collection: COLLECTION,
      where: { scope: { equals: scope }, createdAt: { less_than: since } },
    });

    // System calls: the collection is closed to every API caller.
    const { totalDocs } = await payload.count({
      collection: COLLECTION,
      overrideAccess: true,
      where: {
        key: { equals: key },
        createdAt: { greater_than_equal: since },
      },
    });

    const decision = decide(totalDocs, rule);
    if (decision === "allowed") {
      await payload.create({
        collection: COLLECTION,
        overrideAccess: true,
        data: { scope, key },
      });
    }
    return decision;
  };

  return ResultAsync.fromPromise(run(), (): RateLimitError => ({
    code: "UNAVAILABLE",
  }));
}
