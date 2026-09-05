"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { cs } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

const exampleDate = new Date(2026, 0, 15);
const dateFormatter = new Intl.DateTimeFormat("cs-CZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function GalleryInteractions() {
  const t = useTranslations("Gallery");
  const [selectedDate, setSelectedDate] = useState(exampleDate);

  function showNotification() {
    toast.add({
      type: "success",
      title: t("toastTitle"),
      description: t("toastDescription"),
    });
  }

  return (
    <div className="grid min-w-0 items-start gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle><h3>{t("buttonsTitle")}</h3></CardTitle>
          <CardDescription>{t("buttonsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={showNotification}>{t("notify")}</Button>
            <Button disabled aria-busy="true">
              <Spinner data-icon="inline-start" aria-hidden="true" />
              {t("loading")}
            </Button>
            <Button variant="outline" disabled>{t("disabled")}</Button>
          </div>
          <div className="flex flex-col gap-2" aria-hidden="true">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              {t("openDialog")}
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>{t("dialogTitle")}</DialogTitle>
                <DialogDescription>{t("dialogDescription")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button />}>
                  {t("closeDialog")}
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle><h3>{t("calendarTitle")}</h3></CardTitle>
          <CardDescription>{t("calendarDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            required
            locale={cs}
            aria-label={t("calendarLabel")}
            defaultMonth={exampleDate}
            today={exampleDate}
            selected={selectedDate}
            onSelect={setSelectedDate}
            labels={{
              labelPrevious: () => t("previousMonth"),
              labelNext: () => t("nextMonth"),
              labelDayButton: (date) => dateFormatter.format(date),
            }}
          />
        </CardContent>
        <CardFooter>
          <p role="status">{t("selectedDate", { date: dateFormatter.format(selectedDate) })}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
