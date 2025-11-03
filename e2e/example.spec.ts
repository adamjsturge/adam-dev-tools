import { expect, test } from "@playwright/test";

test("basic navigation works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Developer Tools" })).toBeVisible();
});
