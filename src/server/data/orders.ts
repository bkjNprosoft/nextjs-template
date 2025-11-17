import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const getOrders = cache(
  async (userId: string, options?: { take?: number }) => {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
      take: options?.take,
    });
  },
);

export const getOrderById = cache(async (id: string, userId?: string) => {
  return prisma.order.findFirst({
    where: {
      id,
      ...(userId && { userId }),
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
      shippingAddress: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
});

export const getOrderByNumber = cache(
  async (orderNumber: string, userId?: string) => {
    return prisma.order.findFirst({
      where: {
        orderNumber,
        ...(userId && { userId }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    });
  },
);

