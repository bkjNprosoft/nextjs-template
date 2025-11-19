import "server-only";

import { cache } from "react";

import { prisma } from "@/shared/lib/prisma";

export const getUserPreferences = cache(async (userId: string) => {
  return prisma.userPreference.findUnique({
    where: { userId },
  });
});
