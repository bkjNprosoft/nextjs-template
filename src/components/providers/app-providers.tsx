"use client";

import { type ReactNode } from "react";

import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
}

