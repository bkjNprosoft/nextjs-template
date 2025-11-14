import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDefaultAddress, getAddresses } from "@/server/data/addresses";
import { requireUser } from "@/server/auth";
import { CheckoutButton } from "@/components/orders/checkout-button";

type CartSummaryProps = {
  total: number;
  cartItems: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number | { toString(): string; toNumber(): number };
      stock: number;
    };
  }>;
};

export async function CartSummary({ total, cartItems }: CartSummaryProps) {
  const user = await requireUser();
  const [defaultAddress, addresses] = await Promise.all([
    getDefaultAddress(user.id),
    getAddresses(user.id),
  ]);

  const shippingFee = total >= 50000 ? 0 : 3000;
  const finalTotal = total + shippingFee;

  return (
    <Card>
      <CardHeader>
        <CardTitle>주문 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>상품 금액</span>
            <span>{total.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>배송비</span>
            <span>
              {shippingFee === 0 ? (
                <span className="text-green-600">무료</span>
              ) : (
                `${shippingFee.toLocaleString()}원`
              )}
            </span>
          </div>
          {total < 50000 && (
            <p className="text-xs text-muted-foreground">
              50,000원 이상 구매 시 무료배송
            </p>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>총 결제금액</span>
            <span>{finalTotal.toLocaleString()}원</span>
          </div>
        </div>

        <Separator />

        <CheckoutButton
          defaultAddress={defaultAddress}
          addresses={addresses}
          totalAmount={finalTotal}
        />
      </CardContent>
    </Card>
  );
}

