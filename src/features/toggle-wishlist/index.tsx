"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import { addToWishlistAction, removeFromWishlistAction } from "@/entities/wishlist/api/actions";
import { cn } from "@/shared/lib/utils";

type ToggleWishlistProps = {
  productId: string;
  isInWishlist: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function ToggleWishlist({
  productId,
  isInWishlist: initialIsInWishlist,
  className,
  size = "md",
}: ToggleWishlistProps) {
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("productId", productId);

      const result = isInWishlist
        ? await removeFromWishlistAction(formData)
        : await addToWishlistAction(formData);

      if (result.success) {
        setIsInWishlist(!isInWishlist);
      }
    });
  };

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "transition-colors",
        isInWishlist && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart
        className={cn(
          iconSize,
          isInWishlist && "fill-current"
        )}
      />
      <span className="sr-only">
        {isInWishlist ? "위시리스트에서 제거" : "위시리스트에 추가"}
      </span>
    </Button>
  );
}

