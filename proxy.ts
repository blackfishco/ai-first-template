import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { env } from "./lib/env";
import { buildCsp, createNonce, cspHeaderName } from "./lib/security/csp";

const handleLocale = createMiddleware(routing);

/**
 * Locale routing, plus the Content Security Policy when `CSP_MODE` turns it
 * on. The policy travels on the request too: Next.js reads the nonce from it
 * and adds it to its own scripts while rendering.
 */
export default function proxy(request: NextRequest) {
  const header = cspHeaderName(env.CSP_MODE);
  if (!header) return handleLocale(request);

  const policy = buildCsp({
    nonce: createNonce(),
    development: env.NODE_ENV === "development",
    https: request.nextUrl.protocol === "https:",
  });
  const headers = new Headers(request.headers);
  // Next.js looks for the nonce in this request header, also in report-only mode.
  headers.set("Content-Security-Policy", policy);

  const response = handleLocale(new NextRequest(request, { headers }));
  response.headers.set(header, policy);
  return response;
}

export const config = {
  // Skip API routes, the CMS admin, Next and Vercel internals, and files with
  // an extension. Add any other non-localized route here.
  matcher: "/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)",
};
