import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";

import { ProductList } from "@/widgets/product-list";
import {
  Card,
  CardContent,
} from "@/shared/ui/molecules/card";
import { auth } from "@/shared/lib/auth";
import { getWishlist } from "@/entities/wishlist/api/data";

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const wishlistItems = await getWishlist(session.user.id);
  const products = wishlistItems.map((item) => item.product);
  const wishlistProductIds = products.map((p) => p.id);

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-4xl font-bold">위시리스트</h1>
        </div>
        <p className="text-muted-foreground">
          총 <span className="font-semibold text-primary">{products.length}</span>개의 상품이 위시리스트에 있습니다
        </p>
      </div>

      {products.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mb-2 text-lg font-semibold">위시리스트가 비어있습니다</p>
            <p className="mb-6 text-muted-foreground">
              관심 있는 상품을 위시리스트에 추가해보세요
            </p>
            <Link
              href="/products"
              className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
            >
              상품 둘러보기
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ProductList products={products} wishlistProductIds={wishlistProductIds} />
      )}
    </div>
  );
}

