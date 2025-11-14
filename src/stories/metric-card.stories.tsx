import type { Meta, StoryObj } from "@storybook/react";

import { MetricCard } from "@/components/dashboard/metric-card";

const meta: Meta<typeof MetricCard> = {
  title: "Dashboard/MetricCard",
  component: MetricCard,
  args: {
    metric: {
      id: "stories-metric",
      label: "활성 워크스페이스",
      value: "12",
      helper: "전체 팀 개수",
      changeLabel: "+18%",
      trend: "up",
    },
  },
};

export default meta;

type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {};

export const NegativeTrend: Story = {
  args: {
    metric: {
      id: "stories-metric-negative",
      label: "출시 속도",
      value: "8건",
      helper: "주간 완료 이슈",
      changeLabel: "-2건",
      trend: "down",
    },
  },
};

