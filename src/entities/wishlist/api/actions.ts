"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/server/auth";
import { prisma } from "@/shared/lib/prisma";

const addToWishlistSchema = z.object({
  productId: z.string().min(1),
});

export async function addToWishlistAction(formData: FormData) {
  const user = await requireUser();

  const parsed = addToWishlistSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 이미 위시리스트에 있는지 확인
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: parsed.data.productId,
        },
      },
    });

    if (existing) {
      return {
        success: false as const,
        errors: {
          _general: ["이미 위시리스트에 추가된 상품입니다."],
        },
      };
    }

    await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId: parsed.data.productId,
      },
    });

    revalidatePath("/wishlist");
    revalidatePath("/products");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "위시리스트 추가에 실패했습니다.",
        ],
      },
    };
  }
}

const removeFromWishlistSchema = z.object({
  productId: z.string().min(1),
});

export async function removeFromWishlistAction(formData: FormData) {
  const user = await requireUser();

  const parsed = removeFromWishlistSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId: parsed.data.productId,
      },
    });

    revalidatePath("/wishlist");
    revalidatePath("/products");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "위시리스트에서 제거에 실패했습니다.",
        ],
      },
    };
  }
}

