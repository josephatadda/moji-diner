import type { Page } from "@playwright/test";

export const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l9D8VwAAAABJRU5ErkJggg==",
  "base64",
);

export async function resetClientState(_page: Page) {
  // Playwright creates an isolated browser context per test. Keeping this helper
  // as a no-op avoids adding a slow root-route navigation before every flow.
}

export async function gotoApp(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
}
