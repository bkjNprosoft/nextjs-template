"use client";

import { useState, useTransition } from "react";

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
import { Checkbox } from "@/shared/ui/atoms/checkbox";
import { createAddressAction } from "@/entities/address/api/actions";

export function AddressForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createAddressAction(formData);

      if (result.success) {
        setOpen(false);
      } else {
        const errorMessage =
          (result.errors as { _general?: string[] })._general?.[0] ||
          Object.values(result.errors).flat()[0] ||
          "배송지 추가에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>배송지 추가</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>배송지 추가</DialogTitle>
            <DialogDescription>
              새로운 배송지 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">수령인 이름 *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호 *</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">주소 *</Label>
              <Input id="addressLine1" name="addressLine1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">상세 주소</Label>
              <Input id="addressLine2" name="addressLine2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">시/도 *</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">구/군</Label>
                <Input id="state" name="state" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">우편번호 *</Label>
              <Input id="postalCode" name="postalCode" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">국가</Label>
              <Input
                id="country"
                name="country"
                defaultValue="KR"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isDefault" name="isDefault" value="true" />
              <Label
                htmlFor="isDefault"
                className="text-sm font-normal cursor-pointer"
              >
                기본 배송지로 설정
              </Label>
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
              {isPending ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

