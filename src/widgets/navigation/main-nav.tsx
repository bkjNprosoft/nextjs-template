import Link from "next/link";
import { ShoppingCart, User, Heart } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import { SearchAutocomplete } from "@/widgets/search/search-autocomplete";
import { CategoryMegaMenu } from "@/widgets/navigation/category-mega-menu";
import { auth } from "@/shared/lib/auth";
import { getCart } from "@/entities/cart/api/data";
import { getCategories } from "@/entities/category/api/data";
import { getWishlistProductIds } from "@/entities/wishlist/api/data";
import { MobileNavMenu } from "./mobile-nav-menu";

export async function MainNav() {
  const session = await auth();
  const [cart, categories, wishlistCount] = await Promise.all([
    session?.user ? getCart(session.user.id) : null,
    getCategories(),
    session?.user
      ? getWishlistProductIds(session.user.id).then((ids) => ids.length)
      : Promise.resolve(0),
  ]);

  const cartItemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
      {/* 상단 헤더: 로고, 검색바, 사용자 메뉴 */}
      <div className="border-b bg-white">
        <div className="container flex h-20 items-center justify-between gap-4 px-4 py-3">
          {/* 로고 */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-primary">쇼핑몰</span>
          </Link>

          {/* 검색바 - 중앙 배치, 큰 크기 */}
          <div className="hidden flex-1 max-w-2xl md:block">
            <SearchAutocomplete />
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  asChild
                >
                  <Link href="/wishlist">
                    <Heart className="h-6 w-6" />
                    {wishlistCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                    <span className="sr-only">위시리스트</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  asChild
                >
                  <Link href="/cart">
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {cartItemCount > 9 ? "9+" : cartItemCount}
                      </span>
                    )}
                    <span className="sr-only">장바구니</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <User className="h-6 w-6" />
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
            {/* 모바일 메뉴 */}
            <MobileNavMenu categories={categories} />
          </div>
        </div>
      </div>

      {/* 카테고리 메가메뉴 */}
      {categories.length > 0 && <CategoryMegaMenu categories={categories} />}
    </header>
  );
}
