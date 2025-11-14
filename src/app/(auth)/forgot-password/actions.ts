"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { issuePasswordResetToken } from "@/lib/password-reset";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email("올바른 이메일 형식이 아닙니다."),
});

function redirectWithMessage(
  message: string,
  type: "error" | "success",
): never {
  const key = type === "error" ? "error" : "message";
  redirect(`/forgot-password?${key}=${encodeURIComponent(message)}`);
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = requestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    redirectWithMessage(
      issue?.message ?? "이메일을 확인해 주세요.",
      "error",
    );
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!user) {
    redirectWithMessage(
      "입력한 이메일로 비밀번호 재설정 메일을 발송했습니다.",
      "success",
    );
  }

  try {
    const { rawToken } = await issuePasswordResetToken(user.id);
    await sendPasswordResetEmail(email, rawToken);
  } catch (error) {
    console.error("[auth] password reset error", error);
    redirectWithMessage("비밀번호 재설정 메일 전송에 실패했습니다.", "error");
  }

  redirectWithMessage(
    "입력한 이메일로 비밀번호 재설정 메일을 발송했습니다.",
    "success",
  );
}

