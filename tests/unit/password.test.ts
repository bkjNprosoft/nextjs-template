import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/password";

describe("password utilities", () => {
  it("hashes and verifies passwords", async () => {
    const password = "Secr3t-pass!";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$2[aby]\$/);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it("fails verification for mismatched passwords", async () => {
    const password = "ship-fast";
    const hash = await hashPassword(password);

    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });
});

