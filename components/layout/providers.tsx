"use client";

import * as React from "react";
import { Toaster } from "sonner";

import { ModalProvider } from "@/components/layout/modal-provider";
import { QueryProvider } from "@/components/layout/query-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <ModalProvider>{children}</ModalProvider>
      </QueryProvider>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}
