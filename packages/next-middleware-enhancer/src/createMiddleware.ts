import { NextRequest, NextResponse } from "next/server";

type MiddlewareFunction = (req: NextRequest) => NextResponse | void;
type MiddlewareConfig = { matcher: string; handler: MiddlewareFunction | MiddlewareFunction[] };
type MiddlewareList = MiddlewareConfig[];

/**
 * `createMiddleware` function
 * - Supports Next.js `matcher` patterns to apply middleware based on routes
 * - Allows multiple middleware functions to execute sequentially
 * - Returns `NextResponse.next()` if no matching middleware is found
 */
export function createMiddleware(middlewareList: MiddlewareList) {
  return {
    middleware: (req: NextRequest) => {
      for (const { matcher, handler } of middlewareList) {
        if (matchRoute(req.nextUrl.pathname, matcher)) {
          const handlers = Array.isArray(handler) ? handler : [handler];

          for (const middleware of handlers) {
            const response = middleware(req);
            if (response) return response;
          }
        }
      }

      return NextResponse.next();
    },
    config: {
      matcher: middlewareList.map(({ matcher }) => matcher),
    },
  };
}

function matchRoute(path: string, matcher: string): boolean {
  const regex = new RegExp(`^${matcher.replace(/:\w+\*/g, ".*").replace(/:\w+/g, "[^/]+")}$`);
  return regex.test(path);
}
