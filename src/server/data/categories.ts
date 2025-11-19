import "server-only";

import { cache } from "react";

import { prisma } from "@/shared/lib/prisma";

export const getCategories = cache(async () => {
  return prisma.category.findMany({
    where: {
      parentId: null, // 최상위 카테고리만
    },
    include: {
      children: {
        orderBy: { name: "asc" },
      },
      _count: {
        select: {
          products: {
            where: {
              active: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          products: {
            where: {
              active: true,
            },
          },
        },
      },
    },
  });
});

