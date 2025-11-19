import { redirect } from "next/navigation";

import { AddressForm } from "@/features/create-address";
import { AddressList } from "@/entities/address/ui/address-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { Separator } from "@/shared/ui/atoms/separator";
import { auth } from "@/shared/lib/auth";
import { getAddresses } from "@/entities/address/api/data";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const addresses = await getAddresses(session.user.id);

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">프로필</h1>
        <p className="text-muted-foreground">계정 정보와 배송지를 관리하세요</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl">내 정보</CardTitle>
            <CardDescription>계정 정보를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">이름</p>
              <p className="text-xl font-semibold">{session.user.name ?? "미설정"}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">이메일</p>
              <p className="text-xl font-semibold">{session.user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl">배송지 관리</CardTitle>
            <CardDescription>배송지를 추가하고 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <AddressForm />
            <Separator />
            <AddressList addresses={addresses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

