import { redirect } from "next/navigation";
import Image from "next/image";

import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { getCart } from "@/server/data/cart";
import { updateCartItemAction, removeCartItemAction } from "@/server/actions/cart";
import { Trash2 } from "lucide-react";

export default async function CartPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const cart = await getCart(session.user.id);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container space-y-8 py-8">
        <h1 className="text-3xl font-bold">장바구니</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">장바구니가 비어있습니다.</p>
            <Button asChild className="mt-4">
              <a href="/products">상품 둘러보기</a>
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
      <h1 className="text-3xl font-bold">장바구니</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle>장바구니 항목</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={item.product.images[0] || "/placeholder-product.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {Number(item.product.price).toLocaleString()}원
                    </p>
                    <div className="flex items-center gap-4">
                      <form action={async (formData: FormData) => {
                        "use server";
                        await updateCartItemAction(formData);
                      }}>
                        <input
                          type="hidden"
                          name="cartItemId"
                          value={item.id}
                        />
                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          max={item.product.stock}
                          defaultValue={item.quantity}
                          className="w-20 rounded-md border px-2 py-1 text-sm"
                        />
                        <Button type="submit" variant="ghost" size="sm">
                          업데이트
                        </Button>
                      </form>
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
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {(Number(item.product.price) * item.quantity).toLocaleString()}
                      원
                    </p>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        <CartSummary total={total} cartItems={cart.items} />
      </div>
    </div>
  );
}

