import { RichText } from "@/components/cms/rich-text";
import type { Locale } from "@/i18n/config";
import type { RichTextBlock } from "@/payload-types";

export function RichTextSection({
  block,
  locale,
}: {
  block: RichTextBlock;
  locale: Locale;
}) {
  return (
    <section>
      <RichText data={block.content} locale={locale} />
    </section>
  );
}
