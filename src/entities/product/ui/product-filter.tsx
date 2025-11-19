import { ProductFilterClient } from "@/entities/product/ui/product-filter-client";
import { getCategories } from "@/entities/category/api/data";

type ProductFilterProps = {
  searchParams?: {
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    onSale?: string;
    search?: string;
    featured?: string;
  };
};

export async function ProductFilter({ searchParams }: ProductFilterProps) {
  const categories = await getCategories({
    minPrice: searchParams?.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined,
    inStock: searchParams?.inStock === "true",
    onSale: searchParams?.onSale === "true",
    search: searchParams?.search,
    featured: searchParams?.featured === "true" ? true : searchParams?.featured === "false" ? false : undefined,
  });

  return <ProductFilterClient categories={categories} />;
}
