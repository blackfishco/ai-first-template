import { getTranslations } from "next-intl/server";

import { ExampleGallery } from "@/components/examples/example-gallery";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { TasksDemo } from "@/features/example/components/tasks-demo";
import { getDemoTasks } from "@/features/example/server/demo-tasks";
import { Link } from "@/i18n/navigation";

export default async function ExamplePage() {
  const t = await getTranslations("Example");
  const tasks = getDemoTasks();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col items-start gap-4">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          {t("back")}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </header>
      <Alert role="note">
        <AlertTitle>{t("temporaryTitle")}</AlertTitle>
        <AlertDescription>{t("temporaryDescription")}</AlertDescription>
      </Alert>
      <TasksDemo initialTasks={tasks} />
      <ExampleGallery />
    </main>
  );
}
