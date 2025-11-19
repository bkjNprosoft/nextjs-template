"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingCart } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import { addToCartAction } from "@/features/add-to-cart/api";
import { cn } from "@/shared/lib/utils";

type QuickAddToCartProps = {
  productId: string;
  maxQuantity?: number;
  disabled?: boolean;
  className?: string;
};

export function QuickAddToCart({
  productId,
  maxQuantity = 99,
  disabled = false,
  className,
}: QuickAddToCartProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = () => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("quantity", quantity.toString());

      const result = await addToCartAction(formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        const errors = result.errors as { _general?: string[]; productId?: string[]; _auth?: string[] };
        
        // 인증 에러인 경우 로그인 페이지로 리다이렉트
        if (errors._auth && errors._auth.length > 0) {
          router.push("/sign-in");
          return;
        }
        
        const errorMessage =
          errors._general?.[0] ||
          errors.productId?.[0] ||
          "장바구니 추가에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  const increment = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="flex items-center border-2 border-primary/20 rounded-lg">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={decrement}
            disabled={quantity <= 1 || disabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <input
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setQuantity(Math.min(Math.max(1, val), maxQuantity));
            }}
            className="w-16 text-center text-sm font-medium focus:outline-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={increment}
            disabled={quantity >= maxQuantity || disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={disabled || isPending}
          className={cn(
            "flex-1 h-9 cursor-pointer",
            success && "bg-green-600 hover:bg-green-700"
          )}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isPending ? "추가 중..." : success ? "추가됨!" : "장바구니에 추가"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

