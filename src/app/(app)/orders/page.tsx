import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getOrders } from "@/server/data/orders";

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

  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold">주문 내역</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">주문 내역이 없습니다.</p>
            <Link href="/products">
              <span className="mt-4 inline-block text-primary hover:underline">
                상품 둘러보기
              </span>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <Link
                        href={`/orders/${order.id}`}
                        className="hover:underline"
                      >
                        주문 #{order.orderNumber}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {order.createdAt.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {statusLabels[order.status] ?? order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>주문 상품</span>
                    <span>{order.items.length}개</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>총 결제금액</span>
                    <span>
                      {Number(order.totalAmount).toLocaleString()}원
                    </span>
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

