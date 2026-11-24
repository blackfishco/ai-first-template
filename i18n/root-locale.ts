import * as rootParams from "next/root-params";

/**
 * Reads the `[locale]` root parameter of the site's root layout.
 *
 * Next.js 16.4 generates no `next/root-params` types when root layouts live in
 * route groups, so the module is untyped here. The runtime resolves the
 * parameter correctly; this function checks the shape instead of trusting it.
 * See docs/decisions.md. Replace it with a direct `locale` import once
 * `.next/types/root-params.d.ts` declares it.
 *
 * Resolves to `undefined` on routes outside `app/(frontend)/[locale]`.
 */
export async function getRootLocale(): Promise<string | undefined> {
  const params: unknown = rootParams;

  if (typeof params !== "object" || params === null || !("locale" in params)) {
    return undefined;
  }

  const getter: unknown = params.locale;
  if (typeof getter !== "function") return undefined;

  // The getter takes no arguments and resolves to the segment value.
  const value: unknown = await Reflect.apply(getter, params, []);
  return typeof value === "string" ? value : undefined;
}
