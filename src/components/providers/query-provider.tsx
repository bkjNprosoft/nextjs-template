"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useState } from "react";

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const showDevtools = process.env.NODE_ENV !== "production";

  return (
    <QueryClientProvider client={client}>
      {children}
      {showDevtools ? (
        <ReactQueryDevtools buttonPosition="bottom-right" />
      ) : null}
    </QueryClientProvider>
  );
}

