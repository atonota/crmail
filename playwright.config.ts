import { defineConfig } from "@playwright/test";

const executable = (engine: string) =>
  process.env[`CRMAIL_${engine.toUpperCase()}_EXECUTABLE`];
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:45873",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm preview --port 45873 --ignore-lock",
    url: "http://127.0.0.1:45873/crmail/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: ["chromium", "firefox", "webkit"].map((browserName) => ({
    name: browserName,
    use: {
      browserName: browserName as "chromium" | "firefox" | "webkit",
      launchOptions: executable(browserName)
        ? { executablePath: executable(browserName) }
        : {},
    },
  })),
});
