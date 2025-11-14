import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetric } from "@/server/data/dashboard";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  metric: DashboardMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  const Icon = metric.trend === "up" ? TrendingUp : TrendingDown;

  return (
    <Card className="border-muted-foreground/10 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
        <Icon
          className={cn(
            "h-4 w-4",
            metric.trend === "up" ? "text-emerald-500" : "text-red-500",
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{metric.value}</div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "font-semibold",
              metric.trend === "up" ? "text-emerald-600" : "text-red-500",
            )}
          >
            {metric.changeLabel}
          </span>
          <span className="text-muted-foreground">{metric.helper}</span>
        </div>
      </CardContent>
    </Card>
  );
}

