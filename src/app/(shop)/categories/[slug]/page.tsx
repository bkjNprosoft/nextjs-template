import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProductList } from "@/components/products/product-list";
import { ProductFilter } from "@/components/products/product-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryBySlug } from "@/server/data/categories";
import { getProducts } from "@/server/data/products";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const searchParamsData = await searchParams;
  const page = Number(searchParamsData.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { products, total } = await getProducts({
    categoryId: category.id,
    orderBy:
      searchParamsData.orderBy === "price_asc"
        ? "price_asc"
        : searchParamsData.orderBy === "price_desc"
          ? "price_desc"
          : searchParamsData.orderBy === "name_asc"
            ? "name_asc"
            : "created_desc",
    skip,
    take,
  });

  const totalPages = Math.ceil(total / take);

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
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
                    href={`?page=${pageNum}${searchParamsData.orderBy ? `&orderBy=${searchParamsData.orderBy}` : ""}`}
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

