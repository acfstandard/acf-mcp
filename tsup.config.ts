import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "transport/stdio": "src/transport/stdio.ts",
    "transport/http": "src/transport/http.ts",
    "lib/rate-limit": "src/lib/rate-limit.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node18",
  tsconfig: "tsconfig.json",
  shims: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
});
