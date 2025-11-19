import { UserRole } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, Package, User, ArrowRight } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { Badge } from "@/shared/ui/atoms/badge";
import { auth } from "@/shared/lib/auth";
import { getOrders } from "@/entities/order/api/data";
import { getCart } from "@/entities/cart/api/data";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // 관리자인 경우 관리자 대시보드로 리다이렉트
  if (session.user.role === UserRole.ADMIN) {
    redirect("/admin/dashboard");
  }

  const [orders, cart] = await Promise.all([
    getOrders(session.user.id, { take: 5 }),
    getCart(session.user.id),
  ]);

  const cartItemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const statusLabels: Record<string, string> = {
    PENDING: "대기 중",
    CONFIRMED: "확인됨",
    PROCESSING: "처리 중",
    SHIPPED: "배송 중",
    DELIVERED: "배송 완료",
    CANCELLED: "취소됨",
    REFUNDED: "환불됨",
  };

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">대시보드</h1>
        <p className="text-lg text-muted-foreground">
          환영합니다, <span className="font-semibold text-primary">{session.user.name ?? session.user.email}</span>님
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-lg transition-all hover:shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>장바구니</CardTitle>
                <CardDescription>현재 장바구니에 담긴 상품</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 text-4xl font-bold text-primary">{cartItemCount}개</div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/cart" className="flex items-center justify-center gap-2">
                장바구니 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg transition-all hover:shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>주문 내역</CardTitle>
                <CardDescription>최근 주문</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 text-4xl font-bold text-blue-600">{orders.length}건</div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/orders" className="flex items-center justify-center gap-2">
                전체 주문 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg transition-all hover:shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>프로필</CardTitle>
                <CardDescription>계정 및 배송지 관리</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Button asChild className="w-full" variant="outline">
              <Link href="/profile" className="flex items-center justify-center gap-2">
                프로필 관리
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {orders.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl">최근 주문</CardTitle>
            <CardDescription>최근 5건의 주문 내역</CardDescription>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between p-6 transition-colors hover:bg-muted/30"
              >
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-primary">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right space-y-1">
                    <p className="text-xl font-bold text-primary">
                      {Number(order.totalAmount).toLocaleString()}원
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
