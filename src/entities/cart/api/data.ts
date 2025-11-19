import "server-only";

import { cache } from "react";

import { prisma } from "@/shared/lib/prisma";

export const getCart = cache(async (userId: string) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              stock: true,
              active: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
});

