import { expect, test } from "@playwright/test";
import { gotoApp, resetClientState } from "./helpers";

test("core diner menu, cart, and bill surfaces render without stale route failures", async ({
  page,
}) => {
  await resetClientState(page);

  await gotoApp(page, "/mama-put-kitchen/t/1");
  await expect(
    page.getByRole("heading", { name: "Mama Put Kitchen" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Starters/i })).toBeVisible();
  await expect(page.getByText("Peppered Snail").first()).toBeVisible();

  await gotoApp(page, "/mama-put-kitchen/t/1/cart");
  await expect(page.locator("body")).not.toContainText("Internal server error");
  await expect(page.locator("body")).not.toContainText(
    "Unhandled Runtime Error",
  );

  await gotoApp(page, "/mama-put-kitchen/t/1/bill");
  await expect(page.locator("body")).not.toContainText("Internal server error");
  await expect(page.locator("body")).not.toContainText(
    "Unhandled Runtime Error",
  );
});
