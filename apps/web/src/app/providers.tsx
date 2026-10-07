"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import { clearAuthCaches } from "@/features/auth/auth-cache";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    const clearUnauthorizedAuth = () => clearAuthCaches(queryClient);
    window.addEventListener("auth:unauthorized", clearUnauthorizedAuth);
    return () => window.removeEventListener("auth:unauthorized", clearUnauthorizedAuth);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            border: "1px solid #d9e2e1",
            boxShadow: "0 10px 28px rgba(23, 34, 33, 0.07)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
