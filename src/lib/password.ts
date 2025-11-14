import { compare, hash } from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashValue?: string | null) {
  if (!hashValue) {
    return false;
  }

  try {
    return await compare(password, hashValue);
  } catch {
    return false;
  }
}

