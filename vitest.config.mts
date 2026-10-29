import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  esbuild: { jsx: "automatic" },
  test: { include: ["tests/unit/**/*.test.{ts,tsx}", "tests/db/**/*.test.ts"], testTimeout: 30_000 },
});
