import { ProductFilterClient } from "@/components/products/product-filter-client";
import { getCategories } from "@/server/data/categories";

export async function ProductFilter() {
  const categories = await getCategories();

  return <ProductFilterClient categories={categories} />;
}
