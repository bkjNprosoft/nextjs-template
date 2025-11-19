"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/shared/lib/prisma";
import { requireUser } from "@/server/auth";

const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function updateCartItemAction(formData: FormData) {
  const user = await requireUser();

  const parsed = updateCartItemSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
    quantity: Number(formData.get("quantity")),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parsed.data.cartItemId },
      include: {
        cart: {
          select: { userId: true },
        },
        product: {
          select: { stock: true },
        },
      },
    });

    if (!cartItem || cartItem.cart.userId !== user.id) {
      return {
        success: false as const,
        errors: {
          _general: ["장바구니 항목을 찾을 수 없습니다."],
        },
      };
    }

    if (cartItem.product.stock < parsed.data.quantity) {
      return {
        success: false as const,
        errors: {
          _general: ["재고가 부족합니다."],
        },
      };
    }

    await prisma.cartItem.update({
      where: { id: parsed.data.cartItemId },
      data: { quantity: parsed.data.quantity },
    });

    revalidatePath("/cart");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error
            ? error.message
            : "장바구니 업데이트에 실패했습니다.",
        ],
      },
    };
  }
}

const removeCartItemSchema = z.object({
  cartItemId: z.string().min(1),
});

export async function removeCartItemAction(formData: FormData) {
  const user = await requireUser();

  const parsed = removeCartItemSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parsed.data.cartItemId },
      include: {
        cart: {
          select: { userId: true },
        },
      },
    });

    if (!cartItem || cartItem.cart.userId !== user.id) {
      return {
        success: false as const,
        errors: {
          _general: ["장바구니 항목을 찾을 수 없습니다."],
        },
      };
    }

    await prisma.cartItem.delete({
      where: { id: parsed.data.cartItemId },
    });

    revalidatePath("/cart");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error
            ? error.message
            : "장바구니 항목 삭제에 실패했습니다.",
        ],
      },
    };
  }
}

