import { defineConfig } from "@playwright/test";

const PORT = 3100;
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: { command: `npx next start -p ${PORT}`, url: `http://127.0.0.1:${PORT}`, reuseExistingServer: !process.env.CI, timeout: 60_000 },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { viewport: { width: 390, height: 800 } } },
  ],
});
