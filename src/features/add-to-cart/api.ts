"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/shared/lib/prisma";
import { requireUser } from "@/server/auth";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export async function addToCartAction(formData: FormData) {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof Error && error.message === "User is not authenticated.") {
      return {
        success: false as const,
        errors: {
          _general: ["로그인이 필요합니다."],
          _auth: ["로그인이 필요합니다."],
        },
      };
    }
    throw error;
  }

  const parsed = addToCartSchema.safeParse({
    productId: formData.get("productId"),
    quantity: Number(formData.get("quantity")),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true, stock: true, active: true },
    });

    if (!product || !product.active) {
      return {
        success: false as const,
        errors: {
          _general: ["상품을 찾을 수 없거나 판매 중이 아닙니다."],
        },
      };
    }

    if (product.stock < parsed.data.quantity) {
      return {
        success: false as const,
        errors: {
          _general: ["재고가 부족합니다."],
        },
      };
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parsed.data.productId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + parsed.data.quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parsed.data.productId,
          quantity: parsed.data.quantity,
        },
      });
    }

    revalidatePath("/cart");
    revalidatePath("/");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "장바구니 추가에 실패했습니다.",
        ],
      },
    };
  }
}

