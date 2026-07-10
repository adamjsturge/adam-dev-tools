import { expect, test, type Page } from "@playwright/test";
import { tools } from "../src/pages/Home/tools";

interface RouteCase {
  href: string;
  title: string;
}

const routes: RouteCase[] = [
  ...tools.map(({ href, title }) => ({ href, title })),
  { href: "/background-removal", title: "Background Removal" },
];

// The page h1 sometimes differs from the Home tile title.
const H1_OVERRIDES: Record<string, string> = {
  "/base64/encode": "Base64 Encoder",
  "/base64/decode": "Base64 Decoder",
  "/url/encode": "URL Encoder",
  "/url/decode": "URL Decoder",
  "/textbin": "Text Bin",
  "/word-counter": "Ultimate Word Counter",
  "/deck-draw-odds": "Deck Draw Odds Calculator",
  "/card-assumption": "Card Assumption Calculator",
  "/ev-charging": "EV Charging Estimator",
  "/opacifier": "Color Opacity (Beta)",
  "/color-background-removal": "Color Background Removal",
  "/multi-deck-converter": "Multi-Deck Link Converter",
  "/deckbuilder-links": "Deckbuilder Links Generator",
  "/compare": "Text Compare",
};

function escapeRegExp(text: string): string {
  return text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console.error: ${message.text()}`);
    }
  });
  return errors;
}

test.describe("tool route smoke tests", () => {
  for (const route of routes) {
    test(`${route.href} renders`, async ({ page }) => {
      // Stub the external card-data CDN so DeckPrice doesn't error
      // (or hang) on network access during tests.
      await page.route("**/cdn.cardkaizoku.com/**", (routeHandler) =>
        routeHandler.fulfill({
          contentType: "application/json",
          body: "[]",
        }),
      );

      const errors = collectPageErrors(page);
      const heading = H1_OVERRIDES[route.href] ?? route.title;
      const timeout = route.href === "/background-removal" ? 30_000 : undefined;

      await page.goto(route.href, { timeout });
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible({ timeout });
      await expect(page).toHaveTitle(new RegExp(escapeRegExp(heading)));

      expect(errors).toEqual([]);
    });
  }

  test("home page renders grouped categories and search filters", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Developer Tools" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Encoding" })).toBeVisible();

    await page.getByPlaceholder("Search tools...").fill("base64");
    await expect(page.getByText("Base64 Encode")).toBeVisible();
    await expect(page.getByText("Word Counter")).not.toBeVisible();
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(
      page.getByRole("heading", { level: 1, name: "404" }),
    ).toBeVisible();
  });
});
