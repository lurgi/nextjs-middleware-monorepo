import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      entryRoot: "src", // 타입 엔트리 지정
      outDir: "dist", // dist에 index.d.ts 생성
      insertTypesEntry: true, // package.json에 자동으로 `"types"` 필드 추가
      rollupTypes: true, // 타입을 하나로 번들링
      tsconfigPath: "tsconfig.build.json",
    }),
  ],
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
