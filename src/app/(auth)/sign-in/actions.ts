"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/lib/auth";

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export async function signInWithCredentials(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const message =
      issue?.message ?? "로그인 정보를 확인해 주세요.";
    redirect(`/sign-in?error=${encodeURIComponent(message)}`);
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const message =
        error.type === "CredentialsSignin"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "로그인 중 오류가 발생했습니다.";

      redirect(`/sign-in?error=${encodeURIComponent(message)}`);
    }

    throw error;
  }
}

