"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/shared/ui/atoms/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/molecules/form";
import { Input } from "@/shared/ui/atoms/input";
import { Textarea } from "@/shared/ui/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/molecules/select";
import { Checkbox } from "@/shared/ui/atoms/checkbox";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/entities/product/api/actions";
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
  product?: Product;
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

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    form.setValue("images", newUrls.filter((url) => url.length > 0));
  };

  const onSubmit = (values: z.infer<typeof productSchema>) => {
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
      values.images.forEach((image) => {
        formData.append("images", image);
      });

      if (product) {
        formData.append("id", product.id);
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
            "상품 추가에 실패했습니다.";
          setError(errorMessage);
        }
      }
    });
  };

  const handleDelete = () => {
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
          (result.errors as { _general?: string[] })._general?.[0] ||
          "상품 삭제에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(onSubmit)(e); }} className="space-y-6">
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
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="상품 설명을 입력하세요"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가격 *</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
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
                <FormLabel>비교 가격</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상품 코드</FormLabel>
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
                    placeholder="0"
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
                    <SelectValue placeholder="카테고리를 선택하세요 (선택)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">없음</SelectItem>
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
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => updateImageUrl(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              {imageUrls.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeImageUrl(index)}
                >
                  삭제
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addImageUrl}>
            이미지 추가
          </Button>
        </div>

        <div className="flex items-center space-x-6">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>인기 상품</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>활성화</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중..." : product ? "수정" : "추가"}
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

