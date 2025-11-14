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
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/server/actions/categories";
import type { Category } from "@prisma/client";

const categorySchema = z.object({
  name: z.string().min(1, "카테고리명을 입력하세요").max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  image: z.string().url().optional(),
});

type CategoryFormProps = {
  category?: Category;
  categories: Category[];
};

export function CategoryForm({ category, categories }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      parentId: category?.parentId ?? "",
      image: category?.image ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.description) {
        formData.append("description", values.description);
      }
      if (values.parentId) {
        formData.append("parentId", values.parentId);
      }
      if (values.image) {
        formData.append("image", values.image);
      }

      if (category) {
        formData.append("id", category.id);
        const result = await updateCategoryAction(formData);
        if (result.success) {
          router.push("/admin/categories");
        } else {
          const errorMessage =
            result.errors._general?.[0] ||
            Object.values(result.errors).flat()[0] ||
            "카테고리 수정에 실패했습니다.";
          setError(errorMessage);
        }
      } else {
        const result = await createCategoryAction(formData);
        if (result.success) {
          router.push("/admin/categories");
        } else {
          const errorMessage =
            result.errors._general?.[0] ||
            Object.values(result.errors).flat()[0] ||
            "카테고리 추가에 실패했습니다.";
          setError(errorMessage);
        }
      }
    });
  };

  const handleDelete = async () => {
    if (!category || !confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", category.id);

      const result = await deleteCategoryAction(formData);
      if (result.success) {
        router.push("/admin/categories");
      } else {
        const errorMessage =
          result.errors._general?.[0] || "카테고리 삭제에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  const availableParents = categories.filter(
    (c) => !category || c.id !== category.id,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리명 *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="카테고리명을 입력하세요" />
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
                  placeholder="카테고리 설명을 입력하세요"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상위 카테고리</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="상위 카테고리를 선택하세요 (선택)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">없음 (최상위 카테고리)</SelectItem>
                  {availableParents.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이미지 URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중..." : category ? "수정" : "추가"}
          </Button>
          {category && (
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

