import { expect, test } from "@playwright/test";
import { gotoApp, resetClientState, tinyPng } from "./helpers";

test("restaurant profile and brand assets persist and appear on dashboard/diner surfaces", async ({
  page,
}) => {
  await resetClientState(page);

  await gotoApp(page, "/dashboard/settings");
  await expect(page.getByTestId("dashboard-settings-page")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
  const nameField = page.getByLabel("Restaurant name");
  const descriptionField = page.getByLabel("Description");
  const phoneField = page.getByLabel("Phone number");
  const cityField = page.getByLabel("City");

  await expect(nameField).toHaveValue("Mama Put Kitchen");
  await nameField.fill("QA Kitchen");
  await descriptionField.fill(
    "A polished test kitchen for production readiness checks.",
  );
  await phoneField.fill("0800 111 2222");
  await cityField.fill("Lagos");
  await expect(nameField).toHaveValue("QA Kitchen");
  await expect(phoneField).toHaveValue("0800 111 2222");
  await page.locator("#logo-upload-input").setInputFiles({
    name: "qa-logo.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await page.locator("#cover-upload-input").setInputFiles({
    name: "qa-cover.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });

  await page.getByRole("button", { name: "Save changes" }).click();

  await page.reload();
  await expect(nameField).toHaveValue("QA Kitchen");
  await expect(phoneField).toHaveValue("0800 111 2222");

  await gotoApp(page, "/dashboard");
  await expect(page.getByText("QA Kitchen").first()).toBeVisible();

  await gotoApp(page, "/dashboard/menu");
  const previewTab = page.getByRole("button", { name: "Preview" });
  if (await previewTab.isVisible()) {
    await previewTab.click();
  }
  await expect(page.getByTestId("menu-preview-restaurant-name")).toHaveText(
    "QA Kitchen",
  );

  await gotoApp(page, "/mama-put-kitchen/t/1");
  await expect(page.getByRole("heading", { name: "QA Kitchen" })).toBeVisible();
  await expect(page.getByText("polished test kitchen")).toBeVisible();
  await expect(page.getByAltText("QA Kitchen logo")).toBeVisible();
});
