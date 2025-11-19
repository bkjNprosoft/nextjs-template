import "server-only";

import { cache } from "react";
import { Prisma } from "@prisma/client";

import { prisma } from "@/shared/lib/prisma";

export const getCategories = cache(
  async (options?: {
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
    search?: string;
    featured?: boolean;
  }) => {
    // onSale 필터는 DB에서 직접 처리할 수 없으므로 (Decimal 비교 필요),
    // 먼저 compareAtPrice가 있는 상품만 가져온 후 메모리에서 필터링
    const baseWhere: Prisma.ProductWhereInput = {
      active: true,
      // featured가 명시적으로 true일 때만 필터 적용 (false는 필터링하지 않음)
      ...(options?.featured === true && { featured: true }),
      // 가격 필터: minPrice와 maxPrice를 하나의 객체로 합침
      ...((options?.minPrice !== undefined || options?.maxPrice !== undefined) && {
        price: {
          ...(options?.minPrice !== undefined && { gte: options.minPrice }),
          ...(options?.maxPrice !== undefined && { lte: options.maxPrice }),
        },
      }),
      ...(options?.inStock === true && {
        stock: { gt: 0 },
      }),
      ...(options?.onSale === true && {
        compareAtPrice: { not: null },
      }),
      ...(options?.search && {
        OR: [
          { name: { contains: options.search, mode: "insensitive" } },
          { description: { contains: options.search, mode: "insensitive" } },
        ],
      }),
    };

    // 카테고리와 상품을 가져옴
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // 최상위 카테고리만
      },
      include: {
        children: {
          orderBy: { name: "asc" },
        },
        products: {
          where: baseWhere,
          select: {
            id: true,
            categoryId: true,
            price: true,
            compareAtPrice: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // onSale 필터가 적용된 경우, 실제 할인 중인 상품만 카운트
    return categories.map((category) => {
      let products = category.products;

      if (options?.onSale === true) {
        products = products.filter((product) => {
          if (!product.compareAtPrice) return false;
          return Number(product.price) < Number(product.compareAtPrice);
        });
      }

      // 각 카테고리별 상품 수 계산
      const productCounts = products.reduce((acc, product) => {
        const catId = product.categoryId || "uncategorized";
        acc[catId] = (acc[catId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 자식 카테고리도 동일하게 처리
      const childrenWithCounts = category.children.map((child) => {
        const childProducts = products.filter((p) => p.categoryId === child.id);
        return {
          ...child,
          _count: {
            products: childProducts.length,
          },
        };
      });

      // products를 제거하고 필요한 필드만 반환 (Decimal 타입 제거)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { products: _, ...categoryWithoutProducts } = category;
      
      return {
        ...categoryWithoutProducts,
        children: childrenWithCounts,
        _count: {
          products: productCounts[category.id] || 0,
        },
      };
    });
  }
);

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
