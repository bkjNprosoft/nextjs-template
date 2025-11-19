"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/shared/ui/atoms/input";
import { Button } from "@/shared/ui/atoms/button";
import { cn } from "@/shared/lib/utils";

type SearchAutocompleteProps = {
  className?: string;
  onSearch?: (query: string) => void;
};

export function SearchAutocomplete({
  className,
  onSearch,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    // 로컬 스토리지에서 검색 히스토리 불러오기
    if (typeof window === "undefined") return [];
    const history = localStorage.getItem("searchHistory");
    if (history) {
      try {
        return JSON.parse(history) as string[];
      } catch {
        return [];
      }
    }
    return [];
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 외부 클릭 감지
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // 검색 히스토리에 추가
    const newHistory = [
      searchQuery,
      ...searchHistory.filter((h) => h !== searchQuery),
    ].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    setShowSuggestions(false);
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="상품명, 브랜드, 키워드 검색"
          className="h-12 w-full rounded-lg border-2 border-primary/20 pr-12 text-base focus:border-primary focus:ring-0"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-1 top-1 h-10 w-10 rounded-md bg-primary hover:bg-primary/90"
        >
          <Search className="h-5 w-5 text-white" />
          <span className="sr-only">검색</span>
        </Button>
      </form>

      {showSuggestions && (query || searchHistory.length > 0) && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-white shadow-lg">
          {query && (
            <div className="border-b p-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSearch(query)}
              >
                <Search className="mr-2 h-4 w-4" />
                &quot;{query}&quot; 검색
              </Button>
            </div>
          )}

          {searchHistory.length > 0 && (
            <div className="p-2">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  최근 검색어
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-6 px-2 text-xs"
                >
                  전체 삭제
                </Button>
              </div>
              <div className="space-y-1">
                {searchHistory
                  .filter((h) => !query || h.includes(query))
                  .slice(0, 5)
                  .map((historyItem, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => {
                        setQuery(historyItem);
                        handleSearch(historyItem);
                      }}
                    >
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      {historyItem}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

