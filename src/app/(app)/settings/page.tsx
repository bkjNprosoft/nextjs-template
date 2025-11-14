import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";
import { auth } from "@/lib/auth";
import { getUserPreferences } from "@/server/data/notifications";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const preferences = await getUserPreferences(session.user.id);

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">
          계정 설정 및 환경설정을 관리하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>환경설정</CardTitle>
          <CardDescription>
            테마 및 알림 설정을 변경할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm preferences={preferences} />
        </CardContent>
      </Card>
    </div>
  );
}

