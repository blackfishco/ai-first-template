"use client";

import {
  environmentManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/toast";

const DEFAULT_STALE_TIME = 60 * 1000;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (environmentManager.isServer()) {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const t = useTranslations("Notifications");

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster closeLabel={t("close")} viewportLabel={t("viewport")}>
        {children}
      </Toaster>
    </QueryClientProvider>
  );
}
