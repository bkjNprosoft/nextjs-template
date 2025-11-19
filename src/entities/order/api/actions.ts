"use server";

import { OrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/shared/lib/prisma";
import { requireUser, requireRole } from "@/server/auth";
import { getCart } from "@/entities/cart/api/data";

const createOrderSchema = z.object({
  shippingAddressId: z.string().min(1),
  notes: z.string().optional(),
});

export async function createOrderAction(formData: FormData) {
  const user = await requireUser();

  const parsed = createOrderSchema.safeParse({
    shippingAddressId: formData.get("shippingAddressId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const cart = await getCart(user.id);

    if (!cart || cart.items.length === 0) {
      return {
        success: false as const,
        errors: {
          _general: ["장바구니가 비어있습니다."],
        },
      };
    }

    const address = await prisma.address.findFirst({
      where: {
        id: parsed.data.shippingAddressId,
        userId: user.id,
      },
    });

    if (!address) {
      return {
        success: false as const,
        errors: {
          _general: ["배송지를 찾을 수 없습니다."],
        },
      };
    }

    // 재고 확인 및 총액 계산
    let totalAmount = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: Decimal;
    }> = [];

    for (const item of cart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, price: true, stock: true, active: true },
      });

      if (!product || !product.active) {
        return {
          success: false as const,
          errors: {
            _general: [`${item.product.name} 상품이 판매 중이 아닙니다.`],
          },
        };
      }

      if (product.stock < item.quantity) {
        return {
          success: false as const,
          errors: {
            _general: [`${item.product.name} 재고가 부족합니다.`],
          },
        };
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 주문 번호 생성
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 트랜잭션으로 주문 생성 및 재고 차감, 장바구니 비우기
    const order = await prisma.$transaction(async (tx) => {
      // 주문 생성
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          shippingAddressId: address.id,
          totalAmount,
          notes: parsed.data.notes,
          status: "PENDING",
          items: {
            create: orderItems,
          },
        },
      });

      // 재고 차감
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 장바구니 비우기
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    revalidatePath("/cart");
    revalidatePath("/orders");

    return {
      success: true as const,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "주문 생성에 실패했습니다.",
        ],
      },
    };
  }
}

const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(OrderStatus),
});

export async function updateOrderStatusAction(formData: FormData) {
  await requireRole("ADMIN");

  const parsed = updateOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: parsed.data.status },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${parsed.data.orderId}`);

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
            : "주문 상태 업데이트에 실패했습니다.",
        ],
      },
    };
  }
}

