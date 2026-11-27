"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  type ConsentChoice,
  OPTIONAL_CATEGORIES,
} from "@/lib/consent/consent";

interface ConsentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The stored choice; the switches start from it each time the dialog opens. */
  current: ConsentChoice;
  onSave: (choice: ConsentChoice) => void;
}

export function ConsentSettingsDialog({
  open,
  onOpenChange,
  current,
  onSave,
}: ConsentSettingsDialogProps) {
  const t = useTranslations("Consent");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("settingsTitle")}</DialogTitle>
          <DialogDescription>{t("settingsDescription")}</DialogDescription>
        </DialogHeader>
        {/* A new form each time the dialog opens, so unsaved changes are dropped. */}
        {open ? <ConsentForm current={current} onSave={onSave} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function ConsentForm({
  current,
  onSave,
}: Pick<ConsentSettingsDialogProps, "current" | "onSave">) {
  const t = useTranslations("Consent");
  const [choice, setChoice] = useState<ConsentChoice>(current);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(choice);
      }}
      className="grid gap-4"
    >
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="consent-necessary">{t("necessary")}</FieldLabel>
            <FieldDescription>{t("necessaryDescription")}</FieldDescription>
          </FieldContent>
          <Switch id="consent-necessary" checked disabled />
        </Field>
        {OPTIONAL_CATEGORIES.map((category) => (
          <Field key={category} orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor={`consent-${category}`}>{t(category)}</FieldLabel>
              <FieldDescription>{t(`${category}Description`)}</FieldDescription>
            </FieldContent>
            <Switch
              id={`consent-${category}`}
              checked={choice[category]}
              onCheckedChange={(checked) =>
                setChoice((previous) => ({ ...previous, [category]: checked }))
              }
            />
          </Field>
        ))}
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">{t("save")}</Button>
      </DialogFooter>
    </form>
  );
}
