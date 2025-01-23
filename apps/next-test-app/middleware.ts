import { createMiddleware } from "../../packages/next-middleware-enhancer/src/createMiddleware";
import { NextResponse } from "next/server";

const authMiddleware = (req: Request) => {
  if (!req.headers.get("Authorization")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
};

const logMiddleware = (req: Request) => {
  console.log(`Request to: ${req.url}`);
  return NextResponse.next();
};

const dynamicMiddleware = () => {
  return NextResponse.json({ message: "Matched dynamic route" }, { status: 200 });
};

export default createMiddleware([
  { matcher: "/api/admin/:path*", handler: authMiddleware },
  { matcher: "/api/logs/:path*", handler: logMiddleware },
  { matcher: "/api/user/:id", handler: dynamicMiddleware },
]);
