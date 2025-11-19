import { notFound } from "next/navigation";
import { Star, Package, Hash } from "lucide-react";

import { QuickAddToCart } from "@/features/add-to-cart/quick-add";
import { ToggleWishlist } from "@/features/toggle-wishlist";
import { TrackProductView } from "@/features/track-product-view";
import { ReviewList } from "@/entities/review/ui/review-list";
import { ReviewStats } from "@/entities/review/ui/review-stats";
import { ReviewForm } from "@/entities/review/ui/review-form";
import { ProductList } from "@/widgets/product-list";
import { Badge } from "@/shared/ui/atoms/badge";
import { Separator } from "@/shared/ui/atoms/separator";
import { auth } from "@/shared/lib/auth";
import { ProductImage } from "./product-image";
import {
  getProductBySku,
  getRelatedProducts,
} from "@/entities/product/api/data";
import {
  isInWishlist,
  getWishlistProductIds,
} from "@/entities/wishlist/api/data";

type ProductPageProps = {
  params: Promise<{
    sku: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { sku: rawSku } = await params;
  // URL 인코딩된 sku 디코딩 (Next.js가 자동으로 디코딩하지만 안전을 위해)
  const sku = decodeURIComponent(rawSku);
  const [product, session] = await Promise.all([
    getProductBySku(sku),
    auth(),
  ]);

  if (!product) {
    notFound();
  }

  const inWishlist = session?.user
    ? await isInWishlist(session.user.id, product.id)
    : false;

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

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  // TrackProductView에 전달할 데이터 (Decimal 타입을 숫자로 변환)
  const productForTracking = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    images: product.images,
    price: Number(product.price),
  };

  return (
    <div className="container space-y-12 py-8">
      <TrackProductView product={productForTracking} />
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border-2 bg-muted shadow-lg">
            <ProductImage
              src={product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {hasDiscount && (
              <Badge className="absolute left-4 top-4 bg-primary text-white text-lg font-bold shadow-lg">
                {discountRate}% 할인
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg border bg-muted transition-transform hover:scale-105 cursor-pointer"
                >
                  <ProductImage
                    src={image}
                    alt={`${product.name} ${index + 2}`}
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {product.category && (
                <Badge variant="outline" className="text-sm mb-2">
                  {product.category.name}
                </Badge>
              )}
              <h1 className="text-4xl font-bold leading-tight">
                {product.name}
              </h1>
            </div>
            {session?.user && (
              <ToggleWishlist
                productId={product.id}
                isInWishlist={inWishlist}
                size="lg"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary">
                {Number(product.price).toLocaleString()}원
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {Number(product.compareAtPrice).toLocaleString()}원
                  </span>
                </>
              )}
            </div>
            {averageRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({product._count.reviews}개 리뷰)
                </span>
              </div>
            )}
          </div>

          <Separator />

          {product.description && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">상품 설명</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">재고:</span>
              <span
                className={
                  product.stock > 0
                    ? "text-primary font-semibold"
                    : "text-destructive font-semibold"
                }
              >
                {product.stock > 0 ? `${product.stock}개` : "품절"}
              </span>
            </div>
            {product.sku && (
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">상품 코드:</span>
                <span className="text-muted-foreground">{product.sku}</span>
              </div>
            )}
          </div>

          <QuickAddToCart
            productId={product.id}
            maxQuantity={product.stock}
            disabled={product.stock === 0 || !product.active}
            className="w-full"
          />
        </div>
      </div>

      <Separator />

      {/* Related Products */}
      {product.category && (
        <>
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">관련 상품</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                같은 카테고리의 다른 상품들을 만나보세요
              </p>
            </div>
            <RelatedProductsSection
              productId={product.id}
              categoryId={product.category.id}
            />
          </div>
          <Separator />
        </>
      )}

      {/* Reviews */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">리뷰</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {product._count.reviews}개의 리뷰가 있습니다
            </p>
          </div>
          {session?.user && <ReviewForm productId={product.id} />}
        </div>
        {product.reviews.length > 0 && (
          <ReviewStats
            reviews={product.reviews}
            averageRating={averageRating}
            totalReviews={product._count.reviews}
          />
        )}
        <ReviewList reviews={product.reviews} />
      </div>
    </div>
  );
}

async function RelatedProductsSection({
  productId,
  categoryId,
}: {
  productId: string;
  categoryId: string;
}) {
  const [relatedProducts, session] = await Promise.all([
    getRelatedProducts(productId, categoryId, 4),
    auth(),
  ]);

  if (relatedProducts.length === 0) {
    return null;
  }

  const wishlistIds = session?.user
    ? await getWishlistProductIds(session.user.id)
    : [];

  return (
    <ProductList products={relatedProducts} wishlistProductIds={wishlistIds} />
  );
}

