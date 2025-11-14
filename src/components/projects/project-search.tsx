"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SearchResult = {
  id: string;
  title: string;
  status: string;
  priority: string;
  tags: { value: string }[];
};

type ProjectSearchProps = {
  workspaceSlug: string;
};

export function ProjectSearch({ workspaceSlug }: ProjectSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      startTransition(() => setResults([]));
      return;
    }

    const controller = new AbortController();

    async function runSearch() {
      try {
        const response = await fetch(
          `/api/workspaces/${encodeURIComponent(
            workspaceSlug,
          )}/projects/search?query=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Failed to search projects");
        }
        const data = (await response.json()) as { projects?: SearchResult[] };
        startTransition(() => {
          setResults(data.projects ?? []);
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error(error);
      }
    }

    void runSearch();

    return () => controller.abort();
  }, [query, workspaceSlug]);

  const helperText = useMemo(() => {
    if (!query.trim()) {
      return "프로젝트, 태그, 설명으로 검색하세요.";
    }
    if (isPending) {
      return "검색 중...";
    }
    if (results.length === 0) {
      return "일치하는 결과가 없습니다.";
    }
    return `${results.length}개의 결과`;
  }, [isPending, query, results.length]);

  return (
    <Card className="border-muted-foreground/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">프로젝트 검색</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ex) onboarding, billing, critical"
        />
        <p className="text-xs text-muted-foreground">{helperText}</p>
        {results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((result) => (
              <li
                key={result.id}
                className="rounded-md border border-muted-foreground/20 p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{result.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {result.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  우선순위 {result.priority}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {result.tags.map((tag) => (
                    <Badge key={`${result.id}-${tag.value}`} variant="secondary">
                      #{tag.value}
                    </Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

