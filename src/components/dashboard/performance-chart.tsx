import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VelocityPoint } from "@/server/data/dashboard";

type PerformanceChartProps = {
  data: VelocityPoint[];
};

function buildPath(points: number[], maxValue: number) {
  return points
    .map((point, index) => {
      const x =
        points.length === 1
          ? 0
          : (index / (points.length - 1)) * 100;
      const y = 100 - (point / maxValue) * 100;
      return `${index === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const maxValue =
    data.length > 0
      ? Math.max(...data.map((point) => Math.max(point.completed, point.backlog)))
      : 1;

  const completedPath = buildPath(
    data.map((item) => item.completed),
    maxValue,
  );
  const backlogPath = buildPath(
    data.map((item) => item.backlog),
    maxValue,
  );

  return (
    <Card className="border-muted-foreground/10 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>출시 트렌드</CardTitle>
          <CardDescription>
            주간 단위 완료 이슈와 백로그 추이를 빠르게 파악하세요.
          </CardDescription>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          최근 {data.length}주
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-48 w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="backlogGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(248 113 113)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(248 113 113)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d={completedPath}
              fill="none"
              stroke="rgb(16 185 129)"
              strokeWidth="1.5"
            />
            <path
              d={`${completedPath} L 100,100 L 0,100 Z`}
              fill="url(#completedGradient)"
              stroke="none"
            />
            <path
              d={backlogPath}
              fill="none"
              stroke="rgb(248 113 113)"
              strokeWidth="1.5"
            />
            <path
              d={`${backlogPath} L 100,100 L 0,100 Z`}
              fill="url(#backlogGradient)"
              stroke="none"
            />
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">완료</p>
            <p className="text-2xl font-semibold text-emerald-600">
              {data[data.length - 1]?.completed ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              지난 주 대비{" "}
              {(data[data.length - 1]?.completed ?? 0) -
                (data[data.length - 2]?.completed ?? 0)}
              건
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">백로그</p>
            <p className="text-2xl font-semibold text-red-500">
              {data[data.length - 1]?.backlog ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {(data[data.length - 1]?.backlog ?? 0) -
                (data[data.length - 2]?.backlog ?? 0)}
              건 변화
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {data.map((point) => (
            <div key={point.label} className="flex items-center gap-2">
              <span className="font-medium text-foreground">{point.label}</span>
              <span className="text-emerald-600">
                완료 {point.completed}
              </span>
              <span className="text-red-500">백로그 {point.backlog}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

