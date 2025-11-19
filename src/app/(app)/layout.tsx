import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/shared/lib/auth";
import { Button } from "@/shared/ui/atoms/button";
import { Sidebar, SidebarMobile } from "@/widgets/sidebar";
import { cn } from "@/shared/lib/utils";

type AppLayoutProps = {
  children: ReactNode;
};

async function signOutAction() {
  "use server";

  await signOut({ redirectTo: "/sign-in" });
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const initials =
    session.user.name?.slice(0, 2).toUpperCase() ??
    session.user.email?.slice(0, 2).toUpperCase() ??
    "AP";

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <SidebarMobile />
            <Link
              href="/"
              className="text-sm font-semibold text-foreground transition hover:text-primary"
            >
              쇼핑몰
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium text-muted-foreground">
                Signed in as
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
                  {initials}
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">
                    {session.user.name ?? "고객"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
              </div>
            </div>
            <form action={signOutAction}>
              <Button variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden border-r bg-background lg:block">
          <Sidebar />
        </aside>
        <main
          className={cn(
            "flex-1",
            "bg-background lg:bg-transparent lg:px-6 lg:py-10",
          )}
        >
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

