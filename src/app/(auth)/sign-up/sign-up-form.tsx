"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

import { registerUser } from "./actions";

type SignUpFormProps = {
  initialError?: string;
  initialInfo?: string;
};

export function SignUpForm({ initialError, initialInfo }: SignUpFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [info, setInfo] = useState<string | null>(initialInfo ?? null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);
    formDataObj.append("confirmPassword", formData.confirmPassword);

    startTransition(async () => {
      const result = await registerUser(formDataObj);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-6 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-3 border-b bg-muted/30 text-center pb-6">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl font-bold text-primary">쇼핑몰</span>
          </div>
          <CardTitle className="text-3xl font-bold">회원가입</CardTitle>
          <CardDescription className="text-base">
            몇 가지 정보만 입력하면 쇼핑을 시작할 수 있어요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {error ? (
            <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          {info ? (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
              {info}
            </div>
          ) : null}
          <form onSubmit={(e) => { handleSubmit(e); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">이름</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="홍길동"
                className="h-12"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="비밀번호 (영문+숫자 8자 이상)"
                className="h-12"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="비밀번호를 다시 입력하세요"
                className="h-12"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isPending}>
              {isPending ? "처리 중..." : "계정 생성하기"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t bg-muted/30 text-center pt-6">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              로그인하기
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

