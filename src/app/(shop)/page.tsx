import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductList } from "@/components/products/product-list";
import { getCategories } from "@/server/data/categories";
import { getFeaturedProducts } from "@/server/data/products";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div className="container space-y-12 py-8">
      {/* Hero Section */}
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          최고의 쇼핑 경험을 만나보세요
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          다양한 카테고리의 고품질 상품을 한 곳에서 만나보세요
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/products">상품 둘러보기</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/categories">카테고리 보기</Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">카테고리</h2>
            <Button variant="ghost" asChild>
              <Link href="/categories">전체 보기</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group rounded-lg border bg-card p-6 text-center transition-colors hover:bg-accent"
              >
                <h3 className="font-semibold group-hover:underline">
                  {category.name}
                </h3>
                {category._count.products > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {category._count.products}개 상품
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">인기 상품</h2>
            <Button variant="ghost" asChild>
              <Link href="/products?featured=true">전체 보기</Link>
            </Button>
          </div>
          <ProductList products={featuredProducts} />
        </section>
      )}
    </div>
  );
}

