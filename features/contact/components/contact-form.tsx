"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ResultAsync } from "neverthrow";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { reloadOnStaleDeployment } from "@/lib/stale-deployment";

import { submitContactAction } from "../actions";
import {
  CONTACT_FIELDS,
  type ContactFormValues,
  contactSchema,
  FIELD_ERROR_CODES,
  type FieldErrorCode,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
} from "../schema";

type Status = "idle" | "sent" | "unavailable";

const EMPTY: ContactFormValues = { name: "", email: "", message: "", website: "" };

function toErrorCode(message: string | undefined): FieldErrorCode | null {
  return FIELD_ERROR_CODES.find((code) => code === message) ?? null;
}

export function ContactForm() {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY,
  });

  const submit = handleSubmit(async (values) => {
    setStatus("idle");
    // A rejected call means the server could not be reached, or this tab is
    // older than the deployed version; then the page reloads.
    const result = await ResultAsync.fromPromise(
      submitContactAction(values, locale),
      (error) => (reloadOnStaleDeployment(error) ? "STALE" : "UNAVAILABLE"),
    ).unwrapOr({ success: false, code: "UNAVAILABLE" } as const);

    if (result.success) {
      reset(EMPTY);
      setStatus("sent");
      return;
    }
    if (result.code === "INVALID_INPUT") {
      for (const field of CONTACT_FIELDS) {
        const code = result.fields[field];
        if (code) setError(field, { message: code });
      }
      return;
    }
    setStatus("unavailable");
  });

  const errorText = (message: string | undefined) => {
    const code = toErrorCode(message);
    return code ? t(`errors.${code}`) : null;
  };
  const nameError = errorText(errors.name?.message);
  const emailError = errorText(errors.email?.message);
  const messageError = errorText(errors.message?.message);

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      aria-busy={isSubmitting}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(nameError)}>
          <FieldLabel htmlFor="contact-name">{t("name")}</FieldLabel>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "contact-name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="contact-name-error">{nameError}</FieldError>
        </Field>
        <Field data-invalid={Boolean(emailError)}>
          <FieldLabel htmlFor="contact-email">{t("email")}</FieldLabel>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "contact-email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="contact-email-error">{emailError}</FieldError>
        </Field>
        <Field data-invalid={Boolean(messageError)}>
          <FieldLabel htmlFor="contact-message">{t("message")}</FieldLabel>
          <Textarea
            id="contact-message"
            rows={6}
            aria-invalid={Boolean(messageError)}
            aria-describedby={
              messageError
                ? "contact-message-hint contact-message-error"
                : "contact-message-hint"
            }
            {...register("message")}
          />
          <FieldDescription id="contact-message-hint">
            {t("messageHint", {
              min: MESSAGE_MIN_LENGTH,
              max: MESSAGE_MAX_LENGTH,
            })}
          </FieldDescription>
          <FieldError id="contact-message-error">{messageError}</FieldError>
        </Field>
        {/* Honeypot: hidden from people and assistive technology, filled by bots. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner data-icon="inline-start" aria-hidden="true" />
          ) : null}
          {isSubmitting ? t("sending") : t("submit")}
        </Button>
        <div aria-live="polite" aria-atomic="true">
          {status === "sent" ? <p role="status">{t("sent")}</p> : null}
          {status === "unavailable" ? (
            <Alert variant="destructive">
              <AlertTitle>{t("errorTitle")}</AlertTitle>
              <AlertDescription>{t("errors.UNAVAILABLE")}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
