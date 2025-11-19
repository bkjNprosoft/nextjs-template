import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/shared/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/molecules/card";
import { Input } from "@/shared/ui/atoms/input";
import { Label } from "@/shared/ui/atoms/label";
import { auth } from "@/shared/lib/auth";
import { validatePasswordResetToken } from "@/shared/lib/password-reset";

import { resetPassword } from "../actions";

type ResetPasswordPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const record = await validatePasswordResetToken(token);

  if (!record) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "유효하지 않은 링크이거나 만료되었습니다. 다시 요청해 주세요.",
      )}`,
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">새 비밀번호 설정</CardTitle>
          <CardDescription>
            새로운 비밀번호를 입력하면 즉시 변경됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={resetPassword.bind(null, token)} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="password">새 비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호 (영문+숫자 8자 이상)"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              비밀번호 변경하기
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            문제가 계속되면{" "}
            <Link
              href="/forgot-password"
              className="text-primary underline-offset-4 hover:underline"
            >
              재설정 메일을 다시 보내기
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

