"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { consumePasswordResetToken, validatePasswordResetToken } from "@/lib/password-reset";
import { hashPassword } from "@/lib/password";

const resetSchema = z
  .object({
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

function redirectWithError(message: string): never {
  redirect(`/forgot-password?error=${encodeURIComponent(message)}`);
}

export async function resetPassword(token: string, formData: FormData) {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    redirectWithError(issue?.message ?? "입력값을 확인해 주세요.");
  }

  const record = await validatePasswordResetToken(token);

  if (!record) {
    redirectWithError("유효하지 않거나 만료된 링크입니다. 다시 요청해 주세요.");
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.update({
    where: { id: record.userId },
    data: {
      passwordHash,
    },
  });

  await consumePasswordResetToken(token);

  redirect(
    `/sign-in?message=${encodeURIComponent(
      "비밀번호가 변경되었습니다. 새로운 비밀번호로 로그인해 주세요.",
    )}`,
  );
}

