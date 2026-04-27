import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true,
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    cwd: __dirname,
    port: 3100,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
