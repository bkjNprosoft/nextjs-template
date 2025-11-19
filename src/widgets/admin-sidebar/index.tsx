"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Star,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";

const navigation = [
  {
    name: "대시보드",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "상품 관리",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "주문 관리",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "카테고리 관리",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    name: "리뷰 관리",
    href: "/admin/reviews",
    icon: Star,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 p-4 text-sm font-medium">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === item.href && "bg-muted text-primary",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

