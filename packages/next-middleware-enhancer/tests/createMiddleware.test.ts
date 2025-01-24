import { describe, expect, test, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { createMiddleware } from "../src/createMiddleware";

describe("createMiddleware", () => {
  test("should return correct config matcher paths", () => {
    const { config } = createMiddleware([
      { matcher: "/api/admin/:path*", handler: () => NextResponse.next() },
      { matcher: "/api/logs/:path*", handler: () => NextResponse.next() },
    ]);

    expect(config.matcher).toEqual(["/api/admin/:path*", "/api/logs/:path*"]);
  });

  test("should apply middleware only to specific matcher paths", () => {
    const authMiddleware = vi.fn((req: NextRequest) => {
      if (!req.headers.get("Authorization")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ message: "OK" }, { status: 200 });
    });

    const logMiddleware = vi.fn((req: NextRequest) => {
      console.log(`Request to: ${req.nextUrl.pathname}`);
      return NextResponse.next();
    });

    const { middleware } = createMiddleware([
      { matcher: "/api/admin/:path*", handler: authMiddleware },
      { matcher: "/api/logs/:path*", handler: logMiddleware },
    ]);

    describe("when a request matches the /api/admin/:path* route", () => {
      const requests = [
        {
          request: new NextRequest(new URL("http://localhost/api/admin"), {
            headers: new Headers({ Authorization: "Bearer token" }),
          }),
          expectedStatus: 200,
        },
        {
          request: new NextRequest(new URL("http://localhost/api/admin"), {}),
          expectedStatus: 401,
        },
      ];

      describe("middleware response validation", () => {
        requests.forEach(async ({ request, expectedStatus }) => {
          const response = await middleware(request);
          expect(response.status).toBe(expectedStatus);
        });
      });

      describe("middleware execution validation", () => {
        expect(authMiddleware).toHaveBeenCalledTimes(requests.length);
      });
    });

    describe("when a request matches the /api/logs/:path* route", async () => {
      const request = new NextRequest(new URL("http://localhost/api/logs/system"), {});
      const response = await middleware(request);

      expect(response.status).toBe(200);
      expect(logMiddleware).toHaveBeenCalledTimes(1);
    });

    describe("when a request does not match any defined middleware routes", async () => {
      const request = new NextRequest(new URL("http://localhost/api/user"), {});
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  test("should correctly match dynamic routes using /:path* pattern", () => {
    const dynamicMiddleware = vi.fn(() => NextResponse.json({ message: "Matched" }));

    const { middleware } = createMiddleware([{ matcher: "/api/user/:id", handler: dynamicMiddleware }]);

    describe("Matching dynamic routes", () => {
      const matchedRequests = [
        new NextRequest(new URL("http://localhost/api/user/123"), {}),
        new NextRequest(new URL("http://localhost/api/user/456"), {}),
      ];

      matchedRequests.forEach(async (request) => {
        const response = await middleware(request);
        expect(response.status).toBe(200);
      });

      expect(dynamicMiddleware).toHaveBeenCalledTimes(matchedRequests.length);
    });

    describe("Non-matching routes", () => {
      const unmatchedRequests = [
        new NextRequest(new URL("http://localhost/api/guest/123"), {}),
        new NextRequest(new URL("http://localhost/api/admin/789"), {}),
      ];

      unmatchedRequests.forEach(async (request) => {
        const response = await middleware(request);
        expect(response.status).toBe(200);
      });

      expect(dynamicMiddleware).toHaveBeenCalledTimes(2);
    });
  });

  test("should allow multiple middleware functions to run sequentially", () => {
    const logMiddleware = vi.fn((req: NextRequest) => {
      console.log(`Request to ${req.nextUrl.pathname}`);
      return NextResponse.next();
    });

    const authMiddleware = vi.fn((req: NextRequest) => {
      if (!req.headers.get("Authorization")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.next();
    });

    const { middleware } = createMiddleware([
      { matcher: "/api/admin/:path*", handler: [logMiddleware, authMiddleware] },
    ]);

    describe("when multiple middleware functions are applied", () => {
      const requests = [
        {
          request: new NextRequest(new URL("http://localhost/api/admin"), {
            headers: new Headers({ Authorization: "Bearer token" }),
          }),
          expectedStatus: 200,
        },
        {
          request: new NextRequest(new URL("http://localhost/api/admin"), {}),
          expectedStatus: 401,
        },
      ];

      describe("middleware response validation", () => {
        requests.forEach(async ({ request, expectedStatus }) => {
          const response = await middleware(request);
          expect(response.status).toBe(expectedStatus);
        });
      });

      describe("middleware execution order validation", () => {
        expect(logMiddleware).toHaveBeenCalledTimes(requests.length);
        expect(authMiddleware).toHaveBeenCalledTimes(requests.length);
      });
    });
  });

  test("should not apply middleware when the request does not match any matcher", () => {
    const authMiddleware = vi.fn((req: NextRequest) => {
      if (!req.headers.get("Authorization")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ message: "OK" }, { status: 200 });
    });

    const logMiddleware = vi.fn((req: NextRequest) => {
      console.log(`Request to: ${req.nextUrl.pathname}`);
      return NextResponse.next();
    });

    const dynamicMiddleware = vi.fn(() => NextResponse.json({ message: "Matched" }));

    const { middleware } = createMiddleware([
      { matcher: "/api/admin/:path*", handler: authMiddleware },
      { matcher: "/api/logs/:path*", handler: logMiddleware },
      { matcher: "/api/user/:id", handler: dynamicMiddleware },
    ]);

    describe("when a request does not match any defined middleware routes", () => {
      const unmatchedRequests = [
        new NextRequest(new URL("http://localhost/api/unknown"), {}),
        new NextRequest(new URL("http://localhost/api/random/path"), {}),
        new NextRequest(new URL("http://localhost/home"), {}),
      ];

      unmatchedRequests.forEach(async (request) => {
        const response = await middleware(request);
        expect(response.status).toBe(200); // NextResponse.next()가 반환되어야 함
      });

      expect(authMiddleware).not.toHaveBeenCalled();
      expect(logMiddleware).not.toHaveBeenCalled();
      expect(dynamicMiddleware).not.toHaveBeenCalled();
    });
  });

  test("createMiddleware - supports multiple async middleware functions", () => {
    describe("should execute async middleware in sequence and return final response", async () => {
      const executionOrder: string[] = [];

      const middlewareConfig = createMiddleware([
        {
          matcher: "/api/async",
          handler: [
            async (req) => {
              await new Promise((resolve) => setTimeout(resolve, 50));
              executionOrder.push("middleware-1");
            },
            async (req) => {
              await new Promise((resolve) => setTimeout(resolve, 50));
              executionOrder.push("middleware-2");
            },
            async (req) => {
              await new Promise((resolve) => setTimeout(resolve, 50));
              executionOrder.push("middleware-3");
              return NextResponse.json({ message: "Final response" });
            },
          ],
        },
      ]);

      const req = new NextRequest(new URL("http://localhost/api/async"));
      const res = await middlewareConfig.middleware(req);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ message: "Final response" });

      expect(executionOrder).toEqual(["middleware-1", "middleware-2", "middleware-3"]);
    });
  });
});
