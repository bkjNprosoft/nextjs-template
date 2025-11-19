import "server-only";

import { cache } from "react";
import { Prisma } from "@prisma/client";

import { prisma } from "@/shared/lib/prisma";

export const getProducts = cache(
  async (options?: {
    categoryId?: string;
    search?: string;
    featured?: boolean;
    active?: boolean;
    skip?: number;
    take?: number;
    orderBy?: "price_asc" | "price_desc" | "created_desc" | "name_asc" | "popular" | "rating" | "reviews";
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
  }) => {
    const where: Prisma.ProductWhereInput = {
      active: options?.active ?? true,
      // featured가 명시적으로 true일 때만 필터 적용 (false는 필터링하지 않음)
      ...(options?.featured === true && { featured: true }),
      ...(options?.categoryId && { categoryId: options.categoryId }),
      ...(options?.search && {
        OR: [
          { name: { contains: options.search, mode: "insensitive" } },
          { description: { contains: options.search, mode: "insensitive" } },
        ],
      }),
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
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput;
    
    if (options?.orderBy === "popular") {
      // 인기순: 리뷰 수가 많은 순
      orderBy = { reviews: { _count: "desc" } };
    } else if (options?.orderBy === "rating") {
      // 평점순: 리뷰 평균 평점이 높은 순 (복잡하므로 일단 리뷰 수로 대체)
      orderBy = { reviews: { _count: "desc" } };
    } else if (options?.orderBy === "reviews") {
      // 리뷰 많은 순
      orderBy = { reviews: { _count: "desc" } };
    } else if (options?.orderBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (options?.orderBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (options?.orderBy === "name_asc") {
      orderBy = { name: "asc" };
    } else {
      orderBy = { createdAt: "desc" };
    }

    // 인기순, 평점순, 리뷰순의 경우 리뷰 정보를 포함해야 함
    const includeReviews = options?.orderBy === "popular" || options?.orderBy === "rating" || options?.orderBy === "reviews";

    // onSale 필터가 true인 경우, 메모리에서 필터링해야 함 (DB에서 Decimal 비교가 복잡함)
    const shouldFilterInMemory = options?.onSale === true;
    
    // onSale 필터는 메모리에서 처리하므로 where에서 제거
    const queryWhere: Prisma.ProductWhereInput = shouldFilterInMemory
      ? Object.fromEntries(
          Object.entries(where).filter(([key]) => key !== "compareAtPrice")
        ) as Prisma.ProductWhereInput
      : where;

    // onSale 필터링을 위해 필요한 경우 모든 제품을 가져옴
    const queryTake = shouldFilterInMemory ? undefined : (options?.take ?? 20);
    const querySkip = shouldFilterInMemory ? undefined : options?.skip;

    const [allProducts, totalBeforeFilter] = await Promise.all([
      prisma.product.findMany({
        where: queryWhere,
        orderBy: includeReviews ? undefined : orderBy,
        skip: querySkip,
        take: queryTake,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          reviews: includeReviews ? {
            select: {
              rating: true,
            },
          } : undefined,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.product.count({ where: queryWhere }),
    ]);

    // 할인 상품 필터링 (compareAtPrice가 있고 price보다 큰 경우)
    let filteredProducts = allProducts;
    if (options?.onSale === true) {
      filteredProducts = allProducts.filter((product) => {
        if (!product.compareAtPrice) return false;
        return Number(product.price) < Number(product.compareAtPrice);
      });
    }

    // 인기순, 평점순, 리뷰순의 경우 메모리에서 정렬
    if (includeReviews && filteredProducts.length > 0) {
      filteredProducts.sort((a, b) => {
        const aReviewCount = a._count.reviews;
        const bReviewCount = b._count.reviews;
        
        if (options?.orderBy === "rating") {
          // 평점순: 평균 평점 계산
          const aAvgRating = a.reviews && a.reviews.length > 0
            ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
            : 0;
          const bAvgRating = b.reviews && b.reviews.length > 0
            ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
            : 0;
          return bAvgRating - aAvgRating;
        }
        
        // 인기순, 리뷰순: 리뷰 수 기준
        return bReviewCount - aReviewCount;
      });
    }

    // onSale 필터링이 적용된 경우, 실제 필터링된 개수를 total로 사용
    let finalProducts = filteredProducts;
    let finalTotal = totalBeforeFilter;

    if (shouldFilterInMemory) {
      // onSale 필터링이 적용된 경우, 전체 개수를 다시 계산
      const allProductsForCount = await prisma.product.findMany({
        where: queryWhere,
        select: {
          id: true,
          price: true,
          compareAtPrice: true,
        },
      });
      
      const filteredCount = allProductsForCount.filter((product) => {
        if (!product.compareAtPrice) return false;
        return Number(product.price) < Number(product.compareAtPrice);
      }).length;
      
      finalTotal = filteredCount;
      
      // 페이지네이션 적용
      const skip = options?.skip ?? 0;
      const take = options?.take ?? 20;
      finalProducts = filteredProducts.slice(skip, skip + take);
    }

    return { products: finalProducts, total: finalTotal };
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

export const getProductBySku = cache(async (skuOrId: string) => {
  // SKU가 없으면 ID로 조회 (fallback)
  return prisma.product.findFirst({
    where: {
      active: true,
      OR: [
        { sku: skuOrId },
        { id: skuOrId },
      ],
    },
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

export const getRelatedProducts = cache(async (productId: string, categoryId: string | null, limit = 4) => {
  return prisma.product.findMany({
    where: {
      active: true,
      id: { not: productId },
      ...(categoryId && { categoryId }),
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

