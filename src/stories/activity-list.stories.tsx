import type { Meta, StoryObj } from "@storybook/react";

import { ActivityList } from "@/components/dashboard/activity-list";
import type { DashboardActivity } from "@/server/data/dashboard";

const meta = {
  title: "Dashboard/ActivityList",
  component: ActivityList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ActivityList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockActivities: DashboardActivity[] = [
  {
    id: "1",
    title: "홍길동 합류",
    description: "개발팀 워크스페이스에 member 권한으로 참여했습니다.",
    timestamp: new Date("2024-11-10T10:30:00"),
    badge: "MEMBER",
  },
  {
    id: "2",
    title: "마케팅팀 워크스페이스 생성",
    description: "새로운 팀 공간이 생성되어 초기 설정을 진행할 수 있습니다.",
    timestamp: new Date("2024-11-09T14:20:00"),
    badge: "Workspace",
  },
  {
    id: "3",
    title: "김철수 합류",
    description: "디자인팀 워크스페이스에 admin 권한으로 참여했습니다.",
    timestamp: new Date("2024-11-08T09:15:00"),
    badge: "ADMIN",
  },
];

export const Default: Story = {
  args: {
    activities: mockActivities,
  },
};

export const Empty: Story = {
  args: {
    activities: [],
  },
};

export const SingleActivity: Story = {
  args: {
    activities: [mockActivities[0]],
  },
};

export const ManyActivities: Story = {
  args: {
    activities: [
      ...mockActivities,
      {
        id: "4",
        title: "이영희 합류",
        description: "프로덕트팀 워크스페이스에 member 권한으로 참여했습니다.",
        timestamp: new Date("2024-11-07T16:45:00"),
        badge: "MEMBER",
      },
      {
        id: "5",
        title: "엔지니어링팀 워크스페이스 생성",
        description: "새로운 팀 공간이 생성되어 초기 설정을 진행할 수 있습니다.",
        timestamp: new Date("2024-11-06T11:00:00"),
        badge: "Workspace",
      },
    ],
  },
};

