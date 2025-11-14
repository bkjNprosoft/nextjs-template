import { CalendarDays, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardActivity } from "@/server/data/dashboard";

type ActivityListProps = {
  activities: DashboardActivity[];
};

const activityFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function getActivityIcon(badge: string) {
  if (badge === "Workspace") {
    return CalendarDays;
  }

  return Users;
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <Card className="h-full border-muted-foreground/10 shadow-sm">
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
        <CardDescription>
          워크스페이스 생성, 멤버 합류 등 주요 이벤트 타임라인입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 활동 데이터가 없습니다. 워크스페이스를 생성하고 멤버를
            초대해보세요.
          </p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.badge);
              return (
                <li key={activity.id} className="flex gap-3">
                  <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium leading-tight">
                        {activity.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-muted-foreground/30 text-xs",
                          activity.badge === "Workspace"
                            ? "text-sky-600"
                            : "text-emerald-600",
                        )}
                      >
                        {activity.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {activityFormatter.format(activity.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

