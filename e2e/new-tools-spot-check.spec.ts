import { expect, test } from "@playwright/test";

// Functional checks for the JSON, hash, case, HTML entity, timestamp,
// and UUID tools — deeper than the route smoke tests in tools.spec.ts.

test("JSON Formatter formats, minifies, and reports errors", async ({
  page,
}) => {
  await page.goto("/json");
  const input = page.getByLabel("Input");
  await input.fill('{"b":1,"a":[1,2]}');
  await page.getByRole("button", { name: "Format" }).click();
  await expect(page.getByLabel("Output")).toHaveValue(
    '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}',
  );
  await page.getByRole("button", { name: "Minify" }).click();
  await expect(page.getByLabel("Output")).toHaveValue('{"b":1,"a":[1,2]}');

  await input.fill("{not json");
  await page.getByRole("button", { name: "Format" }).click();
  await expect(page.getByLabel("Output")).not.toHaveValue(/^\{/);
});

test("Hash Generator computes known SHA-256", async ({ page }) => {
  await page.goto("/hash");
  await page.getByLabel("Input").fill("abc");
  await expect(
    page.getByText(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    ),
  ).toBeVisible();
  // SHA-1 of "abc"
  await expect(
    page.getByText("a9993e364706816aba3e25717850c26c9cd0d89d"),
  ).toBeVisible();
});

test("Case Converter produces all variants", async ({ page }) => {
  await page.goto("/case-converter");
  await page.getByLabel("Input").fill("helloWorld example-text");
  const exact = { exact: true };
  await expect(page.getByText("hello_world_example_text", exact)).toBeVisible();
  await expect(page.getByText("HelloWorldExampleText", exact)).toBeVisible();
  await expect(page.getByText("hello-world-example-text", exact)).toBeVisible();
  await expect(page.getByText("HELLO_WORLD_EXAMPLE_TEXT", exact)).toBeVisible();
});

test("HTML entities round-trip", async ({ page }) => {
  const raw = `<div class="a">Tom & Jerry's</div>`;
  const encoded =
    "&lt;div class=&quot;a&quot;&gt;Tom &amp; Jerry&#39;s&lt;/div&gt;";

  await page.goto("/html-entities/encode");
  await page.getByLabel("Input").fill(raw);
  await page.getByRole("button", { name: "Encode" }).click();
  await expect(page.getByLabel("Output")).toHaveValue(encoded);

  await page.goto("/html-entities/decode");
  await page.getByLabel("Input").fill(encoded);
  await page.getByRole("button", { name: "Decode" }).click();
  await expect(page.getByLabel("Output")).toHaveValue(raw);
});

test("Timestamp converter handles known epoch in both units", async ({
  page,
}) => {
  await page.goto("/timestamp");
  const input = page.getByLabel("Epoch timestamp");
  await input.fill("1752105600");
  await expect(page.getByText("Interpreted as seconds")).toBeVisible();
  await expect(page.getByText("2025-07-10T00:00:00.000Z")).toBeVisible();

  await input.fill("1752105600000");
  await expect(page.getByText("Interpreted as milliseconds")).toBeVisible();
  await expect(page.getByText("2025-07-10T00:00:00.000Z")).toBeVisible();

  await input.fill("not a number");
  await expect(page.getByText("Invalid timestamp")).toBeVisible();

  // shareable URL state
  await input.fill("1752105600");
  await expect(page).toHaveURL(/t=1752105600/);
});

test("UUID/ULID generator produces valid formats and counts", async ({
  page,
}) => {
  await page.goto("/uuid");

  const uuidV4Pattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const uuidV7Pattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/;

  await expect(page.locator("code").first()).toHaveText(uuidV4Pattern);

  await page.getByLabel("Count").fill("5");
  await page.getByLabel("Type").selectOption("uuid-v7");
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.locator("code")).toHaveCount(5);
  for (const text of await page.locator("code").allTextContents()) {
    expect(text).toMatch(uuidV7Pattern);
  }

  await page.getByLabel("Type").selectOption("ulid");
  await page.getByRole("button", { name: "Generate" }).click();
  for (const text of await page.locator("code").allTextContents()) {
    expect(text).toMatch(ulidPattern);
  }
});
