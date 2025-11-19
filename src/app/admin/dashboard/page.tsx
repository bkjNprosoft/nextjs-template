import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { getAdminStats } from "@/server/data/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground">
          쇼핑몰 현황을 한눈에 확인하세요
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>전체 상품</CardTitle>
            <CardDescription>등록된 상품 수</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              활성: {stats.activeProducts}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>전체 주문</CardTitle>
            <CardDescription>누적 주문 수</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              대기 중: {stats.pendingOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>총 매출</CardTitle>
            <CardDescription>누적 매출액</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats.totalRevenue).toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>고객 수</CardTitle>
            <CardDescription>등록된 고객 수</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
          <CardDescription>최근 10건의 주문 내역</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.user.name ?? order.user.email}
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

