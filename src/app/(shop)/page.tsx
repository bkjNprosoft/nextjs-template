import Link from "next/link";
import { ShoppingBag, Sparkles } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import { ProductList } from "@/widgets/product-list";
import { RecentProducts } from "@/widgets/recent-products";
import { getFeaturedProducts } from "@/entities/product/api/data";
import { auth } from "@/shared/lib/auth";
import { getWishlistProductIds } from "@/entities/wishlist/api/data";

export default async function HomePage() {
  const session = await auth();
  const [featuredProducts, wishlistIds] = await Promise.all([
    getFeaturedProducts(8),
    session?.user ? getWishlistProductIds(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>새로운 쇼핑 경험을 시작하세요</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              최고의 쇼핑 경험을
              <br />
              <span className="text-primary">만나보세요</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              다양한 카테고리의 고품질 상품을 한 곳에서 만나보세요
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  상품 둘러보기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="container space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">인기 상품</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                지금 가장 인기 있는 상품들을 만나보세요
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products?featured=true">전체 보기 →</Link>
            </Button>
          </div>
          <ProductList products={featuredProducts} wishlistProductIds={wishlistIds} />
        </section>
      )}

      {/* Recent Products */}
      <section className="container">
        <RecentProducts />
      </section>
    </div>
  );
}

