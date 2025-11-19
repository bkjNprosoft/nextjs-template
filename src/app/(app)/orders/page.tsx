import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";

import { Badge } from "@/shared/ui/atoms/badge";
import { Button } from "@/shared/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { auth } from "@/shared/lib/auth";
import { getOrders } from "@/entities/order/api/data";

const statusLabels: Record<string, string> = {
  PENDING: "대기 중",
  CONFIRMED: "확인됨",
  PROCESSING: "처리 중",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "취소됨",
  REFUNDED: "환불됨",
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const orders = await getOrders(session.user.id);

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
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">주문 내역</h1>
        <p className="text-muted-foreground">
          주문하신 상품의 배송 상태를 확인하세요
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mb-2 text-lg font-semibold">주문 내역이 없습니다</p>
            <p className="mb-6 text-muted-foreground">
              첫 주문을 시작해보세요
            </p>
            <Link href="/products">
              <Button size="lg" className="h-12 px-8">
                상품 둘러보기
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-0 shadow-md transition-all hover:shadow-lg"
            >
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-primary hover:underline"
                      >
                        주문 #{order.orderNumber}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-base">
                      {order.createdAt.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`border ${statusColors[order.status] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}
                  >
                    {statusLabels[order.status] ?? order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">주문 상품</p>
                    <p className="text-lg font-semibold">{order.items.length}개</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">총 결제금액</p>
                    <p className="text-2xl font-bold text-primary">
                      {Number(order.totalAmount).toLocaleString()}원
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

