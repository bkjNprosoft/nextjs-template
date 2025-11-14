import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cn } from "@/lib/utils";
import type { Product } from "@prisma/client";

type ProductCardProps = {
  product: Product & {
    category?: {
      name: string;
      slug: string;
    } | null;
    _count?: {
      reviews: number;
    };
  };
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const imageUrl = product.images[0] || "/placeholder-product.jpg";
  const hasDiscount =
    product.compareAtPrice &&
    Number(product.compareAtPrice) > Number(product.price);

  return (
    <Card className={cn("group overflow-hidden", className)}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute right-2 top-2"
            >
              할인
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="secondary">품절</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="space-y-2">
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs text-muted-foreground hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold leading-tight hover:underline">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {Number(product.price).toLocaleString()}원
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {Number(product.compareAtPrice).toLocaleString()}원
              </span>
            )}
          </div>
          {product._count && product._count.reviews > 0 && (
            <p className="text-xs text-muted-foreground">
              리뷰 {product._count.reviews}개
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton
          productId={product.id}
          disabled={product.stock === 0 || !product.active}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}

