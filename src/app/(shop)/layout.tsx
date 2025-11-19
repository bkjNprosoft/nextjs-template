import type { ReactNode } from "react";

import { MainNav } from "@/widgets/navigation/main-nav";
import { Footer } from "@/widgets/footer";

type ShopLayoutProps = {
  children: ReactNode;
};

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </div>
  );
}

