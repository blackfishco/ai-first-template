import { useTranslations } from "next-intl";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

import { type Task } from "../types";

export function TaskList({ tasks }: { tasks: Task[] }) {
  const t = useTranslations("Example");

  if (tasks.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul aria-label={t("listTitle")} className="flex list-disc flex-col gap-3 pl-5">
      {tasks.map((task) => (
        <li key={task.id} className="wrap-anywhere">{task.text}</li>
      ))}
    </ul>
  );
}
