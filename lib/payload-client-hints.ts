/**
 * `withPayload` adds `Accept-CH`, `Critical-CH`, and `Vary` for the
 * `Sec-CH-Prefers-Color-Scheme` client hint to every path. The CMS admin uses
 * it to pick its light or dark theme on the server.
 *
 * On the site, `Critical-CH` makes Chromium browsers discard the first
 * response of every new visit and request the page again with the hint, so the
 * visitor pays for the server response twice, and `Vary` splits caches by a
 * colour scheme the site does not use. This keeps the three headers on the
 * admin only.
 */

interface Header {
  key: string;
  value: string;
}

interface HeaderRule {
  source: string;
  headers: Header[];
}

const PAYLOAD_RULE_SOURCE = "/:path*";
export const ADMIN_RULE_SOURCE = "/admin/:path*";
const CLIENT_HINT = "sec-ch-prefers-color-scheme";
const CLIENT_HINT_HEADERS = new Set(["accept-ch", "critical-ch", "vary"]);

function isColorSchemeHint(header: Header): boolean {
  return (
    CLIENT_HINT_HEADERS.has(header.key.toLowerCase()) &&
    header.value.toLowerCase().includes(CLIENT_HINT)
  );
}

export function scopePayloadClientHints<Rule extends HeaderRule>(
  rules: readonly Rule[],
): Rule[] {
  return rules.flatMap((rule) => {
    if (
      rule.source !== PAYLOAD_RULE_SOURCE ||
      !rule.headers.some((header) => isColorSchemeHint(header))
    ) {
      return [rule];
    }
    const hints = rule.headers.filter((header) => isColorSchemeHint(header));
    const rest = rule.headers.filter((header) => !isColorSchemeHint(header));
    return [
      ...(rest.length > 0 ? [{ ...rule, headers: rest }] : []),
      { ...rule, source: ADMIN_RULE_SOURCE, headers: hints },
    ];
  });
}
