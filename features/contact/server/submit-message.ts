import "server-only";

import config from "@payload-config";
import { render } from "@react-email/components";
import { ResultAsync } from "neverthrow";
import { getPayload } from "payload";

import type { Locale } from "@/i18n/config";
import { env } from "@/lib/env";

import { ContactMessageEmail } from "../emails/contact-message";
import type { ContactInput } from "../schema";

export type SubmitError = { code: "UNAVAILABLE" };

async function notifyOwner(input: ContactInput): Promise<void> {
  if (!env.CONTACT_EMAIL_TO) return;

  const payload = await getPayload({ config });
  const html = await render(
    ContactMessageEmail({
      name: input.name,
      email: input.email,
      message: input.message,
    }),
  );
  // Without an e-mail adapter Payload writes the message to the server log.
  await payload.sendEmail({
    to: env.CONTACT_EMAIL_TO,
    replyTo: input.email,
    subject: `Nová zpráva z webu: ${input.name}`,
    html,
  });
}

/**
 * Stores a contact message and then notifies the site owner. The message is
 * saved first: a failed notification is logged and never fails the submission,
 * because the message is already safe in the CMS.
 */
export function submitContactMessage(
  input: ContactInput,
  locale: Locale,
): ResultAsync<void, SubmitError> {
  const save = async () => {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "contact-messages",
      // A system write on behalf of an anonymous visitor: the collection is
      // closed to the public API, and the input was validated by the caller.
      overrideAccess: true,
      data: {
        name: input.name,
        email: input.email,
        message: input.message,
        locale,
      },
    });
    return payload;
  };

  return ResultAsync.fromPromise(
    save(),
    (): SubmitError => ({ code: "UNAVAILABLE" }),
  ).map(async (payload) => {
    await ResultAsync.fromPromise(notifyOwner(input), (error) => error).match(
      () => undefined,
      (error) => {
        payload.logger.error({
          err: error,
          msg: "Contact message saved, but the notification e-mail failed.",
        });
      },
    );
  });
}
