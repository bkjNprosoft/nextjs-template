import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Book, Shirt, Laptop, Home, ChevronRight } from "lucide-react";

import { ProductList } from "@/widgets/product-list";
import { CategoryFilterClient } from "@/entities/product/ui/category-filter-client";
import { ScrollRestore } from "./scroll-restore";
import { Skeleton } from "@/shared/ui/atoms/skeleton";
import { getCategoryBySlug } from "@/entities/category/api/data";
import { getProducts } from "@/entities/product/api/data";
import { auth } from "@/shared/lib/auth";
import { getWishlistProductIds } from "@/entities/wishlist/api/data";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    orderBy?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    onSale?: string;
  }>;
};

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug: rawSlug } = await params;
  // URL 인코딩된 slug 디코딩 (Next.js가 자동으로 디코딩하지만 안전을 위해)
  const slug = decodeURIComponent(rawSlug);
  const pathname = `/categories/${slug}`;
  const searchParamsData = await searchParams;
  const page = Number(searchParamsData.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;
  const session = await auth();

  const category = await getCategoryBySlug(slug);

  if (!category) {
    console.error(`Category not found for slug: "${slug}" (raw: "${rawSlug}")`);
    notFound();
  }

  const productsPromise = getProducts({
    categoryId: category.id,
    orderBy:
      searchParamsData.orderBy === "price_asc"
        ? "price_asc"
        : searchParamsData.orderBy === "price_desc"
        ? "price_desc"
        : searchParamsData.orderBy === "name_asc"
        ? "name_asc"
        : searchParamsData.orderBy === "popular"
        ? "popular"
        : searchParamsData.orderBy === "rating"
        ? "rating"
        : searchParamsData.orderBy === "reviews"
        ? "reviews"
        : "created_desc",
    minPrice: searchParamsData.minPrice
      ? Number(searchParamsData.minPrice)
      : undefined,
    maxPrice: searchParamsData.maxPrice
      ? Number(searchParamsData.maxPrice)
      : undefined,
    inStock: searchParamsData.inStock === "true",
    onSale: searchParamsData.onSale === "true",
    skip,
    take,
  });

  const wishlistIdsPromise = session?.user
    ? getWishlistProductIds(session.user.id)
    : Promise.resolve([]);

  const [productsData, wishlistIds] = await Promise.all([
    productsPromise,
    wishlistIdsPromise,
  ]);

  const { products, total } = productsData;
  const totalPages = Math.ceil(total / take);

  // 카테고리별 아이콘 렌더링 함수
  const renderCategoryIcon = () => {
    const name = category.name.toLowerCase();
    if (name.includes("도서") || name.includes("책")) {
      return <Book className="h-16 w-16 md:h-20 md:w-20 text-primary" />;
    }
    if (name.includes("의류") || name.includes("패션")) {
      return <Shirt className="h-16 w-16 md:h-20 md:w-20 text-primary" />;
    }
    if (name.includes("전자") || name.includes("컴퓨터")) {
      return <Laptop className="h-16 w-16 md:h-20 md:w-20 text-primary" />;
    }
    return <Book className="h-16 w-16 md:h-20 md:w-20 text-primary" />;
  };

  // 카테고리별 색상 테마
  const getCategoryTheme = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("도서") || name.includes("책")) {
      return "from-blue-500/20 via-purple-500/20 to-pink-500/20";
    }
    if (name.includes("의류") || name.includes("패션")) {
      return "from-pink-500/20 via-rose-500/20 to-orange-500/20";
    }
    if (name.includes("전자") || name.includes("컴퓨터")) {
      return "from-cyan-500/20 via-blue-500/20 to-indigo-500/20";
    }
    return "from-primary/10 via-primary/5 to-background";
  };

  const themeGradient = getCategoryTheme(category.name);

  return (
    <div className="space-y-8">
      <ScrollRestore pathname={pathname} />
      {/* 브레드크럼 네비게이션 */}
      <div className="container pt-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-primary transition-colors">
            상품
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>
      </div>

      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden">
        {category.image ? (
          <div className="relative h-[300px] md:h-[400px] w-full">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            <div className="container relative h-full flex items-center">
              <div className="space-y-4 text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                    {category.description}
                  </p>
                )}
                <p className="text-base md:text-lg text-white/80">
                  총 <span className="font-semibold text-white">{total}</span>개의 상품
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`bg-gradient-to-br ${themeGradient} py-16 md:py-24`}>
            <div className="container">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/20 flex items-center justify-center">
                    {renderCategoryIcon()}
                  </div>
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                      {category.description}
                    </p>
                  )}
                  <p className="text-base md:text-lg text-muted-foreground">
                    총 <span className="font-semibold text-primary">{total}</span>개의 상품
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상품 목록 섹션 */}
      <div className="container space-y-8 pb-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <CategoryFilterClient />
              </div>
            </div>
          </aside>
        <div className="space-y-6">
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList products={products} wishlistProductIds={wishlistIds} />
          </Suspense>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <a
                    key={pageNum}
                    href={`?page=${pageNum}${
                      searchParamsData.orderBy
                        ? `&orderBy=${searchParamsData.orderBy}`
                        : ""
                    }${
                      searchParamsData.minPrice
                        ? `&minPrice=${searchParamsData.minPrice}`
                        : ""
                    }${
                      searchParamsData.maxPrice
                        ? `&maxPrice=${searchParamsData.maxPrice}`
                        : ""
                    }${
                      searchParamsData.inStock
                        ? `&inStock=${searchParamsData.inStock}`
                        : ""
                    }${
                      searchParamsData.onSale
                        ? `&onSale=${searchParamsData.onSale}`
                        : ""
                    }`}
                    className={`rounded-lg border px-4 py-2 font-medium transition-colors ${
                      pageNum === page
                        ? "bg-primary text-white border-primary"
                        : "bg-white hover:bg-primary/10 hover:border-primary/50"
                    }`}
                  >
                    {pageNum}
                  </a>
                )
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
