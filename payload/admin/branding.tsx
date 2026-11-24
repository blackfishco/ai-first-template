/**
 * Branding of the CMS admin. A new project changes this one file: the name,
 * the logo on the sign-in screen, and the icon in the navigation.
 */
export const ADMIN_TITLE_SUFFIX = "– CMS";

const BRAND_NAME = "CMS";

/** Shown on the sign-in screen. Replace it with the client's logo. */
export function Logo() {
  return (
    <span style={{ fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
      {BRAND_NAME}
    </span>
  );
}

/** Shown in the navigation. Replace it with a square mark. */
export function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      role="img"
      aria-label={BRAND_NAME}
    >
      <rect width="24" height="24" rx="6" fill="currentColor" />
    </svg>
  );
}
