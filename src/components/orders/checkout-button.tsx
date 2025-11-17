"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createOrderAction } from "@/server/actions/orders";
import type { Address } from "@prisma/client";

type CheckoutButtonProps = {
  defaultAddress: Address | null;
  addresses: Address[];
  totalAmount: number;
};

export function CheckoutButton({
  defaultAddress,
  addresses,
  totalAmount,
}: CheckoutButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction(formData);

      if (result.success && result.orderId) {
        router.push(`/orders/${result.orderId}`);
      } else {
        const errors = result.errors as { _general?: string[]; shippingAddressId?: string[] };
        const errorMessage =
          errors._general?.[0] ||
          errors.shippingAddressId?.[0] ||
          "주문 생성에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          주문하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={handleCheckout}>
          <DialogHeader>
            <DialogTitle>주문하기</DialogTitle>
            <DialogDescription>
              배송지와 주문 메모를 확인해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shippingAddressId">배송지</Label>
              <Select
                name="shippingAddressId"
                defaultValue={defaultAddress?.id}
                required
              >
                <SelectTrigger id="shippingAddressId">
                  <SelectValue placeholder="배송지를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.length === 0 ? (
                    <SelectItem value="new" disabled>
                      등록된 배송지가 없습니다
                    </SelectItem>
                  ) : (
                    addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.name} - {address.addressLine1}
                        {address.isDefault && " (기본)"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                className="w-full"
              >
                <a href="/profile">배송지 관리</a>
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">주문 메모 (선택)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="배송 시 요청사항을 입력하세요..."
                rows={3}
              />
            </div>
            <div className="rounded-lg border bg-muted p-4">
              <div className="flex justify-between font-semibold">
                <span>총 결제금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
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
              {isPending ? "주문 중..." : "주문하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

