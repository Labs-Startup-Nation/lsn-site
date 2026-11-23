import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4399' },
  webServer: {
    command: 'npm run build && npx astro preview --port 4399 --ignore-lock',
    port: 4399,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { ISSUES_EXTRA: 'tests/fixtures/issues' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
