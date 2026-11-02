import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'ordinateur', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 1000 } } },
    { name: 'retina', use: { ...devices['Desktop Chrome HiDPI'], viewport: { width: 1470, height: 860 } } },
    { name: 'telephone-couche', use: { ...devices['Pixel 7 landscape'] } },
    { name: 'telephone-debout', use: { ...devices['Pixel 7'] } },
  ],
});
