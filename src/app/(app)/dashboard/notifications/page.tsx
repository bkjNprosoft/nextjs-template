import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  sendNotificationPreviewAction,
} from "@/server/actions/notifications";
import { getNotificationsForUser } from "@/server/data/notifications";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { notifications, unreadCount } = await getNotificationsForUser(
    session.user.id,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">알림 센터</h1>
          <p className="text-sm text-muted-foreground">
            시스템, 프로젝트, 협업 이벤트를 한곳에서 관리하세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <form action={sendNotificationPreviewAction}>
            <Button type="submit" variant="secondary">
              테스트 이메일 발송
            </Button>
          </form>
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline">
              모두 읽음으로 표시
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 알림</CardTitle>
          <CardDescription>
            읽지 않은 알림 {unreadCount}개 · 최신 25개까지만 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 알림이 없습니다. 프로젝트를 생성하거나 테스트 이메일을
              발송해보세요.
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-lg border border-muted-foreground/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.body}
                    </p>
                  </div>
                  <Badge
                    variant={notification.read ? "outline" : "default"}
                    className="uppercase tracking-wide"
                  >
                    {notification.category.toLowerCase()}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{notification.createdAt.toLocaleString()}</span>
                  {!notification.read ? (
                    <form action={markNotificationReadAction}>
                      <input
                        type="hidden"
                        name="notificationId"
                        value={notification.id}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        읽음 처리
                      </Button>
                    </form>
                  ) : (
                    <span className="text-emerald-600">읽음</span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

