import Link from "next/link";
import { OrderStatus } from "@prisma/client";

import { Badge } from "@/shared/ui/atoms/badge";
import { Button } from "@/shared/ui/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { prisma } from "@/shared/lib/prisma";

const statusLabels: Record<string, string> = {
  PENDING: "대기 중",
  CONFIRMED: "확인됨",
  PROCESSING: "처리 중",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "취소됨",
  REFUNDED: "환불됨",
};

type OrdersPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  const params = await searchParams;
  const status = params.status;

  const orders = await prisma.order.findMany({
    where: status && Object.values(OrderStatus).includes(status as OrderStatus)
      ? { status: status as OrderStatus }
      : undefined,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        take: 1,
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">주문 관리</h1>
          <p className="text-muted-foreground">
            주문을 확인하고 상태를 변경할 수 있습니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!status ? "default" : "outline"}
            asChild
            size="sm"
          >
            <Link href="/admin/orders">전체</Link>
          </Button>
          {Object.entries(statusLabels).map(([value, label]) => (
            <Button
              key={value}
              variant={status === value ? "default" : "outline"}
              asChild
              size="sm"
            >
              <Link href={`/admin/orders?status=${value}`}>{label}</Link>
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>주문 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">주문이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-lg border p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{order.orderNumber}</p>
                        <Badge variant="outline">
                          {statusLabels[order.status] ?? order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.user.name ?? order.user.email}
                      </p>
                      {order.items.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {order.items[0].product.name}
                          {order.items.length > 1 &&
                            ` 외 ${order.items.length - 1}개`}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {Number(order.totalAmount).toLocaleString()}원
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.createdAt.toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

