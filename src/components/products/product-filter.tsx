import { ProductFilterClient } from "@/entities/product/ui/product-filter-client";
import { getCategories } from "@/entities/category/api/data";

export async function ProductFilter() {
  const categories = await getCategories();

  return <ProductFilterClient categories={categories} />;
}
