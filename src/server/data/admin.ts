import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const getAdminStats = cache(async () => {
  const [
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    totalRevenue,
    totalCustomers,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: {
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        take: 1,
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    totalCustomers,
    recentOrders,
  };
});

