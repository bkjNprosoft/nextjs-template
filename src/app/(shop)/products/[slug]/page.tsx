import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewForm } from "@/components/reviews/review-form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { getProductBySlug } from "@/server/data/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const session = await auth();

  if (!product) {
    notFound();
  }

  const hasDiscount =
    product.compareAtPrice &&
    Number(product.compareAtPrice) > Number(product.price);

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <div className="container space-y-8 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.category && (
            <Badge variant="outline">{product.category.name}</Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">
                {Number(product.price).toLocaleString()}원
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  {Number(product.compareAtPrice).toLocaleString()}원
                </span>
              )}
            </div>
            {averageRating > 0 && (
              <p className="text-sm text-muted-foreground">
                평점 {averageRating.toFixed(1)} / 5.0 ({product._count.reviews}
                개 리뷰)
              </p>
            )}
          </div>

          <Separator />

          {product.description && (
            <div className="space-y-2">
              <h2 className="font-semibold">상품 설명</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">재고:</span>{" "}
              {product.stock > 0 ? `${product.stock}개` : "품절"}
            </p>
            {product.sku && (
              <p className="text-sm">
                <span className="font-medium">상품 코드:</span> {product.sku}
              </p>
            )}
          </div>

          <AddToCartButton
            productId={product.id}
            disabled={product.stock === 0 || !product.active}
            className="w-full"
          />
        </div>
      </div>

      <Separator />

      {/* Reviews */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            리뷰 ({product._count.reviews})
          </h2>
          {session?.user && (
            <ReviewForm productId={product.id} />
          )}
        </div>
        <ReviewList reviews={product.reviews} />
      </div>
    </div>
  );
}

