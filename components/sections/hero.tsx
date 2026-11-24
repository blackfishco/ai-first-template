import { CmsImage } from "@/components/ui/cms-image";
import type { HeroBlock } from "@/payload-types";

export function HeroSection({ block }: { block: HeroBlock }) {
  const image = typeof block.image === "object" ? block.image : null;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {block.heading}
        </h1>
        {block.lead ? (
          <p className="text-lg leading-relaxed text-muted-foreground">
            {block.lead}
          </p>
        ) : null}
      </div>
      <CmsImage
        media={image}
        size="hero"
        sizes="(min-width: 896px) 848px, 100vw"
        className="rounded-xl"
        lcp
      />
    </section>
  );
}
