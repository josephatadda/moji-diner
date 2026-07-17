import { expect, test } from "@playwright/test";
import { gotoApp, resetClientState } from "./helpers";

test("dashboard menu item edits sync to the diner menu", async ({ page }) => {
  await resetClientState(page);

  await gotoApp(page, "/dashboard/menu");
  await expect(page.getByTestId("dashboard-menu-page")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
  const editorTab = page.getByRole("button", { name: "Editor" });
  if (await editorTab.isVisible()) {
    await editorTab.click();
  }
  await page.getByTestId("menu-item-row-item-001").click();
  await expect(page.getByRole("heading", { name: "Edit item" })).toBeVisible();

  await page.getByLabel("Item name").fill("QA Peppered Snail");
  await page.getByLabel("Description").fill("QA edited menu description.");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("QA Peppered Snail").first()).toBeVisible();

  await gotoApp(page, "/mama-put-kitchen/t/1");
  await expect(page.getByText("QA Peppered Snail").first()).toBeVisible();
  await expect(
    page.getByText("QA edited menu description.").first(),
  ).toBeVisible();
});
