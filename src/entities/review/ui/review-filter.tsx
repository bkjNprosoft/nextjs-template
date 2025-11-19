"use client";

import { Button } from "@/shared/ui/atoms/button";
import { cn } from "@/shared/lib/utils";

type ReviewFilterProps = {
  onFilterChange: (filter: "all" | number) => void;
  currentFilter: "all" | number;
  ratingCounts: Record<number, number>;
};

export function ReviewFilter({
  onFilterChange,
  currentFilter,
  ratingCounts,
}: ReviewFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={currentFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        className={cn(
          currentFilter === "all" && "bg-primary text-white"
        )}
      >
        전체 ({Object.values(ratingCounts).reduce((a, b) => a + b, 0)})
      </Button>
      {[5, 4, 3, 2, 1].map((rating) => (
        <Button
          key={rating}
          variant={currentFilter === rating ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(rating)}
          className={cn(
            currentFilter === rating && "bg-primary text-white"
          )}
        >
          {rating}점 ({ratingCounts[rating] || 0})
        </Button>
      ))}
    </div>
  );
}

