"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/molecules/dialog";
import { Input } from "@/shared/ui/atoms/input";
import { Label } from "@/shared/ui/atoms/label";
import { Textarea } from "@/shared/ui/atoms/textarea";
import { createReviewAction } from "@/entities/review/api/actions";

type ReviewFormProps = {
  productId: string;
};

export function ReviewForm({ productId }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      formData.append("productId", productId);
      formData.append("rating", rating.toString());

      const result = await createReviewAction(formData);

      if (result.success) {
        setOpen(false);
        setRating(5);
      } else {
        const errors = result.errors as { _general?: string[]; rating?: string[] };
        const errorMessage =
          errors._general?.[0] ||
          errors.rating?.[0] ||
          "리뷰 작성에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>리뷰 작성</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={(formData) => { handleSubmit(formData); }}>
          <DialogHeader>
            <DialogTitle>리뷰 작성</DialogTitle>
            <DialogDescription>
              상품에 대한 솔직한 리뷰를 남겨주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>평점</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} / 5
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">제목 (선택)</Label>
              <Input id="title" name="title" placeholder="리뷰 제목" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">내용 (선택)</Label>
              <Textarea
                id="comment"
                name="comment"
                placeholder="리뷰 내용을 입력하세요..."
                rows={4}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "작성 중..." : "작성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

