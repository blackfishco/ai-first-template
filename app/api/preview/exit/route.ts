import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { isSafeSitePath } from "@/lib/cms/preview";

/** Leaves draft mode and returns to the given site path, or the home page. */
export async function GET(request: Request): Promise<Response> {
  const path = new URL(request.url).searchParams.get("path");

  const draft = await draftMode();
  draft.disable();
  redirect(isSafeSitePath(path) ? path : "/");
}
