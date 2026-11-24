import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, the CMS admin, Next and Vercel internals, and files with
  // an extension. Add any other non-localized route here.
  matcher: "/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)",
};
