import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/atoms/avatar";
import { Separator } from "@/shared/ui/atoms/separator";
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
  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">아직 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
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
                <p className="text-sm text-muted-foreground">
                  {review.comment}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {review.createdAt.toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
          <Separator />
        </div>
      ))}
    </div>
  );
}

