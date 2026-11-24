import { CmsLink } from "@/components/cms/cms-link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CallToActionBlock } from "@/payload-types";

export function CallToActionSection({ block }: { block: CallToActionBlock }) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{block.heading}</h2>
          </CardTitle>
          {block.text ? <CardDescription>{block.text}</CardDescription> : null}
        </CardHeader>
        <CardFooter>
          <CmsLink link={block.link} className={buttonVariants()} />
        </CardFooter>
      </Card>
    </section>
  );
}
