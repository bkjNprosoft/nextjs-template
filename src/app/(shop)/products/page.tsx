import { Suspense } from "react";

import { ProductList } from "@/components/products/product-list";
import { ProductFilter } from "@/components/products/product-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/server/data/products";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    search?: string;
    featured?: string;
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

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const { products, total } = await getProducts({
    categoryId: params.category,
    search: params.search,
    featured: params.featured === "true",
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">상품</h1>
        <p className="text-muted-foreground">
          총 {total}개의 상품
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <ProductFilter />
          </Suspense>
        </aside>
        <div className="space-y-6">
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList products={products} />
          </Suspense>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <a
                    key={pageNum}
                    href={`?page=${pageNum}${params.category ? `&category=${params.category}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                    className="rounded-md border px-3 py-2 hover:bg-accent"
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

