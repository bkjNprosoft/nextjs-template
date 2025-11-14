"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@prisma/client";

type ProductFilterClientProps = {
  categories: (Category & {
    _count: {
      products: number;
    };
  })[];
};

export function ProductFilterClient({ categories }: ProductFilterClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentOrderBy = searchParams.get("orderBy") || "created_desc";

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    // 현재 경로가 /categories/[slug]인지 확인
    if (pathname.startsWith("/categories/")) {
      // 카테고리 페이지에서는 products로 리다이렉트
      router.push(`/products?${params.toString()}`);
    } else {
      router.push(`/products?${params.toString()}`);
    }
  };

  const handleOrderByChange = (orderBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderBy", orderBy);
    // 현재 경로 유지
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>필터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>카테고리</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category-all"
                checked={!currentCategory}
                onCheckedChange={() => handleCategoryChange("")}
              />
              <Label
                htmlFor="category-all"
                className="text-sm font-normal cursor-pointer"
              >
                전체
              </Label>
            </div>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={currentCategory === category.id}
                  onCheckedChange={() => handleCategoryChange(category.id)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.name} ({category._count.products})
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Label>정렬</Label>
          <Select value={currentOrderBy} onValueChange={handleOrderByChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">최신순</SelectItem>
              <SelectItem value="price_asc">가격 낮은순</SelectItem>
              <SelectItem value="price_desc">가격 높은순</SelectItem>
              <SelectItem value="name_asc">이름순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

