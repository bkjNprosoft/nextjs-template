"use client";

const RECENT_PRODUCTS_KEY = "recent_products";
const MAX_RECENT_PRODUCTS = 10;

export type RecentProduct = {
  id: string;
  name: string;
  sku: string | null;
  image: string;
  price: number;
  viewedAt: number;
};

export function addToRecentProducts(product: {
  id: string;
  name: string;
  sku: string | null;
  images: string[];
  price: number | string;
}) {
  if (typeof window === "undefined") return;

  try {
    const recent = getRecentProducts();
    const newProduct: RecentProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      image: product.images[0] || "/placeholder-product.jpg",
      price: Number(product.price),
      viewedAt: Date.now(),
    };

    // 기존 항목 제거하고 맨 앞에 추가
    const filtered = recent.filter((p) => p.id !== product.id);
    const updated = [newProduct, ...filtered].slice(0, MAX_RECENT_PRODUCTS);

    localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save recent products:", error);
  }
}

export function getRecentProducts(): RecentProduct[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(RECENT_PRODUCTS_KEY);
    if (!data) return [];

    const products = JSON.parse(data) as RecentProduct[];
    // 30일 이전 항목 제거
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return products.filter((p) => p.viewedAt > thirtyDaysAgo);
  } catch (error) {
    console.error("Failed to get recent products:", error);
    return [];
  }
}

export function clearRecentProducts() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_PRODUCTS_KEY);
}

