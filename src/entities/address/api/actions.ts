"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/shared/lib/prisma";
import { requireUser } from "@/server/auth";

const createAddressSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().default("KR"),
  isDefault: z.boolean().default(false),
});

export async function createAddressAction(formData: FormData) {
  const user = await requireUser();

  const parsed = createAddressSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "KR",
    isDefault: formData.get("isDefault") === "true",
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 기본 주소로 설정하는 경우, 기존 기본 주소 해제
    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    await prisma.address.create({
      data: {
        userId: user.id,
        ...parsed.data,
      },
    });

    revalidatePath("/profile");

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
            : "배송지 추가에 실패했습니다.",
        ],
      },
    };
  }
}

const updateAddressSchema = createAddressSchema.extend({
  id: z.string().min(1),
});

export async function updateAddressAction(formData: FormData) {
  const user = await requireUser();

  const parsed = updateAddressSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "KR",
    isDefault: formData.get("isDefault") === "true",
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const address = await prisma.address.findFirst({
      where: {
        id: parsed.data.id,
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

    // 기본 주소로 설정하는 경우, 기존 기본 주소 해제
    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: parsed.data.id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    await prisma.address.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2,
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        isDefault: parsed.data.isDefault,
      },
    });

    revalidatePath("/profile");

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
            : "배송지 수정에 실패했습니다.",
        ],
      },
    };
  }
}

const deleteAddressSchema = z.object({
  id: z.string().min(1),
});

export async function deleteAddressAction(formData: FormData) {
  const user = await requireUser();

  const parsed = deleteAddressSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const address = await prisma.address.findFirst({
      where: {
        id: parsed.data.id,
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

    await prisma.address.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath("/profile");

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
            : "배송지 삭제에 실패했습니다.",
        ],
      },
    };
  }
}

