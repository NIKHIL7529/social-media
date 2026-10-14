"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import { clearAuthCaches } from "@/features/auth/auth-cache";
import { ThemeProvider } from "@/components/theme-provider";
import { createQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    const clearUnauthorizedAuth = () => clearAuthCaches(queryClient);
    window.addEventListener("auth:unauthorized", clearUnauthorizedAuth);
    return () => window.removeEventListener("auth:unauthorized", clearUnauthorizedAuth);
  }, [queryClient]);

  return (
    <ThemeProvider><QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            border: "1px solid rgb(var(--color-line))",
            background: "rgb(var(--color-surface-raised))",
            color: "rgb(var(--color-ink))",
            boxShadow: "var(--shadow-soft)",
            borderRadius: "var(--radius-ui)",
            borderLeft: "3px solid rgb(var(--color-accent))",
          },
          iconTheme: {
            primary: "rgb(var(--color-accent))",
            secondary: "rgb(var(--color-surface-raised))",
          },
          success: {
            iconTheme: {
              primary: "rgb(var(--color-accent))",
              secondary: "rgb(var(--color-accent-contrast))",
            },
          },
          error: {
            style: { borderLeft: "3px solid rgb(var(--color-danger))" },
            iconTheme: {
              primary: "rgb(var(--color-danger))",
              secondary: "rgb(var(--color-surface))",
            },
          },
        }}
      />
    </QueryClientProvider></ThemeProvider>
  );
}
