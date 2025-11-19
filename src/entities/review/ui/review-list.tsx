"use client";

import { useState, useMemo } from "react";
import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/atoms/avatar";
import { Separator } from "@/shared/ui/atoms/separator";
import { ReviewFilter } from "@/entities/review/ui/review-filter";
import type { Review } from "@prisma/client";

type ReviewListProps = {
  reviews: (Review & {
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  })[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  const [filter, setFilter] = useState<"all" | number>("all");

  // 평점별 리뷰 수 계산
  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      counts[review.rating] = (counts[review.rating] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // 필터링된 리뷰
  const filteredReviews = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((review) => review.rating === filter);
  }, [reviews, filter]);

  // 최신순 정렬
  const sortedReviews = useMemo(() => {
    return [...filteredReviews].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [filteredReviews]);

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">아직 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.length > 0 && (
        <ReviewFilter
          onFilterChange={setFilter}
          currentFilter={filter}
          ratingCounts={ratingCounts}
        />
      )}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="space-y-2">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.user.image ?? undefined} />
                <AvatarFallback>
                  {review.user.name?.slice(0, 2).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {review.user.name ?? "익명"}
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="font-medium">{review.title}</p>
                )}
                {review.comment && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {review.comment}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {review.createdAt.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Separator />
          </div>
        ))}
      </div>
      {sortedReviews.length === 0 && filter !== "all" && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {filter}점 리뷰가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}

