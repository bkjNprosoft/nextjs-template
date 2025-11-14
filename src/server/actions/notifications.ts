"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth";

const updatePreferencesSchema = z.object({
  theme: z.enum(["SYSTEM", "LIGHT", "DARK"]),
  emailNotifications: z.boolean(),
});

export async function updateUserPreferencesAction(formData: FormData) {
  const user = await requireUser();

  const theme = formData.get("theme");
  const emailNotifications = formData.get("emailNotifications");

  const parsed = updatePreferencesSchema.safeParse({
    theme,
    emailNotifications: emailNotifications === "true",
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        theme: parsed.data.theme,
        emailNotifications: parsed.data.emailNotifications,
      },
      update: {
        theme: parsed.data.theme,
        emailNotifications: parsed.data.emailNotifications,
      },
    });

    revalidatePath("/settings");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error
            ? error.message
            : "설정 저장에 실패했습니다.",
        ],
      },
    };
  }
}
