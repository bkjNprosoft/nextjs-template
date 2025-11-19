"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/shared/lib/prisma";
import { requireUser } from "@/server/auth";

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

export async function createReviewAction(formData: FormData) {
  const user = await requireUser();

  const parsed = createReviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: Number(formData.get("rating")),
    title: formData.get("title"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 이미 리뷰를 작성했는지 확인
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: parsed.data.productId,
          userId: user.id,
        },
      },
    });

    if (existingReview) {
      return {
        success: false as const,
        errors: {
          _general: ["이미 이 상품에 대한 리뷰를 작성하셨습니다."],
        },
      };
    }

    // 주문 확인 (선택적 - 주문한 상품만 리뷰 가능하도록 하려면)
    // const hasOrdered = await prisma.orderItem.findFirst({
    //   where: {
    //     order: { userId: user.id },
    //     productId: parsed.data.productId,
    //   },
    // });

    await prisma.review.create({
      data: {
        productId: parsed.data.productId,
        userId: user.id,
        rating: parsed.data.rating,
        title: parsed.data.title,
        comment: parsed.data.comment,
        verified: false, // 주문 확인 후 true로 변경 가능
      },
    });

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { sku: true, id: true },
    });

    if (product) {
      const productIdentifier = product.sku || product.id;
      revalidatePath(`/products/${productIdentifier}`);
    }

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "리뷰 작성에 실패했습니다.",
        ],
      },
    };
  }
}

const updateReviewSchema = createReviewSchema.extend({
  id: z.string().min(1),
});

export async function updateReviewAction(formData: FormData) {
  const user = await requireUser();

  const parsed = updateReviewSchema.safeParse({
    id: formData.get("id"),
    productId: formData.get("productId"),
    rating: Number(formData.get("rating")),
    title: formData.get("title"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const review = await prisma.review.findFirst({
      where: {
        id: parsed.data.id,
        userId: user.id,
      },
    });

    if (!review) {
      return {
        success: false as const,
        errors: {
          _general: ["리뷰를 찾을 수 없습니다."],
        },
      };
    }

    await prisma.review.update({
      where: { id: parsed.data.id },
      data: {
        rating: parsed.data.rating,
        title: parsed.data.title,
        comment: parsed.data.comment,
      },
    });

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { sku: true, id: true },
    });

    if (product) {
      const productIdentifier = product.sku || product.id;
      revalidatePath(`/products/${productIdentifier}`);
    }

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "리뷰 수정에 실패했습니다.",
        ],
      },
    };
  }
}

const deleteReviewSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
});

export async function deleteReviewAction(formData: FormData) {
  const user = await requireUser();

  const parsed = deleteReviewSchema.safeParse({
    id: formData.get("id"),
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const review = await prisma.review.findFirst({
      where: {
        id: parsed.data.id,
        userId: user.id,
      },
    });

    if (!review) {
      return {
        success: false as const,
        errors: {
          _general: ["리뷰를 찾을 수 없습니다."],
        },
      };
    }

    await prisma.review.delete({
      where: { id: parsed.data.id },
    });

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { sku: true, id: true },
    });

    if (product) {
      const productIdentifier = product.sku || product.id;
      revalidatePath(`/products/${productIdentifier}`);
    }

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "리뷰 삭제에 실패했습니다.",
        ],
      },
    };
  }
}

