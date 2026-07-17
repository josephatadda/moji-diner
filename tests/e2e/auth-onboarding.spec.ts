import { expect, test } from "@playwright/test";
import { gotoApp, resetClientState } from "./helpers";

test("onboarding QR step is frictionless and completes locally", async ({
  page,
}) => {
  await resetClientState(page);
  await gotoApp(page, "/onboarding/step-2");

  await expect(page.getByRole("heading", { name: "Menu QR" })).toBeVisible();
  await expect(page.getByText("Download QR code")).toBeVisible();
  await expect(page.getByText("PDF menu style")).toHaveCount(0);
  await expect(page.getByText("Privacy Policy")).toHaveCount(0);
  await expect(page.getByText("Terms of Use")).toHaveCount(0);
  await expect(page.getByText("Internal server error")).toHaveCount(0);

  const downloadPromise = page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        window.addEventListener(
          "moji:qr-download",
          (event) => {
            resolve(
              (event as CustomEvent<{ filename: string }>).detail.filename,
            );
          },
          { once: true },
        );
      }),
  );
  await page.getByRole("button", { name: "Download QR code" }).click();
  await expect(downloadPromise).resolves.toContain("qr.svg");

  await page.getByRole("button", { name: "Complete setup" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: /good morning/i }),
  ).toBeVisible();
});

const authSmokeRoutes = [
  "/login",
  "/signup",
  "/verify-email",
  "/reset-password",
  "/reset-password?token=mock-token",
  "/staff-login",
  "/onboarding/step-1",
] as const;

for (const path of authSmokeRoutes) {
  test(`auth route ${path} renders without internal errors`, async ({
    page,
  }) => {
    await resetClientState(page);
    await gotoApp(page, path);
    await expect(page.locator("body")).not.toContainText(
      "Internal server error",
    );
    await expect(page.locator("body")).not.toContainText(
      "Unhandled Runtime Error",
    );
  });
}
