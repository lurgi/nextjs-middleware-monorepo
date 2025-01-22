import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "NextMiddlewareEnhancer",
      fileName: (format) => `next-middleware-enhancer.${format}.js`,
    },
    rollupOptions: {
      external: ["next"],
    },
  },
});
