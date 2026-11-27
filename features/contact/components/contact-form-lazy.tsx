"use client";

import dynamic from "next/dynamic";

/**
 * The contact form in its own chunk. Routes pass this to the form's block; a
 * Server Component cannot split a Client Component it imports, so pages
 * without a form block would otherwise download the form's code.
 */
export const LazyContactForm = dynamic(() =>
  import("./contact-form").then((module) => module.ContactForm),
);
