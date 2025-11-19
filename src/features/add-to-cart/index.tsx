"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import { addToCartAction } from "@/features/add-to-cart/api";
import { cn } from "@/shared/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
};

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  className,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("quantity", quantity.toString());

      const result = await addToCartAction(formData);

      if (!result.success) {
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

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isPending}
        className={cn("w-full cursor-pointer", className)}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isPending ? "추가 중..." : "장바구니에 추가"}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
