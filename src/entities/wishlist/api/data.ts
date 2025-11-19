import "server-only";

import { cache } from "react";

import { prisma } from "@/shared/lib/prisma";

export const getWishlist = cache(async (userId: string) => {
  return prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    include: {
      product: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
});

export const isInWishlist = cache(async (userId: string, productId: string) => {
  const item = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return !!item;
});

export const getWishlistProductIds = cache(async (userId: string) => {
  const items = await prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    select: {
      productId: true,
    },
  });

  return items.map((item) => item.productId);
});

