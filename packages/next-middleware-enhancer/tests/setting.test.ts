import { describe, expect, it } from "vitest";
import { myMiddleware } from "../src/";

describe("Middleware Enhancer", () => {
  it("should enhance middleware correctly", () => {
    expect(myMiddleware()).toBe("enhanced");
  });
});
