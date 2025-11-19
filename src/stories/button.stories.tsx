/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { Button } from "@/shared/ui/atoms/button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    children: "Button",
  } as any,
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  } as any,
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  } as any,
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  } as any,
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  } as any,
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  } as any,
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  } as any,
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  } as any,
};

export const Icon: Story = {
  args: {
    size: "icon",
    children: "🚀",
  } as any,
};

