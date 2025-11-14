import { expect, test } from "@playwright/test";

test.describe("marketing surface", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Production-grade design system starter/i,
      }),
    ).toBeVisible();
  });
});

