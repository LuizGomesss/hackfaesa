"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { AplicarPreferencias } from "@/features/acessibilidade/preferencias";
import { ViagemProvider } from "@/features/embarque/viagem-context";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ViagemProvider>
        <AplicarPreferencias />
        {children}
      </ViagemProvider>
    </QueryClientProvider>
  );
}
