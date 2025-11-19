"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { Button } from "@/shared/ui/atoms/button";
import {
  getRecentProducts,
  clearRecentProducts,
  type RecentProduct,
} from "@/shared/lib/recent-products";

export function RecentProducts() {
  const [products, setProducts] = useState<RecentProduct[]>(() => getRecentProducts());

  if (products.length === 0) {
    return null;
  }

  const handleClear = () => {
    clearRecentProducts();
    setProducts([]);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            최근 본 상품
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            전체 삭제
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {products.slice(0, 5).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.sku || product.id}`}
              className="group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all hover:border-primary hover:shadow-md"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-semibold text-white line-clamp-2">
                    {product.name}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {product.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

