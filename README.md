# Next.js Middleware Enhancer

A lightweight middleware enhancer for Next.js, allowing route-based middleware execution with support for sequential middleware execution.

## 🚀 Features

- **Route Matching**: Supports Next.js `matcher` patterns to apply middleware based on specific routes.
- **Multiple Middleware Execution**: Allows executing multiple middleware functions sequentially.
- **Automatic Response Handling**: Returns `NextResponse.next()` if no matching middleware is found.

---

## 📦 Installation

Install the package using npm or pnpm:

```sh
npm install next-middleware-enhancer
```

or

```sh
pnpm add next-middleware-enhancer
```

---

## 🛠 Usage

Define your middleware in `middleware.ts` and use `createMiddleware` to apply route-based handlers.

```ts
import { NextRequest, NextResponse } from "next/server";
import { createMiddleware } from "next-middleware-enhancer";

const authMiddleware = (req: NextRequest) => {
  if (!req.headers.get("Authorization")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
};

const { middleware, config } = createMiddleware([{ matcher: "/admin", handler: authMiddleware }]);

export { middleware, config };
```

🛠 Usage (Multiple Handlers)
Apply multiple middleware functions sequentially for a route:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createMiddleware } from "next-middleware-enhancer";

const logMiddleware = (req: NextRequest) => console.log(`Request: ${req.nextUrl.pathname}`);

const authMiddleware = (req: NextRequest) => {
  if (!req.headers.get("Authorization")) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
};

const adminMiddleware = (req: NextRequest) => {
  if (req.headers.get("Authorization") !== "admin-secret")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
};

const { middleware, config } = createMiddleware([
  { matcher: "/admin", handler: [logMiddleware, authMiddleware, adminMiddleware] },
]);

export { middleware, config };
```

Execution Flow:
1️⃣ Logs request path → 2️⃣ Checks auth → 3️⃣ Verifies admin access 🚀

---

## 📖 API Reference

### `createMiddleware(middlewareList: MiddlewareList)`

Creates a Next.js middleware function that applies the specified middleware handlers based on route patterns.

#### **Parameters**

```ts
type MiddlewareFunction = (req: NextRequest) => NextResponse | void | Promise<NextResponse | void>;
type MiddlewareConfig = { matcher: string; handler: MiddlewareFunction | MiddlewareFunction[] };
type MiddlewareList = MiddlewareConfig[];
```

#### **Returns**

```ts
{
  middleware: (req: NextRequest) => NextResponse | void;
  config: { matcher: string[] };
}
```

---

## 🎯 How It Works

1. Requests are matched against `matcher` patterns.
2. Matched middleware functions execute sequentially.
3. A `NextResponse` returned from a middleware stops execution.
4. If no middleware handles the request, `NextResponse.next()` is returned.

---

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

Feel free to contribute to this project by opening issues or pull requests!

---

### **🌟 Enjoy using Next.js Middleware Enhancer? Give it a star on GitHub!** ⭐
