import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getOrders } from "@/server/data/orders";
import { getCart } from "@/server/data/cart";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const [orders, cart] = await Promise.all([
    getOrders(session.user.id, { take: 5 }),
    getCart(session.user.id),
  ]);

  const cartItemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          환영합니다, {session.user.name ?? session.user.email}님
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>장바구니</CardTitle>
            <CardDescription>현재 장바구니에 담긴 상품</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cartItemCount}개</div>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/cart">장바구니 보기</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주문 내역</CardTitle>
            <CardDescription>최근 주문</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}건</div>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/orders">전체 주문 보기</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>프로필</CardTitle>
            <CardDescription>계정 및 배송지 관리</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/profile">프로필 관리</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
            <CardDescription>최근 5건의 주문 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:border-primary/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt.toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {Number(order.totalAmount).toLocaleString()}원
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
