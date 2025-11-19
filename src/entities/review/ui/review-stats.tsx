"use client";

import { Star } from "lucide-react";
import { Progress } from "@/shared/ui/atoms/progress";
import { cn } from "@/shared/lib/utils";

type ReviewStatsProps = {
  reviews: Array<{ rating: number }>;
  averageRating: number;
  totalReviews: number;
};

export function ReviewStats({ reviews, averageRating, totalReviews }: ReviewStatsProps) {
  // 평점별 리뷰 수 계산
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: totalReviews > 0
      ? (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100
      : 0,
  }));

  return (
    <div className="space-y-6 rounded-lg border bg-muted/30 p-6">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            총 {totalReviews}개 리뷰
          </p>
        </div>
        <div className="flex-1 space-y-2">
          {ratingCounts.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium w-4">{rating}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {count}개
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

