import "server-only";

import { cache } from "react";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const getProducts = cache(
  async (options?: {
    categoryId?: string;
    search?: string;
    featured?: boolean;
    active?: boolean;
    skip?: number;
    take?: number;
    orderBy?: "price_asc" | "price_desc" | "created_desc" | "name_asc";
  }) => {
    const where: Prisma.ProductWhereInput = {
      active: options?.active ?? true,
      ...(options?.featured !== undefined && { featured: options.featured }),
      ...(options?.categoryId && { categoryId: options.categoryId }),
      ...(options?.search && {
        OR: [
          { name: { contains: options.search, mode: "insensitive" } },
          { description: { contains: options.search, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      options?.orderBy === "price_asc"
        ? { price: "asc" }
        : options?.orderBy === "price_desc"
          ? { price: "desc" }
          : options?.orderBy === "name_asc"
            ? { name: "asc" }
            : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: options?.skip,
        take: options?.take ?? 20,
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
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  },
);

export const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
});

export const getProductById = cache(async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
});

export const getFeaturedProducts = cache(async (limit = 8) => {
  return prisma.product.findMany({
    where: {
      active: true,
      featured: true,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: {
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
  });
});

