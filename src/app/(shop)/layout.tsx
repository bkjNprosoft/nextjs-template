import type { ReactNode } from "react";

import { MainNav } from "@/components/navigation/main-nav";

type ShopLayoutProps = {
  children: ReactNode;
};

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}

