"use client";

import { useState, useTransition } from "react";
import { Edit, Trash2 } from "lucide-react";

import { Badge } from "@/shared/ui/atoms/badge";
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
import { Separator } from "@/shared/ui/atoms/separator";
import {
  updateAddressAction,
  deleteAddressAction,
} from "@/entities/address/api/actions";
import type { Address } from "@prisma/client";

type AddressListProps = {
  addresses: Address[];
};

export function AddressList({ addresses }: AddressListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await updateAddressAction(formData);

      if (result.success) {
        setEditingId(null);
      } else {
        const errorMessage =
          (result.errors as { _general?: string[] })._general?.[0] ||
          Object.values(result.errors).flat()[0] ||
          "배송지 수정에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말 이 배송지를 삭제하시겠습니까?")) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", id);

      const result = await deleteAddressAction(formData);

      if (!result.success) {
        const errorMessage =
          (result.errors as { _general?: string[] })._general?.[0] ||
          "배송지 삭제에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  if (addresses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">등록된 배송지가 없습니다.</p>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {addresses.map((address) => (
        <div key={address.id} className="space-y-2">
          <div className="flex items-start justify-between rounded-lg border p-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{address.name}</p>
                {address.isDefault && <Badge variant="secondary">기본</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{address.phone}</p>
              <p className="text-sm">
                {address.addressLine1}
                {address.addressLine2 && (
                  <>
                    <br />
                    {address.addressLine2}
                  </>
                )}
                <br />
                {address.city} {address.state} {address.postalCode}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog
                open={editingId === address.id}
                onOpenChange={(open) => setEditingId(open ? address.id : null)}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <form action={handleUpdate}>
                    <input type="hidden" name="id" value={address.id} />
                    <DialogHeader>
                      <DialogTitle>배송지 수정</DialogTitle>
                      <DialogDescription>
                        배송지 정보를 수정하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-name-${address.id}`}>
                          수령인 이름 *
                        </Label>
                        <Input
                          id={`edit-name-${address.id}`}
                          name="name"
                          defaultValue={address.name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-phone-${address.id}`}>
                          전화번호 *
                        </Label>
                        <Input
                          id={`edit-phone-${address.id}`}
                          name="phone"
                          type="tel"
                          defaultValue={address.phone}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-addressLine1-${address.id}`}>
                          주소 *
                        </Label>
                        <Input
                          id={`edit-addressLine1-${address.id}`}
                          name="addressLine1"
                          defaultValue={address.addressLine1}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-addressLine2-${address.id}`}>
                          상세 주소
                        </Label>
                        <Input
                          id={`edit-addressLine2-${address.id}`}
                          name="addressLine2"
                          defaultValue={address.addressLine2 ?? ""}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-city-${address.id}`}>
                            시/도 *
                          </Label>
                          <Input
                            id={`edit-city-${address.id}`}
                            name="city"
                            defaultValue={address.city}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`edit-state-${address.id}`}>
                            구/군
                          </Label>
                          <Input
                            id={`edit-state-${address.id}`}
                            name="state"
                            defaultValue={address.state ?? ""}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-postalCode-${address.id}`}>
                          우편번호 *
                        </Label>
                        <Input
                          id={`edit-postalCode-${address.id}`}
                          name="postalCode"
                          defaultValue={address.postalCode}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-country-${address.id}`}>
                          국가
                        </Label>
                        <Input
                          id={`edit-country-${address.id}`}
                          name="country"
                          defaultValue={address.country}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-isDefault-${address.id}`}
                          name="isDefault"
                          value="true"
                          defaultChecked={address.isDefault}
                        />
                        <Label
                          htmlFor={`edit-isDefault-${address.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          기본 배송지로 설정
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        취소
                      </Button>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? "수정 중..." : "수정"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  void handleDelete(address.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator />
        </div>
      ))}
    </div>
  );
}
