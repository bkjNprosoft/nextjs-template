import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";

import { CartSummary } from "@/widgets/cart-summary";
import { Button } from "@/shared/ui/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { QuantityControl } from "@/features/cart/quantity-control";
import { auth } from "@/shared/lib/auth";
import { getCart } from "@/entities/cart/api/data";
import { removeCartItemAction } from "@/entities/cart/api/actions";

export default async function CartPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const cart = await getCart(session.user.id);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container space-y-8 py-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">장바구니</h1>
          <p className="text-muted-foreground">장바구니에 담긴 상품을 확인하세요</p>
        </div>
        <Card className="border-2 border-dashed">
          <CardContent className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mb-2 text-lg font-semibold">장바구니가 비어있습니다</p>
            <p className="mb-6 text-muted-foreground">
              원하는 상품을 장바구니에 담아보세요
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/products">상품 둘러보기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">장바구니</h1>
        <p className="text-muted-foreground">
          총 <span className="font-semibold text-primary">{cart.items.length}</span>개의 상품이 담겨있습니다
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl">장바구니 항목</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-6 transition-colors hover:bg-muted/30">
                <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-muted shadow-sm">
                  <Image
                    src={item.product.images[0] || "/placeholder-product.jpg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold leading-tight">{item.product.name}</h3>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {Number(item.product.price).toLocaleString()}원
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <QuantityControl
                      cartItemId={item.id}
                      currentQuantity={item.quantity}
                      maxQuantity={item.product.stock}
                    />
                    <form action={async (formData: FormData) => {
                      "use server";
                      await removeCartItemAction(formData);
                    }}>
                      <input
                        type="hidden"
                        name="cartItemId"
                        value={item.id}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <p className="text-xl font-bold text-primary">
                    {(Number(item.product.price) * item.quantity).toLocaleString()}원
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity}개
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="sticky top-24">
          <CartSummary total={total} />
        </div>
      </div>
    </div>
  );
}

