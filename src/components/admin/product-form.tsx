"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/server/actions/products";
import type { Product, Category } from "@prisma/client";

const productSchema = z.object({
  name: z.string().min(1, "상품명을 입력하세요").max(200),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "올바른 가격을 입력하세요"),
  compareAtPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "올바른 가격을 입력하세요")
    .optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string().optional(),
  featured: z.boolean(),
  active: z.boolean(),
  images: z.array(z.string().url()).min(1, "최소 1개의 이미지가 필요합니다"),
});

type ProductFormProps = {
  product?: Product & { category?: Category | null };
  categories: Category[];
};

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images ?? [""],
  );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price.toString() ?? "",
      compareAtPrice: product?.compareAtPrice?.toString() ?? "",
      sku: product?.sku ?? "",
      stock: product?.stock ?? 0,
      categoryId: product?.categoryId ?? "",
      featured: product?.featured ?? false,
      active: product?.active ?? true,
      images: product?.images ?? [""],
    },
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.description) {
        formData.append("description", values.description);
      }
      formData.append("price", values.price);
      if (values.compareAtPrice) {
        formData.append("compareAtPrice", values.compareAtPrice);
      }
      if (values.sku) {
        formData.append("sku", values.sku);
      }
      formData.append("stock", values.stock.toString());
      if (values.categoryId) {
        formData.append("categoryId", values.categoryId);
      }
      formData.append("featured", values.featured.toString());
      formData.append("active", values.active.toString());
      values.images.forEach((url) => {
        formData.append("images", url);
      });

      if (product) {
        formData.append("id", product.id);
        formData.append("slug", product.slug);
        const result = await updateProductAction(formData);
        if (result.success) {
          router.push("/admin/products");
        } else {
          const errorMessage =
            (result.errors as { _general?: string[] })._general?.[0] ||
            Object.values(result.errors).flat()[0] ||
            "상품 수정에 실패했습니다.";
          setError(errorMessage);
        }
      } else {
        const result = await createProductAction(formData);
        if (result.success) {
          router.push("/admin/products");
        } else {
          const errorMessage =
            (result.errors as { _general?: string[] })._general?.[0] ||
            Object.values(result.errors).flat()[0] ||
            "상품 등록에 실패했습니다.";
          setError(errorMessage);
        }
      }
    });
  };

  const handleDelete = async () => {
    if (!product || !confirm("정말 이 상품을 삭제하시겠습니까?")) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", product.id);

      const result = await deleteProductAction(formData);
      if (result.success) {
        router.push("/admin/products");
      } else {
        const errorMessage =
          (result.errors as { _general?: string[] })._general?.[0] || "상품 삭제에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상품명 *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="상품명을 입력하세요" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상품 설명</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="상품 설명을 입력하세요"
                  rows={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가격 *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="compareAtPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>정가 (할인 전 가격)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상품 코드 (SKU)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="SKU" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>재고 *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    min="0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">카테고리 없음</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>이미지 URL *</FormLabel>
          {imageUrls.map((_, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={imageUrls[index]}
                onChange={(e) => {
                  const newUrls = [...imageUrls];
                  newUrls[index] = e.target.value;
                  setImageUrls(newUrls);
                  form.setValue("images", newUrls.filter((url) => url));
                }}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              {imageUrls.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newUrls = imageUrls.filter((_, i) => i !== index);
                    setImageUrls(newUrls);
                    form.setValue("images", newUrls.filter((url) => url));
                  }}
                >
                  삭제
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setImageUrls([...imageUrls, ""])}
          >
            이미지 추가
          </Button>
          {form.formState.errors.images && (
            <p className="text-sm text-destructive">
              {form.formState.errors.images.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">인기 상품</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">판매 중</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중..." : product ? "수정" : "등록"}
          </Button>
          {product && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              삭제
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

