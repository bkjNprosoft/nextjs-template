import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { CategoryForm } from "@/entities/category/ui/category-form";
import { getCategories } from "@/entities/category/api/data";

export default async function NewCategoryPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">카테고리 추가</h1>
        <p className="text-muted-foreground">
          새로운 카테고리를 추가하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>카테고리 정보</CardTitle>
          <CardDescription>
            카테고리의 기본 정보를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}

