"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth";
import { slugify } from "@/lib/slugify";

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  image: z.string().url().optional(),
});

export async function createCategoryAction(formData: FormData) {
  await requireRole("ADMIN");

  const parsed = createCategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    parentId: formData.get("parentId"),
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const baseSlug = slugify(parsed.data.name) || "category";
    const existingCount = await prisma.category.count({
      where: { slug: { startsWith: baseSlug } },
    });
    const slug =
      existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        parentId: parsed.data.parentId,
        image: parsed.data.image,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");

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
            : "카테고리 생성에 실패했습니다.",
        ],
      },
    };
  }
}

const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1),
});

export async function updateCategoryAction(formData: FormData) {
  await requireRole("ADMIN");

  const parsed = updateCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    parentId: formData.get("parentId"),
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.category.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        parentId: parsed.data.parentId,
        image: parsed.data.image,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");

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
            : "카테고리 수정에 실패했습니다.",
        ],
      },
    };
  }
}

const deleteCategorySchema = z.object({
  id: z.string().min(1),
});

export async function deleteCategoryAction(formData: FormData) {
  await requireRole("ADMIN");

  const parsed = deleteCategorySchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 하위 카테고리나 상품이 있는지 확인
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.id },
      include: {
        children: { take: 1 },
        products: { take: 1 },
      },
    });

    if (!category) {
      return {
        success: false as const,
        errors: {
          _general: ["카테고리를 찾을 수 없습니다."],
        },
      };
    }

    if (category.children.length > 0) {
      return {
        success: false as const,
        errors: {
          _general: ["하위 카테고리가 있어 삭제할 수 없습니다."],
        },
      };
    }

    if (category.products.length > 0) {
      return {
        success: false as const,
        errors: {
          _general: ["상품이 연결되어 있어 삭제할 수 없습니다."],
        },
      };
    }

    await prisma.category.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");

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
            : "카테고리 삭제에 실패했습니다.",
        ],
      },
    };
  }
}

