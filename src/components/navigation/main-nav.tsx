import Link from "next/link";
import { ShoppingCart, User, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { auth } from "@/lib/auth";
import { getCart } from "@/server/data/cart";
import { getCategories } from "@/server/data/categories";

export async function MainNav() {
  const session = await auth();
  const [cart, categories] = await Promise.all([
    session?.user ? getCart(session.user.id) : null,
    getCategories(),
  ]);

  const cartItemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            쇼핑몰
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              상품
            </Link>
            <form
              action="/search"
              className="flex items-center gap-2"
              method="get"
            >
              <input
                type="search"
                name="q"
                placeholder="상품 검색..."
                className="rounded-md border px-3 py-1.5 text-sm w-48"
              />
              <button
                type="submit"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                검색
              </button>
            </form>
            {categories.length > 0 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium">
                    카테고리
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">카테고리</h2>
                    <nav className="space-y-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          className="block rounded-lg p-2 hover:bg-accent"
                        >
                          {category.name}
                          {category._count.products > 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({category._count.products})
                            </span>
                          )}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                  <span className="sr-only">장바구니</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <User className="h-5 w-5" />
                  <span className="sr-only">프로필</span>
                </Link>
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">회원가입</Link>
              </Button>
            </div>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="space-y-4">
                <Link
                  href="/products"
                  className="block text-lg font-medium"
                >
                  상품
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block text-lg font-medium"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

