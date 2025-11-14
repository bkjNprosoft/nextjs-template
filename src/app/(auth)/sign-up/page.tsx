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

import { registerUser } from "./actions";

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;

  const errorParam = resolvedSearchParams?.error;
  const infoParam = resolvedSearchParams?.message;

  const errorMessage =
    typeof errorParam === "string" ? errorParam : undefined;
  const infoMessage =
    typeof infoParam === "string" ? infoParam : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">회원가입</CardTitle>
          <CardDescription>
            몇 가지 정보만 입력하면 협업 대시보드를 바로 시작할 수 있어요.
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
          <form action={registerUser} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">이름</Label>
              <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="홍길동"
                  required
                />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="비밀번호 (영문+숫자 8자 이상)"
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              계정 생성하기
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/sign-in" className="text-primary underline-offset-4 hover:underline">
              로그인하기
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

