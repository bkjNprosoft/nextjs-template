import { Suspense } from "react";
import { Search } from "lucide-react";

import { ProductList } from "@/widgets/product-list";
import { ProductFilter } from "@/entities/product/ui/product-filter";
import { Skeleton } from "@/shared/ui/atoms/skeleton";
import { getProducts } from "@/entities/product/api/data";
import { auth } from "@/shared/lib/auth";
import { getWishlistProductIds } from "@/entities/wishlist/api/data";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
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

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim();
  const page = Number(params.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;
  const session = await auth();

  if (!query) {
    return (
      <div className="container space-y-8 py-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">검색</h1>
          <p className="text-muted-foreground">원하는 상품을 검색해보세요</p>
        </div>
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-muted-foreground">
            검색어를 입력하세요
          </p>
        </div>
      </div>
    );
  }

  const [productsData, wishlistIds] = await Promise.all([
    getProducts({
      search: query,
      orderBy:
        params.orderBy === "price_asc"
          ? "price_asc"
          : params.orderBy === "price_desc"
            ? "price_desc"
            : params.orderBy === "name_asc"
              ? "name_asc"
              : params.orderBy === "popular"
                ? "popular"
                : params.orderBy === "rating"
                  ? "rating"
                  : params.orderBy === "reviews"
                    ? "reviews"
                    : "created_desc",
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      inStock: params.inStock === "true",
      onSale: params.onSale === "true",
      skip,
      take,
    }),
    session?.user ? getWishlistProductIds(session.user.id) : Promise.resolve([]),
  ]);

  const { products, total } = productsData;
  const totalPages = Math.ceil(total / take);

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          &quot;<span className="text-primary">{query}</span>&quot; 검색 결과
        </h1>
        <p className="text-muted-foreground">
          총 <span className="font-semibold text-primary">{total}</span>개의 상품을 찾았습니다
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <ProductFilter />
              </div>
            </Suspense>
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
                    href={`?q=${encodeURIComponent(query)}&page=${pageNum}${params.orderBy ? `&orderBy=${params.orderBy}` : ""}${params.minPrice ? `&minPrice=${params.minPrice}` : ""}${params.maxPrice ? `&maxPrice=${params.maxPrice}` : ""}${params.inStock ? `&inStock=${params.inStock}` : ""}${params.onSale ? `&onSale=${params.onSale}` : ""}`}
                    className={`rounded-lg border px-4 py-2 font-medium transition-colors ${
                      pageNum === page
                        ? "bg-primary text-white border-primary"
                        : "bg-white hover:bg-primary/10 hover:border-primary/50"
                    }`}
                  >
                    {pageNum}
                  </a>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

