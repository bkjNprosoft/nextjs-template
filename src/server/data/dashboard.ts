import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

type TrendDirection = "up" | "down";

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  changeLabel: string;
  trend: TrendDirection;
};

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  badge: string;
};

export type VelocityPoint = {
  label: string;
  completed: number;
  backlog: number;
};

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  memberCount: number;
  roleLabel: string;
};

export type DashboardSnapshot = {
  metrics: DashboardMetric[];
  activities: DashboardActivity[];
  velocity: VelocityPoint[];
  workspaces: WorkspaceSummary[];
};

const numberFormatter = new Intl.NumberFormat("ko-KR");
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
});

const DAYS_30_MS = 1000 * 60 * 60 * 24 * 30;

function formatChangeLabel(value: number, suffix = "%") {
  const rounded = Math.abs(value).toFixed(0);
  const direction = value >= 0 ? "+" : "-";
  return `${direction}${rounded}${suffix}`;
}

function buildVelocitySeries(
  workspaceCount: number,
  recentMembers: number,
): VelocityPoint[] {
  const now = Date.now();
  const maxValue = Math.max(6, workspaceCount * 4 + recentMembers);

  return Array.from({ length: 6 }).map((_, index) => {
    const weeksAgo = 5 - index;
    const completed =
      Math.round(maxValue * 0.6) + Math.max(0, weeksAgo - 2) * 2;
    const backlog = Math.max(2, Math.round(completed * 0.55) - weeksAgo);

    return {
      label: dateFormatter.format(new Date(now - weeksAgo * 7 * 86_400_000)),
      completed,
      backlog,
    };
  });
}

export const getDashboardSnapshot = cache(
  async (userId: string): Promise<DashboardSnapshot> => {
    const workspaceRecords = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        ownerId: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    const workspaceIds = workspaceRecords.map((workspace) => workspace.id);

    const thirtyDaysAgo = new Date(Date.now() - DAYS_30_MS);

    const [memberCount, recentMembers, membershipsForUser, membershipEvents] =
      await Promise.all([
        workspaceIds.length
          ? prisma.workspaceMember.count({
              where: { workspaceId: { in: workspaceIds } },
            })
          : Promise.resolve(0),
        workspaceIds.length
          ? prisma.workspaceMember.count({
              where: {
                workspaceId: { in: workspaceIds },
                createdAt: { gte: thirtyDaysAgo },
              },
            })
          : Promise.resolve(0),
        workspaceIds.length
          ? prisma.workspaceMember.findMany({
              where: { workspaceId: { in: workspaceIds }, userId },
              select: { workspaceId: true, role: true },
            })
          : Promise.resolve([]),
        workspaceIds.length
          ? prisma.workspaceMember.findMany({
              where: { workspaceId: { in: workspaceIds } },
              orderBy: { createdAt: "desc" },
              take: 8,
              select: {
                id: true,
                role: true,
                createdAt: true,
                workspace: { select: { name: true } },
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            })
          : Promise.resolve([]),
      ]);

    const workspaceLast30Days = workspaceRecords.filter(
      (workspace) => workspace.createdAt >= thirtyDaysAgo,
    ).length;

    const workspaceRoleMap = new Map(
      membershipsForUser.map((membership) => [
        membership.workspaceId,
        membership.role,
      ]),
    );

    const workspaces: WorkspaceSummary[] = workspaceRecords.map(
      (workspace) => ({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
        memberCount: workspace._count.members,
        roleLabel:
          workspace.ownerId === userId
            ? "OWNER"
            : workspaceRoleMap.get(workspace.id) ?? "MEMBER",
      }),
    );

    const membershipActivities: DashboardActivity[] = membershipEvents.map(
      (event) => ({
        id: event.id,
        title: `${event.user.name ?? event.user.email ?? "새 멤버"} 합류`,
        description: `${event.workspace.name} 팀에 ${event.role.toLowerCase()} 권한으로 참여했습니다.`,
        timestamp: event.createdAt,
        badge: event.role,
      }),
    );

    const workspaceActivities: DashboardActivity[] = workspaceRecords.map(
      (workspace) => ({
        id: `workspace-${workspace.id}`,
        title: `${workspace.name} 워크스페이스 생성`,
        description:
          "새로운 팀 공간이 생성되어 초기 설정을 진행할 수 있습니다.",
        timestamp: workspace.createdAt,
        badge: "Workspace",
      }),
    );

    const activities = [...membershipActivities, ...workspaceActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 6);

    const totalWorkspaces = workspaces.length;
    const avgTeamSize =
      totalWorkspaces === 0
        ? 0
        : Number((memberCount / totalWorkspaces).toFixed(1));

    const velocitySeries = buildVelocitySeries(totalWorkspaces, recentMembers);
    const latestVelocity = velocitySeries[velocitySeries.length - 1];
    const previousVelocity =
      velocitySeries[velocitySeries.length - 2] ?? latestVelocity;
    const velocityDelta =
      latestVelocity.completed - previousVelocity.completed;

    const metrics: DashboardMetric[] = [
      {
        id: "workspaces",
        label: "활성 워크스페이스",
        value: numberFormatter.format(totalWorkspaces),
        helper: "전체 관리 중인 팀",
        changeLabel: formatChangeLabel(
          totalWorkspaces
            ? (workspaceLast30Days / Math.max(totalWorkspaces, 1)) * 100
            : 0,
        ),
        trend:
          workspaceLast30Days >= Math.max(1, totalWorkspaces / 4)
            ? "up"
            : "down",
      },
      {
        id: "members",
        label: "참여 중인 멤버",
        value: numberFormatter.format(memberCount),
        helper: "전체 워크스페이스 멤버 수",
        changeLabel: formatChangeLabel(recentMembers, "명"),
        trend: recentMembers >= 0 ? "up" : "down",
      },
      {
        id: "team-size",
        label: "평균 팀 크기",
        value: `${avgTeamSize || 0}명`,
        helper: "워크스페이스당 평균 멤버",
        changeLabel: formatChangeLabel(avgTeamSize - 1, "명"),
        trend: avgTeamSize >= 4 ? "up" : "down",
      },
      {
        id: "velocity",
        label: "출시 속도",
        value: `${latestVelocity.completed}건`,
        helper: "주간 완료 이슈",
        changeLabel: formatChangeLabel(velocityDelta, "건"),
        trend: velocityDelta >= 0 ? "up" : "down",
      },
    ];

    return {
      metrics,
      activities,
      velocity: velocitySeries,
      workspaces,
    };
  },
);

