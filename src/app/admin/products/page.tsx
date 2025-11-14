import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { getProducts } from "@/server/data/products";

export default async function AdminProductsPage() {
  const { products } = await getProducts({ take: 50 });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">상품 관리</h1>
          <p className="text-muted-foreground">
            상품을 등록, 수정, 삭제할 수 있습니다
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            상품 등록
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상품 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/products/new">첫 상품 등록하기</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="font-semibold hover:underline"
                        >
                          {product.name}
                        </Link>
                        {!product.active && (
                          <Badge variant="secondary">비활성</Badge>
                        )}
                        {product.featured && (
                          <Badge variant="default">인기</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.category?.name ?? "카테고리 없음"} · 재고:{" "}
                        {product.stock}개
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {Number(product.price).toLocaleString()}원
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        수정
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

