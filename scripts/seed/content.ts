import type { RequiredDataFromCollectionSlug } from "payload";

import type { Locale } from "../../i18n/config";
import type { RichTextBlock } from "../../payload-types";

/**
 * Seed content, typed against the generated CMS types: a schema change that
 * the seed does not follow fails typecheck.
 */

type PageData = RequiredDataFromCollectionSlug<"pages">;
type Localized<T> = Record<Locale, T>;

export interface SeedPage {
  slug: string;
  /** Per language: the title and the blocks, in the same order in every language. */
  content: Localized<Pick<PageData, "title" | "layout" | "meta">>;
}

function paragraph(text: string): RichTextBlock["content"] {
  return {
    root: {
      type: "root",
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "paragraph",
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: "",
          children: [
            {
              type: "text",
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text,
              version: 1,
            },
          ],
        },
      ],
    },
  };
}

/** Key of the seeded image; the seed finds its own media by it. */
export const SEED_IMAGE_KEY = "seed-hero";

export const SEED_IMAGE_ALT: Localized<string> = {
  cs: "Abstraktní barevný přechod",
  en: "Abstract colour gradient",
};

export function seedPages(imageId: number): SeedPage[] {
  return [
    {
      slug: "home",
      content: {
        cs: {
          title: "Úvod",
          meta: { description: "Ukázkový web postavený na šabloně s Payload CMS." },
          layout: [
            {
              blockType: "hero",
              heading: "Web připravený k úpravám",
              lead: "Tuhle stránku vytvořil seed. Upravte ji v administraci, nebo ji smažte a začněte po svém.",
              image: imageId,
            },
            {
              blockType: "richText",
              content: paragraph(
                "Stránky se skládají z bloků. Každý blok má svůj formulář v administraci a svou komponentu na webu.",
              ),
            },
            {
              blockType: "callToAction",
              heading: "Chcete se na něco zeptat?",
              text: "Kontaktní formulář uloží zprávu do administrace a pošle upozornění e-mailem.",
              link: { type: "custom", url: "/kontakt", label: "Napsat zprávu" },
            },
          ],
        },
        en: {
          title: "Home",
          meta: { description: "A demo site built on the template with Payload CMS." },
          layout: [
            {
              blockType: "hero",
              heading: "A site ready to edit",
              lead: "The seed created this page. Edit it in the admin, or delete it and start your own way.",
              image: imageId,
            },
            {
              blockType: "richText",
              content: paragraph(
                "Pages are made of blocks. Each block has a form in the admin and a component on the site.",
              ),
            },
            {
              blockType: "callToAction",
              heading: "Have a question?",
              text: "The contact form stores the message in the admin and sends a notification by e-mail.",
              link: { type: "custom", url: "/kontakt", label: "Write a message" },
            },
          ],
        },
      },
    },
    {
      slug: "kontakt",
      content: {
        cs: {
          title: "Kontakt",
          meta: { description: "Napište nám přes kontaktní formulář." },
          layout: [
            {
              blockType: "hero",
              heading: "Kontakt",
              lead: "Máte dotaz nebo nápad? Ozvěte se.",
            },
            {
              blockType: "contactForm",
              heading: "Napište nám",
              text: "Odpovíme co nejdřív.",
            },
          ],
        },
        en: {
          title: "Contact",
          meta: { description: "Write to us through the contact form." },
          layout: [
            {
              blockType: "hero",
              heading: "Contact",
              lead: "Have a question or an idea? Get in touch.",
            },
            {
              blockType: "contactForm",
              heading: "Write to us",
              text: "We will reply as soon as we can.",
            },
          ],
        },
      },
    },
  ];
}

export const SEED_SITE_NAME: Localized<string> = {
  cs: "Ukázkový web",
  en: "Demo site",
};

export const SEED_NAV_LABELS: Record<string, Localized<string>> = {
  home: { cs: "Úvod", en: "Home" },
  kontakt: { cs: "Kontakt", en: "Contact" },
};
