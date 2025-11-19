import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { CategoryForm } from "@/entities/category/ui/category-form";
import { getCategories } from "@/entities/category/api/data";
import { prisma } from "@/shared/lib/prisma";

type EditCategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { categoryId } = await params;
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId },
    }),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">카테고리 수정</h1>
        <p className="text-muted-foreground">
          카테고리 정보를 수정하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>카테고리 정보</CardTitle>
          <CardDescription>
            카테고리의 기본 정보를 수정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}

