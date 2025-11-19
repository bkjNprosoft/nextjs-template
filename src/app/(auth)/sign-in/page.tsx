import { UserRole } from "@prisma/client";
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
import { auth, signIn } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

import { signInWithCredentials } from "./actions";

async function signInWithGitHub() {
  "use server";

  await signIn("github", { redirectTo: "/dashboard" });
}

async function signInWithEmail(formData: FormData) {
  "use server";

  const email = formData.get("email");

  if (typeof email === "string" && email.length > 3) {
    // 이메일로 사용자 역할 확인
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { role: true },
    });

    // 역할에 따라 리다이렉트 경로 결정
    const redirectTo =
      user?.role === UserRole.ADMIN ? "/admin/dashboard" : "/dashboard";

    await signIn("resend", {
      email,
      redirectTo,
    });
  }
}

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.user) {
    // 역할에 따라 적절한 대시보드로 리다이렉트
    const redirectPath =
      session.user.role === UserRole.ADMIN
        ? "/admin/dashboard"
        : "/dashboard";
    redirect(redirectPath);
  }

  const canUseGitHub =
    Boolean(process.env.GITHUB_ID) && Boolean(process.env.GITHUB_SECRET);

  const canUseEmail =
    Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.EMAIL_FROM);

  const resolvedSearchParams = await searchParams;

  const errorParam = resolvedSearchParams?.error;
  const messageParam =
    resolvedSearchParams?.message ?? resolvedSearchParams?.success;

  const errorMessage =
    typeof errorParam === "string" ? errorParam : undefined;
  const infoMessage =
    typeof messageParam === "string" ? messageParam : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-6 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-3 border-b bg-muted/30 text-center pb-6">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl font-bold text-primary">쇼핑몰</span>
          </div>
          <CardTitle className="text-3xl font-bold">
            로그인
          </CardTitle>
          <CardDescription className="text-base">
            쇼핑몰에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {errorMessage ? (
            <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
          {infoMessage ? (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
              {infoMessage}
            </div>
          ) : null}
          <form action={signInWithCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="h-12"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex items-center justify-end text-sm">
              <Link
                href="/forgot-password"
                className="text-muted-foreground underline-offset-4 hover:text-primary transition-colors"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <Button className="w-full h-12 text-base font-semibold" type="submit">
              로그인
            </Button>
          </form>

          {canUseGitHub ? (
            <form action={signInWithGitHub}>
              <Button className="w-full h-12 text-base" type="submit" variant="outline">
                GitHub로 로그인
              </Button>
            </form>
          ) : null}

          {canUseEmail ? (
            <form action={signInWithEmail} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email-magic" className="text-sm font-semibold">이메일</Label>
                <Input
                  id="email-magic"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-12"
                  required
                />
              </div>
              <Button type="submit" variant="ghost" className="w-full h-12">
                매직 링크 받기
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Resend를 통해 일회성 로그인 링크를 전송합니다.
              </p>
            </form>
          ) : null}

          {!canUseGitHub && !canUseEmail ? (
            <p className="text-sm text-center text-muted-foreground">
              인증 제공자가 설정되지 않았습니다. GitHub OAuth 또는 Resend 매직 링크를 위한 환경 변수를 설정하세요.
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t bg-muted/30 text-center pt-6">
          <p className="text-sm text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              지금 가입하기
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

