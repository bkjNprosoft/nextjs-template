import Link from "next/link";

import { CreateWorkspaceForm } from "@/components/forms/create-workspace-form";
import { ActivityList } from "@/components/dashboard/activity-list";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { getDashboardSnapshot } from "@/server/data/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    // This path is additionally guarded by (app)/layout.tsx, but we keep it defensively.
    return null;
  }

  const { metrics, activities, velocity, workspaces } =
    await getDashboardSnapshot(session.user.id);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <PerformanceChart data={velocity} />
        <ActivityList activities={activities} />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create a workspace</CardTitle>
            <CardDescription>
              Workspaces group members, billing, and product areas. Start with a
              name—you can refine permissions later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkspaceForm />
          </CardContent>
        </Card>

        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle>Your workspaces</CardTitle>
            <CardDescription>
              Select a workspace to open the app surface tailored to that team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don’t belong to any workspaces yet. Create one using the
                form on the left.
              </p>
            ) : (
              <ul className="space-y-3">
                {workspaces.map((workspace) => (
                  <li
                    key={workspace.id}
                    className="rounded-lg border bg-background p-4 transition hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/workspaces/${workspace.slug}`}
                          className="font-semibold hover:underline"
                        >
                          {workspace.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {workspace.createdAt.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {workspace.memberCount} members
                        </p>
                      </div>
                      <Badge variant="outline">{workspace.roleLabel}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Separator />
            <p className="text-xs text-muted-foreground">
              Need granular roles, billing centers, or SSO? Extend the workspace
              model within <code className="font-mono">prisma/schema.prisma</code>{" "}
              and regenerate the client.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

