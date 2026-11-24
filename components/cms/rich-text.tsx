import type {
  DefaultNodeTypes,
  SerializedLinkNode,
} from "@payloadcms/richtext-lexical";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from "@payloadcms/richtext-lexical/react";

import type { Locale } from "@/i18n/config";
import { getPathname } from "@/i18n/navigation";
import { pagePath } from "@/lib/cms/links";
import { cn } from "@/lib/utils";

interface RichTextProps {
  data: SerializedEditorState;
  locale: Locale;
  className?: string;
}

function internalHref(linkNode: SerializedLinkNode, locale: Locale): string {
  const doc: unknown = linkNode.fields.doc?.value;
  const slug =
    typeof doc === "object" && doc !== null && "slug" in doc
      ? doc.slug
      : undefined;
  // A link to a deleted or unpublished page falls back to the home page.
  const href = typeof slug === "string" && slug ? pagePath(slug) : "/";
  return getPathname({ href, locale });
}

const converters =
  (locale: Locale): JSXConvertersFunction<DefaultNodeTypes> =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({
      internalDocToHref: ({ linkNode }) => internalHref(linkNode, locale),
    }),
  });

/** Renders rich text from the CMS, with internal links in the given language. */
export function RichText({ data, locale, className }: RichTextProps) {
  return (
    <LexicalRichText
      data={data}
      converters={converters(locale)}
      className={cn(
        "flex max-w-prose flex-col gap-4 leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
        className,
      )}
    />
  );
}
