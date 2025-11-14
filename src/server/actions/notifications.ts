"use server";

import { NotificationCategory, ThemePreference } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

const markSchema = z.object({
  notificationId: z.string().cuid(),
});

const preferenceSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(60, "이름은 60자 이하로 입력해 주세요.")
    .optional(),
  theme: z.nativeEnum(ThemePreference),
  emailProductUpdates: z.boolean(),
  emailSecurity: z.boolean(),
  inAppAlerts: z.boolean(),
});

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

async function requireUserSession() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("인증된 사용자만 사용할 수 있습니다.");
  }

  return session.user;
}

export async function markNotificationReadAction(formData: FormData) {
  const user = await requireUserSession();

  const parsed = markSchema.safeParse({
    notificationId: formData.get("notificationId") ?? "",
  });

  if (!parsed.success) {
    throw new Error("알림 식별자가 올바르지 않습니다.");
  }

  await prisma.notification.updateMany({
    where: {
      id: parsed.data.notificationId,
      userId: user.id,
    },
    data: {
      read: true,
    },
  });

  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsReadAction() {
  const user = await requireUserSession();

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/dashboard/notifications");
}

export async function sendNotificationPreviewAction() {
  const user = await requireUserSession();
  const appBaseUrl =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const notification = await prisma.notification.create({
    data: {
      userId: user.id,
      title: "프로젝트 활동 업데이트",
      body: "신규 댓글과 진행 상황이 업데이트되었습니다. 대시보드에서 세부 내용을 확인하세요.",
      category: NotificationCategory.PROJECT,
    },
  });

  if (user.email) {
    await sendNotificationEmail({
      to: user.email,
      subject: "[Preview] 프로젝트 업데이트 알림",
      html: `
        <h2 style="font-family:Arial,sans-serif;">안녕하세요 ${user.name ?? ""}님</h2>
        <p>${notification.body}</p>
        <p><a href="${appBaseUrl}/dashboard/notifications">알림센터 열기</a></p>
      `,
    });
  }

  revalidatePath("/dashboard/notifications");
}

export async function updateUserPreferencesAction(formData: FormData) {
  const user = await requireUserSession();

  const displayNameEntry = formData.get("displayName");

  const parsed = preferenceSchema.safeParse({
    displayName:
      typeof displayNameEntry === "string" ? displayNameEntry : "",
    theme: formData.get("theme") ?? ThemePreference.SYSTEM,
    emailProductUpdates: toBoolean(formData.get("emailProductUpdates")),
    emailSecurity: toBoolean(formData.get("emailSecurity")),
    inAppAlerts: toBoolean(formData.get("inAppAlerts")),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "설정 값을 확인해 주세요.");
  }

  const { displayName, ...preferenceData } = parsed.data;

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: preferenceData,
    create: {
      userId: user.id,
      ...preferenceData,
    },
  });

  if (displayName !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: displayName.length ? displayName : user.name,
      },
    });
  }

  revalidatePath("/dashboard/settings");
}

