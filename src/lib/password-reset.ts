import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MINUTES = 30;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function issuePasswordResetToken(userId: string) {
  const rawToken = crypto.randomUUID();
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token: hashedToken,
      expires,
    },
  });

  return { rawToken, expires };
}

export async function validatePasswordResetToken(rawToken: string) {
  const hashedToken = hashToken(rawToken);

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  return record;
}

export async function consumePasswordResetToken(rawToken: string) {
  const hashedToken = hashToken(rawToken);

  await prisma.passwordResetToken.deleteMany({
    where: { token: hashedToken },
  });
}

