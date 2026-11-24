import config from "@payload-config";
import { ResultAsync } from "neverthrow";
import { getPayload } from "payload";

// Never cached: a monitor must see the current state.
export const dynamic = "force-dynamic";

async function pingDatabase(): Promise<void> {
  const payload = await getPayload({ config });
  // A system read that returns a count only; nothing about the accounts leaves.
  await payload.count({ collection: "users", overrideAccess: true });
}

/**
 * Health check for uptime monitors and load balancers: 200 when the database
 * answers, 503 when it does not. The body carries no details.
 */
export async function GET(): Promise<Response> {
  const healthy = await ResultAsync.fromPromise(pingDatabase(), () => null).match(
    () => true,
    () => false,
  );

  return Response.json(
    { status: healthy ? "ok" : "unavailable" },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
