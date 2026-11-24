import config from "@payload-config";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { isSafeSitePath, isValidSecret } from "@/lib/cms/preview";
import { env } from "@/lib/env";
import { hasRole } from "@/payload/access/roles";

/**
 * Opened by the CMS live preview frame. Turns on draft mode for a signed-in
 * editor who also presents the preview secret, then redirects to the page.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  if (!isValidSecret(searchParams.get("secret"), env.PREVIEW_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const path = searchParams.get("path");
  if (!isSafeSitePath(path)) {
    return Response.json({ error: "invalid path" }, { status: 400 });
  }

  // The secret alone is not enough: drafts are for signed-in editors only.
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!hasRole(user, "admin", "editor")) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const draft = await draftMode();
  draft.enable();
  redirect(path);
}
