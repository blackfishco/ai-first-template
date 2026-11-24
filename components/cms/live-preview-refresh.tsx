"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useIsClient } from "@uidotdev/usehooks";

import { useRouter } from "@/i18n/navigation";

/**
 * Rendered only in draft mode, inside the CMS live preview frame. The CMS
 * posts a message after every save and autosave; the page then re-renders on
 * the server with the latest draft. The admin and the site share one origin.
 */
export function LivePreviewRefresh() {
  const router = useRouter();
  const isClient = useIsClient();

  // The origin is known only in the browser.
  if (!isClient) return null;

  return (
    <RefreshRouteOnSave
      refresh={() => {
        router.refresh();
      }}
      serverURL={globalThis.location.origin}
    />
  );
}
