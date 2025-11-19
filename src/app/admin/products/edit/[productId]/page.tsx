import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { ProductForm } from "@/entities/product/ui/product-form";
import { getProductById } from "@/entities/product/api/data";
import { getCategories } from "@/entities/category/api/data";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { productId } = await params;
  const [product, categories] = await Promise.all([
    getProductById(productId),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">상품 수정</h1>
        <p className="text-muted-foreground">
          상품 정보를 수정하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상품 정보</CardTitle>
          <CardDescription>
            상품의 기본 정보를 수정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}

