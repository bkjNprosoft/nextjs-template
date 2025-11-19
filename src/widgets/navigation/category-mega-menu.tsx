"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronsRight } from "lucide-react";
import type { Category } from "@prisma/client";

type CategoryWithChildren = Category & {
  children: Category[];
  _count: {
    products: number;
  };
};

type CategoryMegaMenuProps = {
  categories: CategoryWithChildren[];
};

export function CategoryMegaMenu({ categories }: CategoryMegaMenuProps) {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hoveredCategory = categories.find(
    (cat) => cat.id === hoveredCategoryId,
  );

  useEffect(() => {
    // 외부 클릭 감지
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredCategoryId(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div 
      ref={containerRef}
      className="hidden border-b bg-green-600 md:block relative"
    >
      <div className="container">
        <nav className="flex items-center gap-1 overflow-x-auto px-4">
          {/* 전체 카테고리 버튼 */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium text-white transition-colors cursor-pointer ${
                isOpen ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              <ChevronsRight className="h-4 w-4" />
              전체 카테고리
            </button>
          </div>

          {/* 베스트, 핫딜 링크 */}
          <Link
            href="/products?orderBy=popular"
            className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            베스트
          </Link>
          <Link
            href="/products?onSale=true"
            className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            핫딜
          </Link>
        </nav>

        {/* 메가메뉴 드롭다운 - nav 밖으로 분리 */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 bg-white shadow-lg">
            <div className="container">
              <div className="flex w-full">
                {/* 왼쪽: 메인 카테고리 목록 */}
                <div className="w-64 border-r bg-gray-50">
                  <div className="p-4">
                    <Link
                      href="/products"
                      onClick={() => {
                        setIsOpen(false);
                        setHoveredCategoryId(null);
                      }}
                      className="block rounded-lg px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-white hover:text-primary"
                    >
                      전체상품
                    </Link>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto pb-12">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        onMouseEnter={() => setHoveredCategoryId(category.id)}
                        onClick={() => {
                          setIsOpen(false);
                          setHoveredCategoryId(null);
                        }}
                        className={`block border-b px-4 py-3 text-sm transition-colors ${
                          hoveredCategoryId === category.id
                            ? "bg-white text-primary font-semibold"
                            : "text-gray-700 hover:bg-white hover:text-primary"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          {category._count.products > 0 && (
                            <span className="text-xs text-gray-500">
                              {category._count.products}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 오른쪽: 서브카테고리 그리드 */}
                {hoveredCategory && hoveredCategory.children.length > 0 && (
                  <div className="flex-1 p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      {hoveredCategory.name}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {hoveredCategory.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/categories/${child.slug}`}
                          onClick={() => {
                            setIsOpen(false);
                            setHoveredCategoryId(null);
                          }}
                          className="group rounded-lg p-3 text-sm transition-colors hover:bg-gray-50"
                        >
                          <div className="font-medium text-gray-900 group-hover:text-primary">
                            {child.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 서브카테고리가 없는 경우 */}
                {hoveredCategory && hoveredCategory.children.length === 0 && (
                  <div className="flex flex-1 items-center justify-center p-6">
                    <p className="text-sm text-gray-500">
                      하위 카테고리가 없습니다
                    </p>
                  </div>
                )}

                {/* 아무 카테고리도 호버되지 않은 경우 */}
                {!hoveredCategory && (
                  <div className="flex flex-1 items-center justify-center p-6">
                    <p className="text-sm text-gray-500">
                      카테고리를 선택하세요
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
