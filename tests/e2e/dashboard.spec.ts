import { test, expect } from "@playwright/test";

test("loads production page from landing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("EGINA WELL STATUS")).toBeVisible();
  await page.waitForURL("**/production-kpi", { timeout: 5000 });
  await expect(page.getByRole("heading", { name: "Production KPI View" })).toBeVisible();
});

test("opens and closes well overlay", async ({ page }) => {
  await page.goto("/production-kpi");
  const firstCard = page.getByRole("button", { name: /Open details for well/i }).first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close well details" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("well search filters cards", async ({ page }) => {
  await page.goto("/well-health");
  const searchInput = page.getByRole("searchbox", { name: "Find well" });
  await expect(searchInput).toBeVisible();

  await searchInput.fill("W999");
  await expect(page.getByText("No wells match your search.")).toBeVisible();
});
