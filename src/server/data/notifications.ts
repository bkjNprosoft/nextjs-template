import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const getNotificationsForUser = cache(async (userId: string) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
});

export const getUserPreferences = cache(async (userId: string) => {
  return prisma.userPreference.findUnique({
    where: { userId },
  });
});

