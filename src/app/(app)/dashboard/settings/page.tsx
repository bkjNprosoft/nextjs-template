import { ThemePreference } from "@prisma/client";
import { redirect } from "next/navigation";

import { Button } from "@/shared/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { Input } from "@/shared/ui/atoms/input";
import { Label } from "@/shared/ui/atoms/label";
import { Separator } from "@/shared/ui/atoms/separator";
import { auth } from "@/shared/lib/auth";
import { updateUserPreferencesAction } from "@/entities/user/api/actions";
import { getUserPreferences } from "@/entities/user/api/data";

const THEME_OPTIONS = [
  { value: ThemePreference.SYSTEM, label: "시스템 기본값" },
  { value: ThemePreference.LIGHT, label: "라이트" },
  { value: ThemePreference.DARK, label: "다크" },
];

const DEFAULT_PREFERENCES = {
  theme: ThemePreference.SYSTEM,
  emailProductUpdates: true,
  emailSecurity: true,
  inAppAlerts: true,
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userPrefs = await getUserPreferences(session.user.id);
  const preferences = userPrefs
    ? {
        theme: userPrefs.theme,
        emailProductUpdates: userPrefs.emailNotifications ?? true,
        emailSecurity: userPrefs.emailNotifications ?? true,
        inAppAlerts: true,
      }
    : DEFAULT_PREFERENCES;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">환경설정</h1>
        <p className="text-sm text-muted-foreground">
          프로필, 테마, 알림 수신 옵션을 관리합니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>개인 설정</CardTitle>
            <CardDescription>
              사용자의 공개 정보와 알림 수신 방식을 업데이트하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData: FormData) => {
              "use server";
              await updateUserPreferencesAction(formData);
            }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">표시 이름</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={session.user.name ?? ""}
                  placeholder="팀에 표시될 이름"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">테마</Label>
                <select
                  id="theme"
                  name="theme"
                  defaultValue={preferences.theme}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {THEME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Separator />
              <div className="space-y-4">
                <p className="text-sm font-semibold">이메일 알림</p>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="emailProductUpdates"
                    defaultChecked={preferences.emailProductUpdates}
                    className="h-4 w-4"
                  />
                  제품 업데이트 및 릴리스 정보를 이메일로 받습니다.
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="emailSecurity"
                    defaultChecked={preferences.emailSecurity}
                    className="h-4 w-4"
                  />
                  보안·계정 관련 알림을 이메일로 받습니다.
                </label>
              </div>
              <Separator />
              <div className="space-y-4">
                <p className="text-sm font-semibold">앱 내 알림</p>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="inAppAlerts"
                    defaultChecked={preferences.inAppAlerts}
                    className="h-4 w-4"
                  />
                  프로젝트/댓글 업데이트를 알림 센터에서 받습니다.
                </label>
              </div>
              <Button type="submit" className="w-full">
                설정 저장
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>요약</CardTitle>
            <CardDescription>
              현재 적용된 설정 상태를 빠르게 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">테마</p>
              <p className="font-medium">{preferences.theme}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground">이메일 알림</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  제품 업데이트{" "}
                  {preferences.emailProductUpdates ? "수신" : "미수신"}
                </li>
                <li>
                  보안 알림 {preferences.emailSecurity ? "수신" : "미수신"}
                </li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground">앱 내 알림</p>
              <p className="font-medium">
                {preferences.inAppAlerts ? "활성화됨" : "비활성화됨"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

