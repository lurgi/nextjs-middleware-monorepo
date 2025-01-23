import { test, expect } from "@playwright/test";

test.describe("Next.js Middleware E2E Tests", () => {
  test("should return 401 Unauthorized for /api/admin when no token is provided", async ({ request }) => {
    const response = await request.get("/api/admin");
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: "Unauthorized" });
  });

  test("should return 200 OK for /api/admin when a token is provided", async ({ request }) => {
    const response = await request.get("/api/admin", {
      headers: { Authorization: "Bearer token" },
    });
    expect(response.status()).toBe(200);
  });

  test("should log request when accessing /api/logs/system", async ({ request }) => {
    const response = await request.get("/api/logs/system");
    expect(response.status()).toBe(200);
  });

  test("should return 200 OK for /api/user/:id with dynamic route", async ({ request }) => {
    const response = await request.get("/api/user/123");
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ message: "Matched dynamic route" });
  });

  test("should not apply middleware when request does not match any defined routes", async ({ request }) => {
    const response = await request.get("/api/unknown");
    expect(response.status()).toBe(200);
  });
});
