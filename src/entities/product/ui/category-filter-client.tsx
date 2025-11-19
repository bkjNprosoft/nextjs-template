"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { Checkbox } from "@/shared/ui/atoms/checkbox";
import { Label } from "@/shared/ui/atoms/label";
import { Input } from "@/shared/ui/atoms/input";
import { Button } from "@/shared/ui/atoms/button";
import { Separator } from "@/shared/ui/atoms/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/molecules/select";
import { X } from "lucide-react";

export function CategoryFilterClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentOrderBy = searchParams.get("orderBy") || "created_desc";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock") === "true";
  const onSale = searchParams.get("onSale") === "true";

  const [localMinPrice, setLocalMinPrice] = useState(minPrice || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || "");

  const updateParams = (updates: Record<string, string | null>) => {
    // 현재 스크롤 위치 저장
    const currentScrollY = window.scrollY;
    sessionStorage.setItem(`scroll-${pathname}`, String(currentScrollY));

    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.delete("page"); // 필터 변경 시 첫 페이지로

    // 현재 pathname을 항상 유지 (카테고리 페이지에서 벗어나지 않음)
    // replace를 사용하여 히스토리 스택을 쌓지 않음
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleOrderByChange = (orderBy: string) => {
    updateParams({ orderBy });
  };

  const handlePriceFilter = () => {
    updateParams({
      minPrice: localMinPrice || null,
      maxPrice: localMaxPrice || null,
    });
  };

  const handleInStockChange = (checked: boolean) => {
    updateParams({ inStock: checked ? "true" : null });
  };

  const handleOnSaleChange = (checked: boolean) => {
    updateParams({ onSale: checked ? "true" : null });
  };

  const clearFilters = () => {
    // 현재 스크롤 위치 저장
    const currentScrollY = window.scrollY;
    sessionStorage.setItem(`scroll-${pathname}`, String(currentScrollY));
    
    const params = new URLSearchParams();
    const orderBy = searchParams.get("orderBy");
    if (orderBy) params.set("orderBy", orderBy);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setLocalMinPrice("");
    setLocalMaxPrice("");
  };

  const hasActiveFilters = minPrice || maxPrice || inStock || onSale;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">필터</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              초기화
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <Label className="text-sm font-semibold">가격 범위</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="최소"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="h-9"
              />
              <Input
                type="number"
                placeholder="최대"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="h-9"
              />
            </div>
            <Button
              onClick={handlePriceFilter}
              size="sm"
              variant="outline"
              className="w-full h-9"
            >
              적용
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-sm font-semibold">옵션</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={inStock}
                onCheckedChange={handleInStockChange}
              />
              <Label
                htmlFor="inStock"
                className="text-sm font-normal cursor-pointer"
              >
                재고 있음
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="onSale"
                checked={onSale}
                onCheckedChange={handleOnSaleChange}
              />
              <Label
                htmlFor="onSale"
                className="text-sm font-normal cursor-pointer"
              >
                할인 상품
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-sm font-semibold">정렬</Label>
          <Select value={currentOrderBy} onValueChange={handleOrderByChange}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">최신순</SelectItem>
              <SelectItem value="popular">인기순</SelectItem>
              <SelectItem value="rating">평점순</SelectItem>
              <SelectItem value="reviews">리뷰 많은순</SelectItem>
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

