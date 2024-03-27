import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'
import './src/env'

const PORT = process.env.PORT

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'mnt/auth.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'bun start',
    url: `http://localhost:${PORT}/healthcheck`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      PORT,
    },
  },
})
