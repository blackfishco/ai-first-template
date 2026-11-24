import "server-only";

import { loadServerEnv } from "./env-schema";

/**
 * Server environment, validated once when this module first loads. Read
 * `process.env` nowhere else in server code. `NEXT_PUBLIC_*` values are
 * embedded in the browser bundle at build time; keep secrets out of them.
 */
export const env = loadServerEnv(process.env);
