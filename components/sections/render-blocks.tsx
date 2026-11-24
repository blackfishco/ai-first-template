import type { ReactNode } from "react";

import type { Locale } from "@/i18n/config";
import type { Page } from "@/payload-types";

import { CallToActionSection } from "./call-to-action";
import { HeroSection } from "./hero";
import { RichTextSection } from "./rich-text";

export type PageBlock = NonNullable<Page["layout"]>[number];
type BlockType = PageBlock["blockType"];

interface RenderContext {
  locale: Locale;
}

/**
 * One renderer per block type. `satisfies` makes a block without a renderer a
 * compile error, and each renderer receives its own block type.
 */
const RENDERERS = {
  hero: (block) => <HeroSection block={block} />,
  richText: (block, { locale }) => (
    <RichTextSection block={block} locale={locale} />
  ),
  callToAction: (block) => <CallToActionSection block={block} />,
} satisfies {
  [Type in BlockType]: (
    block: Extract<PageBlock, { blockType: Type }>,
    context: RenderContext,
  ) => ReactNode;
};

function renderBlock(block: PageBlock, context: RenderContext): ReactNode {
  switch (block.blockType) {
    case "hero": {
      return RENDERERS.hero(block);
    }
    case "richText": {
      return RENDERERS.richText(block, context);
    }
    case "callToAction": {
      return RENDERERS.callToAction(block);
    }
  }
}

export function RenderBlocks({
  blocks,
  locale,
}: {
  blocks: PageBlock[];
  locale: Locale;
}) {
  return blocks.map((block, index) => (
    // Blocks have a stable id once saved; the index covers unsaved previews.
    <div key={block.id ?? index}>{renderBlock(block, { locale })}</div>
  ));
}
