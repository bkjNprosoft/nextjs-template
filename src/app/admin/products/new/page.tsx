
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/server/data/categories";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">상품 등록</h1>
        <p className="text-muted-foreground">
          새로운 상품을 등록하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상품 정보</CardTitle>
          <CardDescription>
            상품의 기본 정보를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}

