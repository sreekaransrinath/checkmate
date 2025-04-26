import { test, expect } from "@playwright/test";

test.describe("Options Page", () => {
  test("saves API key", async ({ page }) => {
    await page.goto("src/options/options.html");

    // Fill in API key
    const apiKeyInput = page.locator("#apiKey");
    await apiKeyInput.fill("sk-test-key");

    // Click save
    const saveButton = page.locator("#saveApiKey");
    await saveButton.click();

    // Check success message
    const statusMessage = page.locator("#saveStatus");
    await expect(statusMessage).toHaveText("API key saved successfully");
  });

  test("validates API key format", async ({ page }) => {
    await page.goto("src/options/options.html");

    // Fill in invalid API key
    const apiKeyInput = page.locator("#apiKey");
    await apiKeyInput.fill("invalid-key");

    // Click save
    const saveButton = page.locator("#saveApiKey");
    await saveButton.click();

    // Check error message
    const statusMessage = page.locator("#saveStatus");
    await expect(statusMessage).toHaveText("Invalid API key format");
  });

  test("saves confidence threshold", async ({ page }) => {
    await page.goto("src/options/options.html");

    // Set threshold
    const thresholdInput = page.locator("#threshold");
    await thresholdInput.fill("75");

    // Click save
    const saveButton = page.locator("#saveThreshold");
    await saveButton.click();

    // Check success message
    const statusMessage = page.locator("#thresholdStatus");
    await expect(statusMessage).toHaveText("Threshold saved successfully");

    // Check value display
    const thresholdValue = page.locator("#thresholdValue");
    await expect(thresholdValue).toHaveText("75%");
  });
});
