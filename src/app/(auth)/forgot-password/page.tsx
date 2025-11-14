import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";

import { requestPasswordReset } from "./actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;

  const errorParam = resolvedSearchParams?.error;
  const messageParam = resolvedSearchParams?.message;

  const errorMessage =
    typeof errorParam === "string" ? errorParam : undefined;
  const infoMessage =
    typeof messageParam === "string" ? messageParam : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">비밀번호 재설정</CardTitle>
          <CardDescription>
            계정에 등록된 이메일 주소를 입력하면 재설정 링크를 보내드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {errorMessage ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}
          {infoMessage ? (
            <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {infoMessage}
            </p>
          ) : null}
          <form action={requestPasswordReset} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              재설정 링크 보내기
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            이미 링크를 받으셨나요?{" "}
            <Link
              href="/sign-in"
              className="text-primary underline-offset-4 hover:underline"
            >
              로그인 화면으로 돌아가기
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

