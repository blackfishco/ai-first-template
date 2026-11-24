import type { ReactNode } from "react";

import type { ContactFormBlock } from "@/payload-types";

/**
 * Heading and introduction of the contact form. The form itself comes in as a
 * slot, because shared components do not import features; the route passes it.
 */
export function ContactFormSection({
  block,
  form,
}: {
  block: ContactFormBlock;
  form: ReactNode;
}) {
  return (
    <section className="flex max-w-xl flex-col gap-6">
      {block.heading ? (
        <h2 className="text-2xl font-semibold tracking-tight">{block.heading}</h2>
      ) : null}
      {block.text ? (
        <p className="text-muted-foreground">{block.text}</p>
      ) : null}
      {form}
    </section>
  );
}
