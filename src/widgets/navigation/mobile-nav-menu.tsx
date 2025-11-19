"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/shared/ui/molecules/sheet";
import { SearchAutocomplete } from "@/widgets/search/search-autocomplete";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type MobileNavMenuProps = {
  categories: Category[];
};

export function MobileNavMenu({ categories }: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">메뉴</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="[&>button]:hidden">
        <SheetTitle className="sr-only">메뉴</SheetTitle>
        <nav className="space-y-4">
          <div className="flex justify-end">
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">닫기</span>
              </Button>
            </SheetClose>
          </div>
          <div className="pb-4">
            <SearchAutocomplete onSearch={handleSearch} />
          </div>
          <SheetClose asChild>
            <Link
              href="/products"
              className="block text-lg font-medium transition-colors hover:text-primary"
            >
              상품
            </Link>
          </SheetClose>
          {categories.map((category) => (
            <SheetClose key={category.id} asChild>
              <Link
                href={`/categories/${category.slug}`}
                className="block text-lg font-medium transition-colors hover:text-primary"
              >
                {category.name}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

