"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { hashPassword } from "@/shared/lib/password";

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "이름은 두 글자 이상이어야 합니다."),
    email: z.string().trim().toLowerCase().email("올바른 이메일 형식이 아닙니다."),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
        "비밀번호는 영문과 숫자를 포함해야 합니다.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "입력값을 확인해 주세요.",
    };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      error: "이미 가입된 이메일입니다.",
    };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      redirect(
        `/sign-in?message=${encodeURIComponent(
          "회원가입이 완료되었습니다. 로그인해 주세요.",
        )}`,
      );
    }

    throw error;
  }
}

