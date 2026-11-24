import type { ComponentProps, ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { resolveLink } from "@/lib/cms/links";
import type { CmsLinkField } from "@/payload-types";

interface CmsLinkProps extends Omit<ComponentProps<"a">, "href"> {
  link: Pick<CmsLinkField, "type" | "reference" | "url" | "newTab"> & {
    label?: string | null;
  };
  /** Overrides the link's own label. */
  children?: ReactNode;
}

/**
 * Renders a link from the CMS. Internal links go through the localized `Link`,
 * so they keep the visitor's language. A link that cannot be followed renders
 * nothing instead of a dead anchor.
 */
export function CmsLink({ link, children, ...props }: CmsLinkProps) {
  const resolved = resolveLink(link);
  if (!resolved) return null;

  const content = children ?? link.label;
  const target = resolved.newTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  if (resolved.kind === "internal") {
    return (
      <Link href={resolved.href} {...target} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <a href={resolved.href} {...target} {...props}>
      {content}
    </a>
  );
}
