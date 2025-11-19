"use client";

import { useEffect } from "react";
import { addToRecentProducts } from "@/shared/lib/recent-products";

type TrackProductViewProps = {
  product: {
    id: string;
    name: string;
    sku: string | null;
    images: string[];
    price: number;
  };
};

export function TrackProductView({ product }: TrackProductViewProps) {
  useEffect(() => {
    addToRecentProducts({
      id: product.id,
      name: product.name,
      sku: product.sku,
      images: product.images,
      price: product.price,
    });
  }, [product]);

  return null;
}

