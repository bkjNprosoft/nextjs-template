import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/shared/lib/auth";
import { Button } from "@/shared/ui/atoms/button";
import { AdminSidebar } from "@/widgets/admin-sidebar";
import { requireRole } from "@/server/auth";

type AdminLayoutProps = {
  children: ReactNode;
};

async function signOutAction() {
  "use server";

  await signOut({ redirectTo: "/sign-in" });
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  try {
    await requireRole("ADMIN");
  } catch {
    redirect("/");
  }

  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">관리자</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
            <form action={signOutAction}>
              <Button variant="outline" size="sm">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden border-r bg-background lg:block w-64">
          <AdminSidebar />
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

