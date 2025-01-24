import { createMiddleware } from "next-middleware-enhancer";
import { NextRequest, NextResponse } from "next/server";

const authMiddleware = (req: NextRequest) => {
  if (!req.headers.get("Authorization")) {
    const res = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    res.headers.set("X-Test-Middleware", "executed");
    return res;
  }
  const res = NextResponse.next();
  res.headers.set("X-Test-Middleware", "executed");
  return res;
};

const logMiddleware = () => {
  const res = NextResponse.next();
  res.headers.set("X-Test-Middleware", "executed");
  return res;
};

const dynamicMiddleware = () => {
  const res = NextResponse.json({ message: "Matched dynamic route" }, { status: 200 });
  res.headers.set("X-Test-Middleware", "executed");
  return res;
};

const { middleware, config } = createMiddleware([
  { matcher: "/admin", handler: authMiddleware },
  { matcher: "/logs/:path*", handler: logMiddleware },
  { matcher: "/user/:id", handler: dynamicMiddleware },
]);

export { middleware, config };
