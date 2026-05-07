import { expect, test } from "@playwright/test";

test("kanban mvp workflows", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("heading", { name: "Kanban Board" })).toBeVisible();
  await expect(page.locator("[data-column-id]")).toHaveCount(5);

  const firstColumn = page.locator("[data-column-id]").first();
  await firstColumn.getByLabel("Card title").fill("Playwright card");
  await firstColumn.getByLabel("Card details").fill("End-to-end test details");
  await firstColumn.getByRole("button", { name: "Add Card" }).click();
  await expect(page.getByText("Playwright card")).toBeVisible();

  await page.getByLabel("Backlog title").fill("Ideas");
  await expect(page.locator("input.column-title[value='Ideas']")).toBeVisible();

  const sourceCard = page.getByTestId("card-card-1");
  const targetColumn = page.getByTestId("column-column-done");
  await sourceCard.dragTo(targetColumn);

  await expect(targetColumn.getByText("Onboarding flow copy pass")).toBeVisible();

  const deletableCard = page.getByTestId("card-card-2");
  await expect(deletableCard).toBeVisible();
  await deletableCard.getByRole("button", { name: "Delete" }).click({ force: true });
});
