import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/shared/ui/atoms/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { Separator } from "@/shared/ui/atoms/separator";
import { auth } from "@/shared/lib/auth";
import { getOrderById } from "@/entities/order/api/data";

const statusLabels: Record<string, string> = {
  PENDING: "대기 중",
  CONFIRMED: "확인됨",
  PROCESSING: "처리 중",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "취소됨",
  REFUNDED: "환불됨",
};

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const order = await getOrderById(id, session.user.id);

  if (!order) {
    notFound();
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
    SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="container space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">주문 상세</h1>
          <p className="text-muted-foreground">주문 번호: <span className="font-semibold text-primary">{order.orderNumber}</span></p>
        </div>
        <Badge className={`border text-lg px-4 py-2 ${statusColors[order.status] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
          {statusLabels[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl">주문 상품</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-6">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-muted shadow-sm">
                  <Image
                    src={item.product.images[0] || "/placeholder-product.jpg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{item.product.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {Number(item.price).toLocaleString()}원 × {item.quantity}개
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="text-xl font-bold text-primary">
                    {(Number(item.price) * item.quantity).toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-xl">배송지</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div>
                <p className="text-lg font-semibold">{order.shippingAddress.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.phone}
                </p>
              </div>
              <Separator />
              <p className="text-sm leading-relaxed">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && (
                  <>
                    <br />
                    {order.shippingAddress.addressLine2}
                  </>
                )}
                <br />
                {order.shippingAddress.city} {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-xl">주문 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">상품 금액</span>
                <span className="font-medium">{Number(order.totalAmount).toLocaleString()}원</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-semibold">총 결제금액</span>
                <span className="text-2xl font-bold text-primary">{Number(order.totalAmount).toLocaleString()}원</span>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-xl">주문 메모</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

