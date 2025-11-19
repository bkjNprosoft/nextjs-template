import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/molecules/card";
import { Separator } from "@/shared/ui/atoms/separator";
import { getDefaultAddress, getAddresses } from "@/entities/address/api/data";
import { requireUser } from "@/server/auth";
import { CheckoutButton } from "@/features/checkout";

type CartSummaryProps = {
  total: number;
};

export async function CartSummary({ total }: CartSummaryProps) {
  const user = await requireUser();
  const [defaultAddress, addresses] = await Promise.all([
    getDefaultAddress(user.id),
    getAddresses(user.id),
  ]);

  const shippingFee = total >= 50000 ? 0 : 3000;
  const finalTotal = total + shippingFee;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-xl">주문 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">상품 금액</span>
            <span className="font-medium">{total.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">배송비</span>
            <span className="font-medium">
              {shippingFee === 0 ? (
                <span className="text-green-600 font-semibold">무료</span>
              ) : (
                `${shippingFee.toLocaleString()}원`
              )}
            </span>
          </div>
          {total < 50000 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{(50000 - total).toLocaleString()}원</span> 더 구매 시 무료배송
            </p>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="text-lg font-semibold">총 결제금액</span>
            <span className="text-2xl font-bold text-primary">{finalTotal.toLocaleString()}원</span>
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

