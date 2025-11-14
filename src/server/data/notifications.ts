import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const getUserPreferences = cache(async (userId: string) => {
  return prisma.userPreference.findUnique({
    where: { userId },
  });
});
