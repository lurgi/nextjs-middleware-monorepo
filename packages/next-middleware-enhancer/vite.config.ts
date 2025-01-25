import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    dts({
      entryRoot: "src", // 타입 엔트리 지정
      outDir: "dist",
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "NextMiddlewareEnhancer",
      formats: ["es", "cjs"],
      fileName: (format) => `next-middleware-enhancer.${format}.js`,
    },
    rollupOptions: {
      external: ["next", "next/server"],
    },
  },
});
