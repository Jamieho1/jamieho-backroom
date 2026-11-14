import { defineConfig } from '@playwright/test';
const baseURL = process.env.CONTENT_PREVIEW_TEST_APP || 'http://127.0.0.1:3209';
const api = process.env.CONTENT_PREVIEW_TEST_API;
if (!api || !/^http:\/\/127\.0\.0\.1:\d+$/.test(api) || !/^http:\/\/127\.0\.0\.1:\d+$/.test(baseURL)) {
  throw new Error('Start the disposable loopback API/app and set CONTENT_PREVIEW_TEST_API before running this configuration.');
}
export default defineConfig({
  testDir: './e2e', testMatch: ['content-preview.spec.ts','experience-preview.spec.ts'], workers: 1,
  use: { baseURL, launchOptions: process.env.CONTENT_PREVIEW_CHROMIUM ? { executablePath: process.env.CONTENT_PREVIEW_CHROMIUM } : undefined },
  projects: [{ name: 'desktop', use: { viewport: { width: 1280, height: 800 } } }, { name: 'phone', use: { viewport: { width: 390, height: 800 } } }],
});
