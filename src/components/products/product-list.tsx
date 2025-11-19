import { ProductCard } from "@/entities/product/ui/product-card";
import type { Product } from "@prisma/client";

type ProductListProps = {
  products: (Product & {
    category?: {
      name: string;
      slug: string;
    } | null;
    _count?: {
      reviews: number;
    };
  })[];
  className?: string;
};

export function ProductList({ products, className }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className ?? ""}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

