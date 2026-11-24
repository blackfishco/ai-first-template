import type { Block } from "payload";

import { CallToActionBlock } from "./call-to-action";
import { HeroBlock } from "./hero";
import { RichTextBlock } from "./rich-text";

/**
 * Blocks an editor can add to a page. Every block needs a component in
 * components/sections/render-blocks.tsx; typecheck fails when one is missing.
 */
export const PAGE_BLOCKS: Block[] = [HeroBlock, RichTextBlock, CallToActionBlock];
