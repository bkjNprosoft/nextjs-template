import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { SettingsForm } from "@/features/settings";
import { auth } from "@/shared/lib/auth";
import { getUserPreferences } from "@/entities/user/api/data";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const preferences = await getUserPreferences(session.user.id);

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">설정</h1>
        <p className="text-muted-foreground">
          계정 설정 및 환경설정을 관리하세요
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl">환경설정</CardTitle>
          <CardDescription>
            테마 및 알림 설정을 변경할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <SettingsForm preferences={preferences} />
        </CardContent>
      </Card>
    </div>
  );
}

