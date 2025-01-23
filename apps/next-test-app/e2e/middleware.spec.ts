import { test, expect } from "@playwright/test";

test.describe("Next.js Middleware E2E Tests", () => {
  test("should apply middleware for /admin", async ({ page }) => {
    const response = await page.goto("/admin");
    const headerValues = await response?.headerValues("X-Test-Middleware");

    expect(response?.status()).toBe(401);
    expect(headerValues?.[0]).toBe("executed");
  });

  test("should apply middleware for /logs/system", async ({ page }) => {
    const response = await page.goto("/logs/system");
    const headerValues = await response?.headerValues("X-Test-Middleware");

    expect(headerValues?.[0]).toBe("executed");
  });

  test("should apply middleware for /user/:id", async ({ page }) => {
    const response = await page.goto("/user/123");
    const headerValues = await response?.headerValues("X-Test-Middleware");

    expect(headerValues?.[0]).toBe("executed");
  });
});
