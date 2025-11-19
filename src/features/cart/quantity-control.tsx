"use client";

import { useState, useTransition } from "react";
import { Plus, Minus } from "lucide-react";

import { Button } from "@/shared/ui/atoms/button";
import { updateCartItemAction } from "@/entities/cart/api/actions";
import { cn } from "@/shared/lib/utils";

type QuantityControlProps = {
  cartItemId: string;
  currentQuantity: number;
  maxQuantity: number;
  className?: string;
};

export function QuantityControl({
  cartItemId,
  currentQuantity,
  maxQuantity,
  className,
}: QuantityControlProps) {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [isPending, startTransition] = useTransition();

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxQuantity) return;

    setQuantity(newQuantity);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("cartItemId", cartItemId);
      formData.append("quantity", newQuantity.toString());
      await updateCartItemAction(formData);
    });
  };

  const increment = () => {
    updateQuantity(quantity + 1);
  };

  const decrement = () => {
    updateQuantity(quantity - 1);
  };

  return (
    <div className={cn("flex items-center border-2 border-primary/20 rounded-lg", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-r-none"
        onClick={decrement}
        disabled={quantity <= 1 || isPending}
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
          updateQuantity(Math.min(Math.max(1, val), maxQuantity));
        }}
        className="w-16 text-center text-sm font-medium focus:outline-none bg-transparent"
        disabled={isPending}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-l-none"
        onClick={increment}
        disabled={quantity >= maxQuantity || isPending}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

