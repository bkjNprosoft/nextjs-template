"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/molecules/select";
import { updateOrderStatusAction } from "@/entities/order/api/actions";
import type { OrderStatus } from "@prisma/client";

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "대기 중",
  CONFIRMED: "확인됨",
  PROCESSING: "처리 중",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "취소됨",
  REFUNDED: "환불됨",
};

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusForm({
  orderId,
  currentStatus,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("status", status);

      const result = await updateOrderStatusAction(formData);

      if (result.success) {
        router.refresh();
      } else {
        const errorMessage =
          (result.errors as { _general?: string[] })._general?.[0] ||
          "주문 상태 업데이트에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
      <Select
        value={status}
        onValueChange={(value) => setStatus(value as OrderStatus)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "변경 중..." : "상태 변경"}
      </Button>
    </form>
  );
}

