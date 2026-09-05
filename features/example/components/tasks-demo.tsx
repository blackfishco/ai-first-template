"use client";

import { ResultAsync } from "neverthrow";
import { useTranslations } from "next-intl";
import { startTransition, useActionState, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { createTaskAction } from "../actions";
import { type CreateTaskResult, type Task } from "../types";
import { TaskList } from "./task-list";

type SubmissionResult = CreateTaskResult | { success: false; code: "UNAVAILABLE" };

interface DemoState {
  tasks: Task[];
  result: SubmissionResult | null;
}

export function TasksDemo({ initialTasks }: { initialTasks: Task[] }) {
  const t = useTranslations("Example");
  const [text, setText] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [state, formAction, pending] = useActionState<DemoState, FormData>(
    async (previous, formData) => {
      // Only FormData crosses the server boundary, never the local task list.
      const result = await ResultAsync.fromPromise(
        createTaskAction(formData),
        () => "UNAVAILABLE" as const,
      ).match<SubmissionResult>(
        (result) => result,
        (code) => ({ success: false, code }),
      );

      if (!result.success) return { ...previous, result };

      setText("");
      return { tasks: [...previous.tasks, result.task], result };
    },
    { tasks: initialTasks, result: null },
  );
  const error = state.result?.success === false ? state.result.code : null;

  return (
    <section aria-label={t("title")} className="grid items-start gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle><h2>{t("listTitle")}</h2></CardTitle>
          <CardDescription>{t("listDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskList tasks={state.tasks} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle><h2 id="task-form-title">{t("formTitle")}</h2></CardTitle>
          <CardDescription>{t("formDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (pending) return;
              const formData = new FormData(event.currentTarget);
              // Avoid React's automatic form reset: it desynchronizes Base UI's
              // hidden checkbox input on failed actions. Clear text only on success.
              startTransition(() => formAction(formData));
            }}
            aria-labelledby="task-form-title"
            aria-busy={pending}
          >
            <FieldGroup>
              <Field data-invalid={error === "INVALID_INPUT"} data-disabled={pending}>
                <FieldLabel htmlFor="task-text">{t("textLabel")}</FieldLabel>
                <Input
                  id="task-text"
                  name="text"
                  required
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  disabled={pending}
                  aria-invalid={error === "INVALID_INPUT"}
                  aria-describedby={error === "INVALID_INPUT" ? "task-hint task-error" : "task-hint"}
                />
                <FieldDescription id="task-hint">{t("textHint", { max: 120 })}</FieldDescription>
              </Field>
              <Field orientation="horizontal" data-disabled={pending}>
                <Checkbox
                  id="task-simulate-failure"
                  name="simulateFailure"
                  value="on"
                  checked={simulateFailure}
                  onCheckedChange={setSimulateFailure}
                  disabled={pending}
                  aria-describedby="task-simulate-hint"
                />
                <FieldContent>
                  <FieldLabel htmlFor="task-simulate-failure">{t("simulateFailure")}</FieldLabel>
                  <FieldDescription id="task-simulate-hint">{t("simulateHint")}</FieldDescription>
                </FieldContent>
              </Field>
              <Button type="submit" disabled={pending}>
                {pending && <Spinner data-icon="inline-start" aria-hidden="true" />}
                {pending ? t("pending") : t("submit")}
              </Button>
              <div aria-live="polite" aria-atomic="true">
                {state.result?.success && <p role="status">{t("success")}</p>}
                {error && (
                  <Alert variant="destructive" id="task-error">
                    <AlertTitle>{t("errorTitle")}</AlertTitle>
                    <AlertDescription>{t(`errors.${error}`)}</AlertDescription>
                  </Alert>
                )}
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
