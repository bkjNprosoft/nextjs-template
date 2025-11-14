import Link from "next/link";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getNotificationsForUser } from "@/server/data/notifications";
import { auth } from "@/lib/auth";

export async function NotificationDropdown() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const { notifications, unreadCount } = await getNotificationsForUser(
    session.user.id,
  );

  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          알림 {unreadCount > 0 && `(${unreadCount}개 읽지 않음)`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            알림이 없습니다.
          </div>
        ) : (
          <>
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3"
                asChild
              >
                <Link href="/dashboard/notifications">
                  <div className="flex w-full items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        !notification.read && "font-semibold",
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.body}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.createdAt.toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/notifications"
                className="w-full text-center"
              >
                모두 보기
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

