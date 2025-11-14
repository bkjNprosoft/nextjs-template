import { Suspense } from "react";

import { ProductList } from "@/components/products/product-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/server/data/products";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    orderBy?: string;
    page?: string;
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

  if (!query) {
    return (
      <div className="container space-y-8 py-8">
        <h1 className="text-3xl font-bold">검색</h1>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            검색어를 입력하세요
          </p>
        </div>
      </div>
    );
  }

  const { products, total } = await getProducts({
    search: query,
    orderBy:
      params.orderBy === "price_asc"
        ? "price_asc"
        : params.orderBy === "price_desc"
          ? "price_desc"
          : params.orderBy === "name_asc"
            ? "name_asc"
            : "created_desc",
    skip,
    take,
  });

  const totalPages = Math.ceil(total / take);

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">
          &quot;{query}&quot; 검색 결과
        </h1>
        <p className="text-muted-foreground mt-2">
          총 {total}개의 상품을 찾았습니다
        </p>
      </div>

      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList products={products} />
      </Suspense>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a
                key={pageNum}
                href={`?q=${encodeURIComponent(query)}&page=${pageNum}${params.orderBy ? `&orderBy=${params.orderBy}` : ""}`}
                className="rounded-md border px-3 py-2 hover:bg-accent"
              >
                {pageNum}
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}

