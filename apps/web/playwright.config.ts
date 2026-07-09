import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5180',
    viewport: { width: 1280, height: 800 },
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --port 5180',
    url: 'http://localhost:5180',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
