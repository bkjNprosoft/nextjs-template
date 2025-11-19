import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { Badge } from "@/shared/ui/atoms/badge";
import { Card, CardContent, CardFooter } from "@/shared/ui/molecules/card";
import { AddToCartButton } from "@/features/add-to-cart";
import { ToggleWishlist } from "@/features/toggle-wishlist";
import { cn } from "@/shared/lib/utils";
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
  isInWishlist?: boolean;
};

export function ProductCard({ product, className, isInWishlist = false }: ProductCardProps) {
  const imageUrl = product.images[0] || "/placeholder-product.jpg";
  const hasDiscount =
    product.compareAtPrice &&
    Number(product.compareAtPrice) > Number(product.price);
  
  const discountRate = hasDiscount
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.price)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;

  // SKU가 있으면 SKU를 사용하고, 없으면 ID를 사용
  const productIdentifier = product.sku || product.id;

  return (
    <Card
      className={cn(
        "group overflow-hidden border-0 bg-white shadow-sm transition-all hover:shadow-lg",
        className
      )}
    >
      <Link href={`/products/${productIdentifier}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {hasDiscount && (
            <Badge
              className="absolute left-2 top-2 bg-primary text-white shadow-md"
            >
              {discountRate}%
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90">
              <Badge variant="secondary" className="text-lg font-semibold">
                품절
              </Badge>
            </div>
          )}
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <ToggleWishlist
              productId={product.id}
              isInWishlist={isInWishlist}
              size="sm"
            />
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="space-y-2">
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          )}
          <Link href={`/products/${productIdentifier}`}>
            <h3 className="line-clamp-2 min-h-[2.5rem] font-semibold leading-tight text-foreground transition-colors hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {Number(product.price).toLocaleString()}원
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {Number(product.compareAtPrice).toLocaleString()}원
                </span>
              )}
            </div>
            {product._count && product._count.reviews > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  리뷰 {product._count.reviews}개
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton
          productId={product.id}
          disabled={product.stock === 0 || !product.active}
          className="w-full font-semibold"
        />
      </CardFooter>
    </Card>
  );
}

