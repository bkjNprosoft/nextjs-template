"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth";
import { slugify } from "@/lib/slugify";

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string().optional(),
  featured: z.boolean().default(false),
  images: z.array(z.string().url()).min(1),
});

export async function createProductAction(formData: FormData) {
  await requireRole("ADMIN");

  const name = formData.get("name");
  const description = formData.get("description");
  const price = formData.get("price");
  const compareAtPrice = formData.get("compareAtPrice");
  const sku = formData.get("sku");
  const stock = formData.get("stock");
  const categoryId = formData.get("categoryId");
  const featured = formData.get("featured");
  const images = formData.getAll("images");

  const parsed = createProductSchema.safeParse({
    name,
    description: description || undefined,
    price,
    compareAtPrice: compareAtPrice || undefined,
    sku: sku || undefined,
    stock: Number(stock),
    categoryId: categoryId || undefined,
    featured: featured === "true" || featured === "on",
    images: images.filter((img): img is string => typeof img === "string"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const baseSlug = slugify(parsed.data.name) || "product";
    const existingCount = await prisma.product.count({
      where: { slug: { startsWith: baseSlug } },
    });
    const slug =
      existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

    await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice,
        sku: parsed.data.sku,
        stock: parsed.data.stock,
        categoryId: parsed.data.categoryId,
        featured: parsed.data.featured,
        images: parsed.data.images,
      },
    });

    revalidatePath("/admin/products");
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
            : "상품 생성에 실패했습니다.",
        ],
      },
    };
  }
}

const updateProductSchema = createProductSchema.extend({
  id: z.string().min(1),
  slug: z.string().min(1),
});

export async function updateProductAction(formData: FormData) {
  await requireRole("ADMIN");

  const id = formData.get("id");
  const slug = formData.get("slug");
  const name = formData.get("name");
  const description = formData.get("description");
  const price = formData.get("price");
  const compareAtPrice = formData.get("compareAtPrice");
  const sku = formData.get("sku");
  const stock = formData.get("stock");
  const categoryId = formData.get("categoryId");
  const featured = formData.get("featured");
  const active = formData.get("active");
  const images = formData.getAll("images");

  const parsed = updateProductSchema.safeParse({
    id,
    slug,
    name,
    description: description || undefined,
    price,
    compareAtPrice: compareAtPrice || undefined,
    sku: sku || undefined,
    stock: Number(stock),
    categoryId: categoryId || undefined,
    featured: featured === "true" || featured === "on",
    images: images.filter((img): img is string => typeof img === "string"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.product.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice,
        sku: parsed.data.sku,
        stock: parsed.data.stock,
        categoryId: parsed.data.categoryId,
        featured: parsed.data.featured,
        active: active === "true" || active === "on",
        images: parsed.data.images,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${parsed.data.slug}`);

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
            : "상품 수정에 실패했습니다.",
        ],
      },
    };
  }
}

const deleteProductSchema = z.object({
  id: z.string().min(1),
});

export async function deleteProductAction(formData: FormData) {
  await requireRole("ADMIN");

  const parsed = deleteProductSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.product.delete({
      where: { id: parsed.data.id },
    });

    revalidatePath("/admin/products");
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
            : "상품 삭제에 실패했습니다.",
        ],
      },
    };
  }
}

