import { redirect } from "next/navigation";

import { AddressForm } from "@/components/addresses/address-form";
import { AddressList } from "@/components/addresses/address-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { getAddresses } from "@/server/data/addresses";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const addresses = await getAddresses(session.user.id);

  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold">프로필</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>내 정보</CardTitle>
            <CardDescription>계정 정보를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">이름</p>
              <p className="text-lg">{session.user.name ?? "미설정"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">이메일</p>
              <p className="text-lg">{session.user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>배송지 관리</CardTitle>
            <CardDescription>배송지를 추가하고 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddressForm />
            <Separator />
            <AddressList addresses={addresses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

