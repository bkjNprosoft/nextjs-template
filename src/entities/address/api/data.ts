import "server-only";

import { cache } from "react";

import { prisma } from "@/shared/lib/prisma";

export const getAddresses = cache(async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });
});

export const getDefaultAddress = cache(async (userId: string) => {
  return prisma.address.findFirst({
    where: {
      userId,
      isDefault: true,
    },
  });
});

